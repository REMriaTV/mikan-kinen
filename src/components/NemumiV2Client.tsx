"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  DailyProvider,
  DailyAudio,
  useDaily,
  useDailyEvent,
} from "@daily-co/daily-react";
import {
  displayDreamName,
  pickNemumiDreamName,
} from "@/lib/dream-names";
import {
  NEMUMI_BGM_TRACKS,
  NEMUMI_HASHIRA_DOKEI,
  NEMUMI_SE_COOLDOWN_MS,
  NEMUMI_SE_TRACKS,
} from "@/lib/nemumi-audio-config";
import type { NemumiAudioPublicPayload } from "@/lib/nemumi-audio-resolve";

function buildDefaultPathMap(): Record<string, string> {
  const m: Record<string, string> = {};
  for (const t of NEMUMI_BGM_TRACKS) m[t.id] = t.path;
  for (const t of NEMUMI_SE_TRACKS) m[t.id] = t.path;
  m.hashira = NEMUMI_HASHIRA_DOKEI;
  return m;
}

const NEMUMI_ROOM_URL = "https://remreal-tv.daily.co/nemumi-room";
const CHAT_ROOM_KEY = "nemumi-room";
const PASS_OK_KEY = "nemumi-v2-pass-ok";

const COPY = {
  PLACEHOLDER_CHAT: "寝言をつづる",
  SEND_BUTTON: "zzZ",
  BTN_MUTE_OFF: "ROM",
  BTN_MUTE_ON: "REM",
  BTN_LEAVE: "覚醒",
  LABEL_PASSPHRASE: "合言葉",
  PLACEHOLDER_PASSPHRASE: "会の合言葉を入力",
  JOIN_SELF: "また一人、眠りに入ったよ",
  JOIN_OTHER: "また一人、眠りに入ったよ",
} as const;

type ChatMessage = {
  id: string;
  from: string;
  text: string;
  timestamp: number;
  system?: boolean;
};

type NemumiAudioPayload =
  | { t: "bgm"; trackId: string; action: "start" | "stop" | "volume"; volume?: number }
  | { t: "bgm"; action: "stopAll" }
  | { t: "se"; id: string };

function mapRowToChatMessage(row: {
  id: string;
  from_name: string;
  body: string;
  is_system: boolean;
  created_at: string;
}): ChatMessage {
  return {
    id: row.id,
    from: row.from_name,
    text: row.body,
    timestamp: new Date(row.created_at).getTime(),
    system: row.is_system,
  };
}

