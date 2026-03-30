"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import MinogashiBannerCta from "@/components/MinogashiBannerCta";
import {
  defaultBroadcastConfig,
  formatMinogashiBannerLinkText,
  type BroadcastConfig,
} from "@/lib/broadcast-config";

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
  const [cfg, setCfg] = useState<BroadcastConfig>(defaultBroadcastConfig);
  // SSR と hydration 初期を一致させるため、Date.now() は描画に使わない
  const [nowMs, setNowMs] = useState<number>(
    defaultBroadcastConfig.countdown.targetEpochMs
  );

  useEffect(() => {
    setMounted(true);
    setNowMs(Date.now());
    const t = window.setInterval(() => setNowMs(Date.now()), 1000);
    (async () => {
      try {
        const res = await fetch("/api/broadcast-config", {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const json = (await res.json()) as { config?: BroadcastConfig };
        if (json.config) {
          setCfg(json.config);
        }
      } catch {
        // フォールバック値のまま表示する
      }
    })();

    return () => window.clearInterval(t);
  }, []);

  const remainingMs = cfg.countdown.targetEpochMs - nowMs;
  // プレースホルダー表示中は常に "放送前" 扱いにして初期HTML一致を担保
  const isLive = mounted && remainingMs <= 0;
  const countdown = useMemo(() => formatCountdown(remainingMs), [remainingMs]);

  const showMinogashiBannerCta =
    cfg.topPage.minogashiVisible &&
    cfg.topPage.minogashiYoutubeId.trim() !== "" &&
    cfg.topPage.minogashiCtaVariant === "A";
  const minogashiBannerLinkText = formatMinogashiBannerLinkText(
    cfg.topPage.minogashiHeroBadgeLead
  );

  return (
    <section className="bg-[#0D0F12] text-[#E8E4DF] border-b border-[rgba(255,255,255,0.06)]">
      <div className="max-w-[960px] mx-auto px-6 py-6 md:py-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[0.65rem] tracking-[0.45em] uppercase text-[rgba(232,228,223,0.65)]">
              {cfg.countdown.broadcastLabel}
            </p>
            <div className="font-shippori font-bold text-[clamp(1.2rem,3vw,1.8rem)] leading-tight">
              {isLive ? (
                <span className="text-gold">{cfg.countdown.nowChanneling}</span>
              ) : (
                <span>
                  {mounted ? (
                    <>
                      {cfg.countdown.countdownPrefix} {countdown.days}日{" "}
                      {countdown.hours}時間 {countdown.minutes}分{" "}
                      {countdown.seconds}秒 {cfg.countdown.countdownSuffix}
                    </>
                  ) : (
                    <>
                      {cfg.countdown.countdownPrefix} --日 --時間 --分 --秒{" "}
                      {cfg.countdown.countdownSuffix}
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
              ▶ {isLive ? cfg.countdown.remChatLabelAfter : cfg.countdown.remChatLabelBefore}
            </Link>
            <div className="text-[0.75rem] text-[rgba(232,228,223,0.65)]">
              {isLive ? cfg.countdown.remChatNoteAfter : cfg.countdown.remChatNoteBefore}
            </div>
            {showMinogashiBannerCta ? (
              <MinogashiBannerCta linkText={minogashiBannerLinkText} />
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 md:gap-6 items-start">
          <div className="space-y-1 text-[0.9rem] text-[rgba(232,228,223,0.86)] leading-[1.9]">
            <div>{cfg.countdown.eventDate}</div>
            <div>{cfg.countdown.eventTagline}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

