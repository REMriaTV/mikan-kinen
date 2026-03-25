"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const COPY = {
  COUNTDOWN_PREFIX: "あと",
  COUNTDOWN_SUFFIX: "",
  NOW_CHANNELING: "Now Channeling...",
  BROADCAST_LABEL: "2026.3.30 BROADCAST",
  REM_CHAT_LABEL_BEFORE: "REM Chat（3/30 22:00 に開局）",
  REM_CHAT_LABEL_AFTER: "REM Chat に入る",
  REM_CHAT_NOTE_BEFORE:
    "開始5分前になると、夢の世界がひらきます。",
  REM_CHAT_NOTE_AFTER: "交信を開始できます。",
  EVENT_DATE: "2026年3月30日（月）22:00〜",
  EVENT_TAGLINE: "月曜の夜は夢テレ。",
} as const;

// 2026-03-30 22:00:00 JST = 2026-03-30T13:00:00Z
const TARGET_EPOCH_MS = Date.parse("2026-03-30T13:00:00Z");

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

export default function BroadcastCountdownBanner() {
  const [mounted, setMounted] = useState(false);
  // SSR と hydration 初期を一致させるため、Date.now() は描画に使わない
  const [nowMs, setNowMs] = useState<number>(TARGET_EPOCH_MS);

  useEffect(() => {
    setMounted(true);
    setNowMs(Date.now());
    const t = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const remainingMs = TARGET_EPOCH_MS - nowMs;
  // プレースホルダー表示中は常に "放送前" 扱いにして初期HTML一致を担保
  const isLive = mounted && remainingMs <= 0;
  const countdown = useMemo(() => formatCountdown(remainingMs), [remainingMs]);

  return (
    <section className="bg-[#0D0F12] text-[#E8E4DF] border-b border-[rgba(255,255,255,0.06)]">
      <div className="max-w-[960px] mx-auto px-6 py-6 md:py-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[0.65rem] tracking-[0.45em] uppercase text-[rgba(232,228,223,0.65)]">
              {COPY.BROADCAST_LABEL}
            </p>
            <div className="font-shippori font-bold text-[clamp(1.2rem,3vw,1.8rem)] leading-tight">
              {isLive ? (
                <span className="text-gold">{COPY.NOW_CHANNELING}</span>
              ) : (
                <span>
                  {mounted ? (
                    <>
                      {COPY.COUNTDOWN_PREFIX} {countdown.days}日 {countdown.hours}時間{" "}
                      {countdown.minutes}分 {countdown.seconds}秒
                      {COPY.COUNTDOWN_SUFFIX}
                    </>
                  ) : (
                    <>
                      {COPY.COUNTDOWN_PREFIX} --日 --時間 --分 --秒
                      {COPY.COUNTDOWN_SUFFIX}
                    </>
                  )}
                </span>
              )}
            </div>
          </div>

          <div className="md:text-right space-y-2">
            <Link
              href="/garage-v2"
              className={
                "inline-block text-[0.8rem] tracking-[0.25em] px-6 py-3 border transition-all " +
                (isLive
                  ? "bg-gold text-deep border-gold hover:bg-transparent hover:text-gold"
                  : "bg-[rgba(255,255,255,0.04)] text-[#E8E4DF] border-[rgba(255,255,255,0.18)] hover:border-gold")
              }
            >
              ▶ {isLive ? COPY.REM_CHAT_LABEL_AFTER : COPY.REM_CHAT_LABEL_BEFORE}
            </Link>
            <div className="text-[0.75rem] text-[rgba(232,228,223,0.65)]">
              {isLive ? COPY.REM_CHAT_NOTE_AFTER : COPY.REM_CHAT_NOTE_BEFORE}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 md:gap-6 items-start">
          <div className="space-y-1 text-[0.9rem] text-[rgba(232,228,223,0.86)] leading-[1.9]">
            <div>{COPY.EVENT_DATE}</div>
            <div>{COPY.EVENT_TAGLINE}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