function NemumiV2Inner() {
  const daily = useDaily();
  const [joined, setJoined] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [passphraseRequired, setPassphraseRequired] = useState(false);
  const [passphraseOk, setPassphraseOk] = useState(false);
  const [passphraseInput, setPassphraseInput] = useState("");
  const [passphraseError, setPassphraseError] = useState<string | null>(null);
  const [configReady, setConfigReady] = useState(false);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());
  const announcedJoinIdsRef = useRef<Set<string>>(new Set());
  const bgmAudioMapRef = useRef<Partial<Record<string, HTMLAudioElement>>>({});
  const [bgmLocalState, setBgmLocalState] = useState<Record<string, { on: boolean; vol: number }>>(
    () =>
      Object.fromEntries(
        NEMUMI_BGM_TRACKS.map((x) => [x.id, { on: false, vol: 0.6 }])
      ) as Record<string, { on: boolean; vol: number }>
  );
  const seCooldownRef = useRef<Record<string, number>>({});
  const [, forceSeCooldownTick] = useState(0);
  const audioUnlockedRef = useRef(false);
  const lastHashiraSlotRef = useRef<string | null>(null);
  const pathByTrackIdRef = useRef<Record<string, string>>(buildDefaultPathMap());
  const [resolvedAudio, setResolvedAudio] = useState<NemumiAudioPublicPayload | null>(null);

  useEffect(() => {
    fetch("/api/nemumi-audio")
      .then((r) => r.json())
      .then((payload: NemumiAudioPublicPayload) => {
        const m = { ...buildDefaultPathMap() };
        for (const t of [...payload.bgm, ...payload.se, ...payload.interactive]) {
          m[t.id] = t.path;
        }
        if (payload.hashiraDokei) m.hashira = payload.hashiraDokei;
        pathByTrackIdRef.current = m;
        setResolvedAudio(payload);
      })
      .catch(() => {
        /* 既定パスのまま */
      });
  }, []);

  const bgmList = useMemo(() => {
    if (resolvedAudio?.bgm?.length) return resolvedAudio.bgm;
    return NEMUMI_BGM_TRACKS.map((t) => ({ id: t.id, label: t.label, path: t.path }));
  }, [resolvedAudio]);

  const seButtonList = useMemo(() => {
    if (resolvedAudio?.se?.length) return resolvedAudio.se;
    return NEMUMI_SE_TRACKS.filter((x) => x.id !== "neiki").map((t) => ({
      id: t.id,
      label: t.label,
      path: t.path,
    }));
  }, [resolvedAudio]);

  const myDreamName = useMemo(
    () => resolvedName || "（未設定）",
    [resolvedName]
  );
  const displayLabel = useMemo(() => displayDreamName(myDreamName), [myDreamName]);

  const unlockAudioContext = useCallback(() => {
    audioUnlockedRef.current = true;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/nemumi-v2/config");
        const j = (await r.json()) as { passphraseRequired?: boolean };
        if (cancelled) return;
        const req = j.passphraseRequired === true;
        setPassphraseRequired(req);
        if (!req) setPassphraseOk(true);
        else if (typeof window !== "undefined" && sessionStorage.getItem(PASS_OK_KEY) === "1") {
          setPassphraseOk(true);
        }
      } catch {
        if (!cancelled) setPassphraseOk(true);
      } finally {
        if (!cancelled) setConfigReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useDailyEvent(
    "joined-meeting",
    useCallback(() => {
      setJoined(true);
      if (daily) setIsAudioOn(daily.localAudio());
    }, [daily])
  );

  useDailyEvent(
    "left-meeting",
    useCallback(() => {
      setJoined(false);
      setIsAudioOn(false);
      setHasJoined(false);
      setResolvedName(null);
      setChatInput("");
      setChatMessages([]);
      seenMessageIdsRef.current.clear();
      announcedJoinIdsRef.current.clear();
    }, [])
  );

  const applyBgmPayload = useCallback((p: NemumiAudioPayload) => {
    if (p.t === "se") {
      const tr = NEMUMI_SE_TRACKS.find((x) => x.id === p.id);
      if (!tr) return;
      const url = pathByTrackIdRef.current[p.id] ?? tr.path;
      const a = new Audio(url);
      a.volume = 0.75;
      a.play().catch(() => {});
      return;
    }
    if (p.t === "bgm" && p.action === "stopAll") {
      const map = bgmAudioMapRef.current;
      for (const k of Object.keys(map)) {
        map[k]?.pause();
        map[k] = undefined;
      }
      setBgmLocalState(
        Object.fromEntries(
          NEMUMI_BGM_TRACKS.map((x) => [x.id, { on: false, vol: 0.6 }])
        ) as Record<string, { on: boolean; vol: number }>
      );
      return;
    }
    if (p.t === "bgm" && "trackId" in p) {
      const meta = NEMUMI_BGM_TRACKS.find((x) => x.id === p.trackId);
      if (!meta) return;
      const map = bgmAudioMapRef.current;
      if (p.action === "stop") {
        map[p.trackId]?.pause();
        map[p.trackId] = undefined;
        setBgmLocalState((prev) => ({
          ...prev,
          [p.trackId]: { ...prev[p.trackId], on: false, vol: prev[p.trackId]?.vol ?? 0.6 },
        }));
        return;
      }
      if (p.action === "volume" && typeof p.volume === "number") {
        const el = map[p.trackId];
        if (el) el.volume = Math.max(0, Math.min(1, p.volume));
        setBgmLocalState((prev) => ({
          ...prev,
          [p.trackId]: {
            on: prev[p.trackId]?.on ?? false,
            vol: p.volume ?? 0.6,
          },
        }));
        return;
      }
      if (p.action === "start") {
        const src = pathByTrackIdRef.current[p.trackId] ?? meta.path;
        let el = map[p.trackId];
        if (!el) {
          el = new Audio(src);
          el.loop = true;
          map[p.trackId] = el;
        } else {
          el.src = src;
        }
        el.volume = typeof p.volume === "number" ? p.volume : 0.55;
        el.play().catch(() => {});
        setBgmLocalState((prev) => ({
          ...prev,
          [p.trackId]: { on: true, vol: el?.volume ?? 0.55 },
        }));
      }
    }
  }, []);

  useDailyEvent(
    "app-message",
    useCallback(
      (ev: { data?: unknown }) => {
        const raw = ev?.data;
        if (!raw || typeof raw !== "object") return;
        const d = raw as Record<string, unknown>;
        if (d.kind === "nemumiAudio" && d.payload && typeof d.payload === "object") {
          applyBgmPayload(d.payload as NemumiAudioPayload);
          return;
        }
        if (d.kind !== "chat") return;
        const bodyText = d.text;
        if (typeof bodyText !== "string") return;
        const mid = typeof d.id === "string" && d.id ? d.id : null;
        if (mid && seenMessageIdsRef.current.has(mid)) return;
        if (mid) seenMessageIdsRef.current.add(mid);
        const from =
          typeof d.fromName === "string" && d.fromName.trim() ? d.fromName.trim() : "guest";
        setChatMessages((prev) => [
          ...prev,
          {
            id: mid ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            from,
            text: bodyText,
            timestamp: Date.now(),
          },
        ]);
      },
      [applyBgmPayload]
    )
  );

  useDailyEvent(
    "participant-joined",
    useCallback((ev) => {
      const p = ev?.participant;
      if (!p || p.local === true) return;
      const pid = String(p.user_id ?? "");
      if (!pid || announcedJoinIdsRef.current.has(pid)) return;
      announcedJoinIdsRef.current.add(pid);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `join-${pid}-${Date.now()}`,
          from: "REM",
          text: COPY.JOIN_OTHER,
          timestamp: Date.now(),
          system: true,
        },
      ]);
    }, [])
  );

  const broadcastAudio = useCallback(
    (payload: NemumiAudioPayload) => {
      if (!daily) return;
      try {
        daily.sendAppMessage({ kind: "nemumiAudio", payload }, "*");
      } catch {
        /* ignore */
      }
      applyBgmPayload(payload);
    },
    [daily, applyBgmPayload]
  );

  const handleJoin = async () => {
    if (!daily || hasJoined) return;
    unlockAudioContext();
    if (passphraseRequired && !passphraseOk) {
      if (!passphraseInput.trim()) {
        setPassphraseError("合言葉を入力してください");
        return;
      }
      setPassphraseError(null);
      try {
        const r = await fetch("/api/nemumi-v2/verify-passphrase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ passphrase: passphraseInput.trim() }),
        });
        const j = (await r.json()) as { ok?: boolean };
        if (!j.ok) {
          setPassphraseError("合言葉が違います");
          return;
        }
        if (typeof window !== "undefined") sessionStorage.setItem(PASS_OK_KEY, "1");
        setPassphraseOk(true);
      } catch {
        setPassphraseError("確認に失敗しました");
        return;
      }
    }
    const name = pickNemumiDreamName();
    try {
      await daily.join({
        url: NEMUMI_ROOM_URL,
        userName: name,
        startAudioOff: true,
        startVideoOff: true,
      });
      setHasJoined(true);
      setResolvedName(name);
      setIsAudioOn(false);
      let historyRows: ChatMessage[] = [];
      try {
        const r = await fetch(
          `/api/garage-chat?room_key=${encodeURIComponent(CHAT_ROOM_KEY)}&limit=200`
        );
        const j = (await r.json()) as {
          messages?: Array<{
            id: string;
            from_name: string;
            body: string;
            is_system: boolean;
            created_at: string;
          }>;
        };
        if (j.messages?.length) {
          seenMessageIdsRef.current.clear();
          for (const m of j.messages) {
            seenMessageIdsRef.current.add(m.id);
          }
          historyRows = j.messages.map(mapRowToChatMessage);
        }
      } catch {
        /* ignore */
      }
      const selfJoin: ChatMessage = {
        id: `join-self-${Date.now()}`,
        from: "REM",
        text: COPY.JOIN_SELF,
        timestamp: Date.now(),
        system: true,
      };
      setChatMessages([...historyRows, selfJoin]);
    } catch {
      /* join failed */
    }
  };

  const sendNemumiChat = async (text: string, isSystem = false) => {
    if (!daily) return;
    let serverId: string | undefined;
    try {
      const r = await fetch("/api/garage-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomKey: CHAT_ROOM_KEY,
          fromName: myDreamName,
          body: text,
          isSystem,
        }),
      });
      const j = (await r.json()) as { message?: { id?: string } };
      if (j.message?.id) serverId = j.message.id;
    } catch {
      /* ignore */
    }
    if (serverId) seenMessageIdsRef.current.add(serverId);
    const localId = serverId ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setChatMessages((prev) => {
      if (serverId && prev.some((m) => m.id === serverId)) return prev;
      return [
        ...prev,
        {
          id: localId,
          from: isSystem ? "REM" : myDreamName,
          text,
          timestamp: Date.now(),
          system: isSystem,
        },
      ];
    });
    try {
      await daily.sendAppMessage(
        {
          kind: "chat",
          id: serverId,
          text,
          fromName: isSystem ? "REM" : myDreamName,
        },
        "*"
      );
    } catch {
      /* ignore */
    }
  };

  const handleSend = async () => {
    if (!daily) return;
    const text = chatInput.trim() || COPY.SEND_BUTTON;
    setChatInput("");
    await sendNemumiChat(text, false);
    broadcastAudio({ t: "se", id: "neiki" });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleToggleMute = () => {
    if (!daily) return;
    const next = !daily.localAudio();
    if (next) {
      try {
        daily.setLocalAudio(true);
        setIsAudioOn(true);
      } catch {
        setIsAudioOn(false);
      }
    } else {
      daily.setLocalAudio(false, { forceDiscardTrack: true } as { forceDiscardTrack: boolean });
      setIsAudioOn(false);
    }
  };

  const handleLeave = () => {
    if (!daily) return;
    daily.leave();
    setJoined(false);
    setIsAudioOn(false);
    setHasJoined(false);
    setResolvedName(null);
    setChatInput("");
    setChatMessages([]);
    seenMessageIdsRef.current.clear();
    announcedJoinIdsRef.current.clear();
  };

  const canFireSe = (id: string) => {
    const until = seCooldownRef.current[id] ?? 0;
    return Date.now() >= until;
  };

  const fireSe = (id: string) => {
    if (!canFireSe(id)) return;
    seCooldownRef.current[id] = Date.now() + NEMUMI_SE_COOLDOWN_MS;
    forceSeCooldownTick((n) => n + 1);
    broadcastAudio({ t: "se", id });
  };

  const toggleBgm = (trackId: string) => {
    const st = bgmLocalState[trackId];
    const on = st?.on ?? false;
    if (on) {
      broadcastAudio({ t: "bgm", trackId, action: "stop" });
    } else {
      const vol = st?.vol ?? 0.55;
      broadcastAudio({ t: "bgm", trackId, action: "start", volume: vol });
    }
  };

  const setBgmVolume = (trackId: string, vol: number) => {
    broadcastAudio({ t: "bgm", trackId, action: "volume", volume: vol });
  };

  const stopAllBgm = () => {
    broadcastAudio({ t: "bgm", action: "stopAll" });
  };

  /** 柱時計（任意）— Asia/Tokyo。:30 は1回、:00 は時刻相当回（0時は12回） */
  useEffect(() => {
    if (!hasJoined || !audioUnlockedRef.current) return;
    const jstParts = (d: Date) => {
      const s = d.toLocaleString("sv-SE", { timeZone: "Asia/Tokyo" });
      const timePart = s.split(" ")[1] ?? "0:0:0";
      const [hh, mm] = timePart.split(":").map((x) => parseInt(x, 10));
      return { h: Number.isFinite(hh) ? hh : 0, m: Number.isFinite(mm) ? mm : 0 };
    };
    const tick = () => {
      const { h, m } = jstParts(new Date());
      const slot = `${h}:${m}`;
      if (m !== 0 && m !== 30) return;
      if (lastHashiraSlotRef.current === slot) return;
      lastHashiraSlotRef.current = slot;
      const playOnce = () => {
        const url = pathByTrackIdRef.current.hashira ?? NEMUMI_HASHIRA_DOKEI;
        const a = new Audio(url);
        a.volume = 0.4;
        a.play().catch(() => {});
      };
      if (m === 30) {
        playOnce();
        return;
      }
      const count = h % 12 === 0 ? 12 : h % 12;
      for (let i = 0; i < count; i++) {
        window.setTimeout(playOnce, i * 900);
      }
    };
    const id = window.setInterval(tick, 15000);
    tick();
    return () => window.clearInterval(id);
  }, [hasJoined]);

  if (!hasJoined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-10 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(8,10,13,0.65)] backdrop-blur-md max-w-md mx-auto">
        <h2 className="text-[1rem] text-[rgba(232,228,223,0.85)] tracking-[0.2em] mb-4">
          ねむみ
        </h2>
        <p className="text-[0.82rem] text-[rgba(232,228,223,0.55)] text-center mb-6 leading-relaxed">
          合言葉が必要な回は入力のうえ、「眠りに入る」を押してください。
          <br />
          D.N. は自動で夢から渡されます。
        </p>
        {passphraseRequired && !passphraseOk && (
          <div className="w-full space-y-1 text-left mb-4">
            <label className="block text-[0.75rem] text-[rgba(255,255,255,0.55)]">
              {COPY.LABEL_PASSPHRASE}
            </label>
            <input
              type="password"
              autoComplete="off"
              value={passphraseInput}
              onChange={(e) => {
                setPassphraseInput(e.target.value);
                setPassphraseError(null);
              }}
              placeholder={COPY.PLACEHOLDER_PASSPHRASE}
              className="w-full bg-[rgba(0,0,0,0.45)] border border-[rgba(255,255,255,0.12)] rounded-md px-3 py-2 text-[0.88rem] text-[#E8E4DF] outline-none focus:border-[rgba(224,90,51,0.45)]"
            />
            {passphraseError && (
              <p className="text-[0.72rem] text-[rgba(224,90,51,0.85)]">{passphraseError}</p>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={() => void handleJoin()}
          disabled={!configReady}
          className="w-full px-4 py-3 text-[0.85rem] tracking-[0.22em] bg-[rgba(224,90,51,0.25)] text-[#E8E4DF] border border-[rgba(224,90,51,0.4)] rounded-full hover:bg-[rgba(224,90,51,0.35)] transition-colors disabled:opacity-40"
        >
          {configReady ? "眠りに入る" : "準備中…"}
        </button>
        <Link
          href="/"
          className="mt-6 text-[0.78rem] text-[rgba(232,228,223,0.45)] hover:text-[rgba(224,90,51,0.8)]"
        >
          ← トップへ
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-[100dvh]">
      <header className="shrink-0 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(8,10,13,0.72)] backdrop-blur-md px-4 py-3">
        <div className="flex items-center justify-between gap-3 max-w-[960px] mx-auto">
          <div className="min-w-0">
            <p className="text-[0.6rem] tracking-[0.35em] text-[rgba(232,228,223,0.4)]">
              NEMUMI
            </p>
            <p className="text-[0.68rem] text-[rgba(232,228,223,0.45)] truncate">
              D.N. <span className="text-[rgba(232,228,223,0.65)]">{displayLabel}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleToggleMute}
              className="px-2.5 py-1.5 rounded-full border border-[rgba(255,255,255,0.15)] text-[0.65rem] text-[rgba(232,228,223,0.85)]"
            >
              {isAudioOn ? COPY.BTN_MUTE_ON : COPY.BTN_MUTE_OFF}
            </button>
            <button
              type="button"
              onClick={handleLeave}
              className="px-2.5 py-1.5 rounded-full border border-[rgba(255,255,255,0.15)] text-[0.65rem]"
            >
              {COPY.BTN_LEAVE}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 pb-[320px] md:pb-40 space-y-3 max-w-[960px] mx-auto w-full">
        <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-3">
          <p className="text-[0.65rem] text-[rgba(232,228,223,0.45)] mb-2">
            効果音（クールダウン {Math.round(NEMUMI_SE_COOLDOWN_MS / 1000)} 秒）
          </p>
          <div className="flex flex-wrap gap-1.5">
            {seButtonList.map((se) => {
              const ok = canFireSe(se.id);
              return (
                <button
                  key={se.id}
                  type="button"
                  disabled={!ok}
                  onClick={() => fireSe(se.id)}
                  className={
                    "text-[0.62rem] px-2 py-1 rounded border transition-opacity " +
                    (ok
                      ? "border-[rgba(224,90,51,0.35)] text-[rgba(232,228,223,0.8)] hover:bg-[rgba(224,90,51,0.12)]"
                      : "border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.25)] opacity-50 cursor-not-allowed")
                  }
                >
                  {se.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-[rgba(224,90,51,0.15)] bg-[rgba(224,90,51,0.04)] p-3">
          <p className="text-[0.65rem] text-[rgba(232,228,223,0.5)] mb-2">
            環境BGMミキサー（操作者・全員に音のみ同期）
          </p>
          <div className="space-y-2">
            {bgmList.map((tr) => {
              const st = bgmLocalState[tr.id] ?? { on: false, vol: 0.6 };
              return (
                <div key={tr.id} className="flex flex-wrap items-center gap-2 text-[0.7rem]">
                  <button
                    type="button"
                    onClick={() => toggleBgm(tr.id)}
                    className={
                      "px-2 py-0.5 rounded border " +
                      (st.on
                        ? "border-[rgba(224,90,51,0.6)] bg-[rgba(224,90,51,0.15)]"
                        : "border-[rgba(255,255,255,0.12)]")
                    }
                  >
                    {st.on ? "ON" : "OFF"}
                  </button>
                  <span className="text-[rgba(232,228,223,0.65)] flex-1 min-w-[6rem]">{tr.label}</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={st.vol}
                    onChange={(e) => setBgmVolume(tr.id, parseFloat(e.target.value))}
                    className="w-24 accent-[#E05A33]"
                  />
                </div>
              );
            })}
            <button
              type="button"
              onClick={stopAllBgm}
              className="text-[0.65rem] mt-1 text-[rgba(232,228,223,0.5)] underline"
            >
              全トラック停止
            </button>
          </div>
        </div>

        <div className="space-y-2 text-[0.82rem]">
          {[...chatMessages].reverse().map((msg) => {
            if (msg.system) {
              return (
                <div
                  key={msg.id}
                  className="text-center text-[0.72rem] text-[rgba(232,228,223,0.38)] py-1"
                >
                  {msg.text}
                </div>
              );
            }
            return (
              <div key={msg.id} className="flex gap-2 items-baseline">
                <span className="shrink-0 text-[0.68rem] text-[rgba(232,228,223,0.45)] w-28 truncate">
                  {displayDreamName(msg.from)}:
                </span>
                <span className="px-2.5 py-1 rounded-md border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.04)] text-[rgba(232,228,223,0.88)] break-words">
                  {msg.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="fixed left-0 right-0 bottom-0 z-40 border-t border-[rgba(255,255,255,0.08)] bg-[rgba(8,10,13,0.88)] backdrop-blur-md px-3 py-3"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="max-w-[960px] mx-auto flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            rows={1}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder={COPY.PLACEHOLDER_CHAT}
            className="flex-1 min-w-0 bg-[rgba(0,0,0,0.35)] border border-[rgba(255,255,255,0.1)] rounded-md text-[16px] md:text-[0.85rem] px-3 py-2 outline-none focus:border-[rgba(224,90,51,0.35)] resize-none text-[#E8E4DF]"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            className="shrink-0 px-4 py-2 text-[0.78rem] tracking-[0.15em] border border-[rgba(224,90,51,0.45)] text-[#E8E4DF] rounded-md hover:bg-[rgba(224,90,51,0.15)]"
          >
            {COPY.SEND_BUTTON}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NemumiV2Client() {
  return (
    <DailyProvider url={NEMUMI_ROOM_URL}>
      <div className="min-h-[100dvh] flex flex-col nemumi-breathe text-[#E8E4DF]">
        <DailyAudio />
        <NemumiV2Inner />
      </div>
    </DailyProvider>
  );
}
