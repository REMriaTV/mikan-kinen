"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { BroadcastConfig } from "@/lib/broadcast-config";
import {
  REM_GARAGE_BGM_TRACKS,
  REM_GARAGE_CUE_PATHS,
  REM_GARAGE_SE_TRACKS,
  type RemGarageAudioPayload,
} from "@/lib/rem-garage-audio-config";
import type { GarageSyncMode } from "@/lib/rem-garage-audio-constants";

const SESSION_KEY = "garage-rem-music-admin-v1";

export function readGarageMusicAdminSession(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export function writeGarageMusicAdminSession(ok: boolean): void {
  if (typeof window === "undefined") return;
  if (ok) sessionStorage.setItem(SESSION_KEY, "1");
  else sessionStorage.removeItem(SESSION_KEY);
}

type Props = {
  hasJoined: boolean;
  broadcastCfg: BroadcastConfig;
  onBroadcast: (p: RemGarageAudioPayload) => void;
  onUserInteract: () => void;
  syncMode: GarageSyncMode;
  onSyncModeChange: (m: GarageSyncMode) => void;
  masterVolume: number;
  onMasterVolumeChange: (v: number) => void;
  customPublishing: boolean;
  customTrackError: string | null;
};

export default function GarageMusicAdminPanel({
  hasJoined,
  broadcastCfg,
  onBroadcast,
  onUserInteract,
  syncMode,
  onSyncModeChange,
  masterVolume,
  onMasterVolumeChange,
  customPublishing,
  customTrackError,
}: Props) {
  const [expanded, setExpanded] = useState(true);
  const [bgmId, setBgmId] = useState(REM_GARAGE_BGM_TRACKS[0]?.id ?? "");
  const [bgmVol, setBgmVol] = useState(0.45);
  const firedPreRef = useRef(false);
  const firedOpeningRef = useRef(false);
  const firedEndingRef = useRef(false);

  const wrapInteract = useCallback(
    (fn: () => void) => {
      onUserInteract();
      fn();
    },
    [onUserInteract]
  );

  useEffect(() => {
    if (!hasJoined) return;
    const tick = () => {
      const now = Date.now();
      const unlock = broadcastCfg.garageV2.unlockEpochMs;
      const target = broadcastCfg.countdown.targetEpochMs;
      const close = broadcastCfg.garageV2.closeEpochMs;
      const ed = close - 5 * 60 * 1000;
      if (now >= unlock && !firedPreRef.current) {
        firedPreRef.current = true;
        onBroadcast({ t: "cue", id: "pre-broadcast" });
      }
      if (now >= target && !firedOpeningRef.current) {
        firedOpeningRef.current = true;
        onBroadcast({ t: "cue", id: "opening" });
      }
      if (now >= ed && !firedEndingRef.current) {
        firedEndingRef.current = true;
        onBroadcast({ t: "cue", id: "ending" });
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [hasJoined, broadcastCfg, onBroadcast]);

  if (!hasJoined) return null;

  const preAt = new Date(broadcastCfg.garageV2.unlockEpochMs).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const opAt = new Date(broadcastCfg.countdown.targetEpochMs).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const edAt = new Date(broadcastCfg.garageV2.closeEpochMs - 5 * 60 * 1000).toLocaleTimeString(
    "ja-JP",
    { hour: "2-digit", minute: "2-digit" }
  );

  return (
    <div
      className="fixed z-[55] left-2 right-2 md:left-auto md:right-3 md:w-[300px]"
      style={{ bottom: "calc(5.5rem + env(safe-area-inset-bottom))" }}
    >
      {!expanded ? (
        <button
          type="button"
          onClick={() => wrapInteract(() => setExpanded(true))}
          className="float-right w-11 h-11 rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(10,12,15,0.9)] text-lg shadow-lg"
          aria-label="音楽パネルを開く"
        >
          🎵
        </button>
      ) : (
        <div className="rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(10,12,15,0.94)] backdrop-blur-md p-3 shadow-xl text-[0.72rem] text-[rgba(232,228,223,0.88)]">
          <div className="flex items-center justify-between gap-2 mb-2 border-b border-[rgba(255,255,255,0.08)] pb-2">
            <span className="tracking-wide text-[rgba(232,228,223,0.75)]">🎵 音楽コントロール</span>
            <button
              type="button"
              onClick={() => wrapInteract(() => setExpanded(false))}
              className="text-[rgba(232,228,223,0.45)] hover:text-gold px-1"
            >
              −
            </button>
          </div>

          <div className="mb-3 space-y-2 text-[0.65rem]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[rgba(232,228,223,0.45)]">配信方式</span>
              <button
                type="button"
                onClick={() =>
                  wrapInteract(() => onSyncModeChange("customTrack"))
                }
                className={
                  "px-2 py-0.5 rounded border " +
                  (syncMode === "customTrack"
                    ? "border-gold/70 bg-gold/15 text-gold"
                    : "border-[rgba(255,255,255,0.15)] text-[rgba(232,228,223,0.55)]")
                }
              >
                カスタムトラック
              </button>
              <button
                type="button"
                onClick={() => wrapInteract(() => onSyncModeChange("htmlAudio"))}
                className={
                  "px-2 py-0.5 rounded border " +
                  (syncMode === "htmlAudio"
                    ? "border-gold/70 bg-gold/15 text-gold"
                    : "border-[rgba(255,255,255,0.15)] text-[rgba(232,228,223,0.55)]")
                }
              >
                HTML Audio
              </button>
            </div>
            {syncMode === "customTrack" ? (
              <p className="text-[rgba(232,228,223,0.42)] leading-snug">
                Daily 経由で1系統にミックス送信。参加者は remMusic を購読。
                {customPublishing ? (
                  <span className="text-[rgba(224,90,51,0.85)]"> 🔴 配信中</span>
                ) : (
                  <span className="text-[rgba(232,228,223,0.35)]"> （未送信・操作後に開始）</span>
                )}
              </p>
            ) : (
              <p className="text-[rgba(232,228,223,0.42)] leading-snug">
                従来どおり sendAppMessage + 各端末で再生（同期ズレあり）。
              </p>
            )}
            {customTrackError ? (
              <p className="text-[0.62rem] text-[rgba(224,90,51,0.9)]">{customTrackError}</p>
            ) : null}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[rgba(232,228,223,0.45)] shrink-0">マスター</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={masterVolume}
                onChange={(e) => onMasterVolumeChange(Number(e.target.value))}
                className="flex-1 accent-gold"
              />
            </div>
          </div>

          <div className="space-y-2 mb-2">
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 text-left px-2 py-1.5 rounded border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.04)]"
                onClick={() =>
                  wrapInteract(() => onBroadcast({ t: "cue", id: "pre-broadcast" }))
                }
              >
                ▶ 開局前BGM（手動）
              </button>
              <button
                type="button"
                className="shrink-0 px-2 py-1.5 rounded border border-[rgba(224,90,51,0.35)] text-[rgba(224,90,51,0.9)] hover:bg-[rgba(224,90,51,0.08)]"
                title="開局前・OP・ED をすべて停止"
                onClick={() => wrapInteract(() => onBroadcast({ t: "cueStop" }))}
              >
                停止
              </button>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[0.65rem] text-[rgba(232,228,223,0.5)] shrink-0">BGM</label>
              <select
                value={bgmId}
                onChange={(e) => setBgmId(e.target.value)}
                className="flex-1 min-w-0 bg-[rgba(0,0,0,0.45)] border border-[rgba(255,255,255,0.12)] rounded px-1 py-1 text-[0.68rem]"
              >
                {REM_GARAGE_BGM_TRACKS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 px-2 py-1 rounded border border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.05)]"
                onClick={() =>
                  wrapInteract(() =>
                    onBroadcast({ t: "bgm", trackId: bgmId, action: "start", volume: bgmVol })
                  )
                }
              >
                BGM 再生
              </button>
              <button
                type="button"
                className="flex-1 px-2 py-1 rounded border border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.05)]"
                onClick={() =>
                  wrapInteract(() => onBroadcast({ t: "bgm", trackId: bgmId, action: "stop" }))
                }
              >
                BGM 停止
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[0.62rem] text-[rgba(232,228,223,0.45)]">音量</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={bgmVol}
                onChange={(e) => setBgmVol(Number(e.target.value))}
                onPointerUp={(e) => {
                  const v = Number((e.target as HTMLInputElement).value);
                  wrapInteract(() =>
                    onBroadcast({ t: "bgm", trackId: bgmId, action: "volume", volume: v })
                  );
                }}
                className="flex-1 accent-gold"
              />
            </div>
            <button
              type="button"
              className="w-full px-2 py-1 rounded border border-[rgba(255,255,255,0.08)] text-[0.65rem] text-[rgba(232,228,223,0.5)]"
              title="ループBGMに加え、開局前・OP・ED も停止します"
              onClick={() => wrapInteract(() => onBroadcast({ t: "bgm", action: "stopAll" }))}
            >
              全 BGM 停止（キュー音も含む）
            </button>
          </div>

          <p className="text-[0.62rem] text-[rgba(232,228,223,0.4)] mb-1">ジングル</p>
          <div className="flex flex-wrap gap-1 mb-2">
            {REM_GARAGE_SE_TRACKS.map((s) => (
              <button
                key={s.id}
                type="button"
                title={s.label}
                onClick={() => wrapInteract(() => onBroadcast({ t: "se", id: s.id }))}
                className="px-2 py-1 rounded border border-[rgba(255,255,255,0.1)] text-[0.62rem] hover:bg-[rgba(224,90,51,0.12)]"
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mb-2">
            <button
              type="button"
              className="flex-1 py-1.5 rounded border border-gold/40 text-[0.65rem] hover:bg-gold/10"
              onClick={() => wrapInteract(() => onBroadcast({ t: "cue", id: "opening" }))}
            >
              OP 再生
            </button>
            <button
              type="button"
              className="flex-1 py-1.5 rounded border border-gold/40 text-[0.65rem] hover:bg-gold/10"
              onClick={() => wrapInteract(() => onBroadcast({ t: "cue", id: "ending" }))}
            >
              ED 再生
            </button>
            <button
              type="button"
              className="flex-1 py-1.5 rounded border border-[rgba(224,90,51,0.4)] text-[0.65rem] text-[rgba(224,90,51,0.95)] hover:bg-[rgba(224,90,51,0.1)]"
              title="OP・ED・開局前ループを停止"
              onClick={() => wrapInteract(() => onBroadcast({ t: "cueStop" }))}
            >
              OP/ED 停止
            </button>
          </div>

          <p className="text-[0.58rem] text-[rgba(232,228,223,0.35)] leading-relaxed">
            自動: 開局前 {preAt} / OP {opAt} / ED {edAt}（終了5分前）
            <br />
            音源: {REM_GARAGE_CUE_PATHS["pre-broadcast"]} ほか
          </p>
        </div>
      )}
    </div>
  );
}
