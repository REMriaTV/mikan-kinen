import type { DailyCall } from "@daily-co/daily-js";
import {
  REM_GARAGE_BGM_TRACKS,
  REM_GARAGE_CUE_PATHS,
  REM_GARAGE_SE_TRACKS,
  type RemGarageAudioPayload,
} from "@/lib/rem-garage-audio-config";
import { REM_GARAGE_CUSTOM_TRACK_NAME } from "@/lib/rem-garage-audio-constants";

const sePathById = Object.fromEntries(REM_GARAGE_SE_TRACKS.map((s) => [s.id, s.path])) as Record<
  string,
  string
>;

/**
 * 管理者のみ: Web Audio で BGM / SE / キューを1つの MediaStream にミックスし、
 * Daily.co startCustomTrack に流すためのルーター。
 */
export class RemGarageAudioRouter {
  readonly context: AudioContext;
  private readonly destination: MediaStreamAudioDestinationNode;
  private readonly masterGain: GainNode;
  private readonly gains: { bgm: GainNode; se: GainNode; music: GainNode };
  private publishing = false;

  private bgmEls = new Map<string, HTMLAudioElement>();
  private cuePreEl: HTMLAudioElement | null = null;

  constructor() {
    const ctx = new AudioContext();
    this.context = ctx;
    this.destination = ctx.createMediaStreamDestination();
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0.85;
    this.masterGain.connect(this.destination);
    this.gains = {
      bgm: ctx.createGain(),
      se: ctx.createGain(),
      music: ctx.createGain(),
    };
    this.gains.bgm.gain.value = 1;
    this.gains.se.gain.value = 1;
    this.gains.music.gain.value = 1;
    this.gains.bgm.connect(this.masterGain);
    this.gains.se.connect(this.masterGain);
    this.gains.music.connect(this.masterGain);
    /** 管理者のローカルスピーカーでもミックスをモニタリング */
    this.masterGain.connect(this.context.destination);
  }

  async resume(): Promise<void> {
    if (this.context.state === "suspended") {
      await this.context.resume();
    }
  }

  getMusicMediaStreamTrack(): MediaStreamTrack | null {
    const tracks = this.destination.stream.getAudioTracks();
    return tracks[0] ?? null;
  }

  setMasterVolume(v: number): void {
    const x = Math.max(0, Math.min(1, v));
    this.masterGain.gain.value = x;
  }

  setChannelVolume(channel: "bgm" | "se" | "music", v: number): void {
    const x = Math.max(0, Math.min(1, v));
    this.gains[channel].gain.value = x;
  }

  private ensureBgmElement(trackId: string, url: string): HTMLAudioElement {
    let el = this.bgmEls.get(trackId);
    if (!el) {
      el = new Audio();
      el.crossOrigin = "anonymous";
      el.loop = true;
      const src = this.context.createMediaElementSource(el);
      src.connect(this.gains.bgm);
      this.bgmEls.set(trackId, el);
    }
    const nextAbs =
      typeof window !== "undefined"
        ? new URL(url, window.location.origin).href
        : url;
    if (!el.src || el.src !== nextAbs) {
      el.pause();
      el.src = url;
      el.load();
    }
    return el;
  }

  private stopAllBgmElements(): void {
    for (const el of this.bgmEls.values()) {
      try {
        el.pause();
        el.currentTime = 0;
      } catch {
        /* ignore */
      }
    }
  }

  private stopCuePre(): void {
    if (this.cuePreEl) {
      try {
        this.cuePreEl.pause();
        this.cuePreEl.currentTime = 0;
      } catch {
        /* ignore */
      }
    }
  }

  async applyPayload(p: RemGarageAudioPayload): Promise<void> {
    await this.resume();

    if (p.t === "se") {
      const path = sePathById[p.id];
      if (!path) return;
      const el = new Audio(path);
      el.crossOrigin = "anonymous";
      const src = this.context.createMediaElementSource(el);
      src.connect(this.gains.se);
      el.addEventListener(
        "ended",
        () => {
          try {
            src.disconnect();
          } catch {
            /* ignore */
          }
        },
        { once: true }
      );
      el.play().catch(() => {});
      return;
    }

    if (p.t === "cue") {
      const path = REM_GARAGE_CUE_PATHS[p.id];
      if (!path) return;
      if (p.id === "pre-broadcast") {
        if (!this.cuePreEl) {
          const el = new Audio(path);
          el.crossOrigin = "anonymous";
          el.loop = true;
          const src = this.context.createMediaElementSource(el);
          src.connect(this.gains.music);
          this.cuePreEl = el;
        }
        this.cuePreEl.volume = 1;
        await this.cuePreEl.play().catch(() => {});
        return;
      }
      if (p.id === "opening") {
        this.stopCuePre();
        const el = new Audio(path);
        el.crossOrigin = "anonymous";
        const src = this.context.createMediaElementSource(el);
        src.connect(this.gains.music);
        el.addEventListener(
          "ended",
          () => {
            try {
              src.disconnect();
            } catch {
              /* ignore */
            }
          },
          { once: true }
        );
        await el.play().catch(() => {});
        return;
      }
      if (p.id === "ending") {
        const el = new Audio(path);
        el.crossOrigin = "anonymous";
        const src = this.context.createMediaElementSource(el);
        src.connect(this.gains.music);
        el.addEventListener(
          "ended",
          () => {
            try {
              src.disconnect();
            } catch {
              /* ignore */
            }
          },
          { once: true }
        );
        await el.play().catch(() => {});
      }
      return;
    }

    if (p.t === "bgm" && p.action === "stopAll") {
      this.stopAllBgmElements();
      this.stopCuePre();
      this.cuePreEl = null;
      return;
    }

    if (p.t === "bgm" && "trackId" in p) {
      const meta = REM_GARAGE_BGM_TRACKS.find((x) => x.id === p.trackId);
      if (!meta) return;
      if (p.action === "stop") {
        const el = this.bgmEls.get(p.trackId);
        if (el) {
          el.pause();
          el.currentTime = 0;
        }
        return;
      }
      if (p.action === "volume") {
        const el = this.bgmEls.get(p.trackId);
        if (el && typeof p.volume === "number") {
          el.volume = Math.max(0, Math.min(1, p.volume));
        }
        return;
      }
      if (p.action === "start") {
        const el = this.ensureBgmElement(p.trackId, meta.path);
        el.loop = true;
        el.volume = typeof p.volume === "number" ? p.volume : 0.45;
        await el.play().catch(() => {});
      }
    }
  }

  /**
   * Daily にカスタムトラックを1本だけ送信（既に送信中なら何もしない）。
   */
  async ensureCustomTrackPublishing(daily: DailyCall): Promise<boolean> {
    await this.resume();
    const track = this.getMusicMediaStreamTrack();
    if (!track) return false;
    if (this.publishing) return true;
    try {
      await daily.startCustomTrack({
        track,
        trackName: REM_GARAGE_CUSTOM_TRACK_NAME,
        mode: "music",
      });
      this.publishing = true;
      return true;
    } catch {
      return false;
    }
  }

  async stopCustomTrackPublishing(daily: DailyCall): Promise<void> {
    if (!this.publishing) return;
    try {
      await daily.stopCustomTrack(REM_GARAGE_CUSTOM_TRACK_NAME);
    } catch {
      /* ignore */
    }
    this.publishing = false;
  }

  isPublishing(): boolean {
    return this.publishing;
  }

  dispose(): void {
    this.stopAllBgmElements();
    this.stopCuePre();
    try {
      void this.context.close();
    } catch {
      /* ignore */
    }
  }
}
