"use client";

import React, { useState } from "react";

const NEMUMI_ROOM_URL = "https://remreal-tv.daily.co/nemumi-room";

export default function NemumiRoom() {
  const [started, setStarted] = useState(false);
  const [volume, setVolume] = useState(1);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setStarted(true)}
        className="px-6 py-2 text-[0.8rem] tracking-[0.25em] bg-gold text-deep border border-gold hover:bg-transparent hover:text-gold transition-colors"
      >
        受信をはじめる
      </button>
      <div className="flex items-center gap-3 text-[0.8rem] text-dim">
        <span>ねむみ音量</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="flex-1"
        />
        <span className="w-10 text-right">{Math.round(volume * 100)}%</span>
      </div>
      <p className="text-[0.75rem] text-dim">
        このページでは映像やチャットは表示しません。音だけを小さく流して、まどろみながら聴いてください。
      </p>
      <p className="text-[0.7rem] text-[rgba(255,255,255,0.4)]">
        接続状態：{started ? "受信中（ねむみルーム参加）" : "待機中"}
      </p>

      <div
        className="mt-4"
        style={{
          height: "60px",
          overflow: "hidden",
          borderRadius: "8px",
        }}
      >
        <iframe
          src={NEMUMI_ROOM_URL}
          allow="camera; microphone; autoplay; encrypted-media; fullscreen"
          title="Nemumi Audio Room"
          className="w-full"
          style={{
            border: "none",
            height: "260px",
            transform: "translateY(-200px)",
            opacity: started ? 1 : 0.15,
            pointerEvents: started ? "auto" : "none",
          }}
        />
      </div>
    </div>
  );
}


