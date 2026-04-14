"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import HeaderAnnouncementsPanel from "@/components/HeaderAnnouncementsPanel";
import MinogashiBannerCta from "@/components/MinogashiBannerCta";
import type { SiteAnnouncementRow } from "@/lib/site-announcements";
import {
  defaultBroadcastConfig,
  formatMinogashiBannerLinkText,
  type BroadcastConfig,
} from "@/lib/broadcast-config";
import { MINOGASHI_SECTION_DOM_ID } from "@/lib/minogashi-layout";

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

type Props = {
  announcements?: SiteAnnouncementRow[];
};

export default function BroadcastCountdownBanner({
  announcements = [],
}: Props) {
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
  const scrollToMinogashi = () => {
    document
      .getElementById(MINOGASHI_SECTION_DOM_ID)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="bg-[#0D0F12] text-[#E8E4DF] border-b border-[rgba(255,255,255,0.06)]">
      <div className="max-w-[960px] mx-auto px-4 py-3 md:px-6 md:py-8 space-y-2.5 md:space-y-4">
        <div className="md:hidden space-y-1.5">
          <p className="text-[0.58rem] tracking-[0.35em] uppercase text-[rgba(232,228,223,0.65)]">
            {cfg.countdown.broadcastLabel}
          </p>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 items-start">
            <div className="min-w-0 space-y-0.5">
              <div className="font-shippori font-bold text-[clamp(0.95rem,4.8vw,1.32rem)] leading-[1.15]">
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
              <div className="text-[0.8rem] text-[rgba(232,228,223,0.86)] leading-[1.5]">
                {cfg.countdown.eventDate}
              </div>
              <div className="text-[0.8rem] text-[rgba(232,228,223,0.86)] leading-[1.5]">
                {cfg.countdown.eventTagline}
              </div>
            </div>

            <div className="text-right min-w-[9.2rem] space-y-0.5">
              <Link
                href="/garage-v2"
                className={
                  "inline-block text-[0.72rem] tracking-[0.18em] px-3 py-1.5 border transition-all " +
                  (isLive
                    ? "bg-gold text-deep border-gold hover:bg-transparent hover:text-gold"
                    : "bg-[rgba(255,255,255,0.04)] text-[#E8E4DF] border-[rgba(255,255,255,0.18)] hover:border-gold")
                }
              >
                ▶ REM CHAT
              </Link>
              <div className="text-[0.68rem] text-[rgba(232,228,223,0.65)] leading-snug">
                5分前に開局
              </div>
              {showMinogashiBannerCta ? (
                <button
                  type="button"
                  onClick={scrollToMinogashi}
                  className="text-[11px] leading-snug tracking-[0.05em] text-[#E05A33] underline-offset-2 hover:opacity-70 hover:underline transition-opacity"
                >
                  ▶ 前回の放送を観る ↓
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="hidden md:flex md:flex-row md:items-end md:justify-between gap-4">
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
            <div className="text-[0.75rem] text-[rgba(232,228,223,0.65)] leading-snug">
              {isLive ? cfg.countdown.remChatNoteAfter : cfg.countdown.remChatNoteBefore}
            </div>
            {showMinogashiBannerCta ? (
              <MinogashiBannerCta linkText={minogashiBannerLinkText} />
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,38%)_minmax(0,62%)] gap-2.5 md:gap-8 items-start">
          <div className="hidden md:block space-y-0.5 md:space-y-1 text-[0.8rem] md:text-[0.9rem] text-[rgba(232,228,223,0.86)] leading-[1.55] md:leading-[1.9] min-w-0">
            <div>{cfg.countdown.eventDate}</div>
            <div>{cfg.countdown.eventTagline}</div>
          </div>
          {announcements.length > 0 ? (
            <div className="min-w-0 w-full">
              <HeaderAnnouncementsPanel items={announcements} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

