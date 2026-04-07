"use client";

import React from "react";
import Link from "next/link";

export type NemumiColorBarScreenProps = {
  networkTitle?: string;
  sleepingText?: string;
  nextText?: string;
  wakeText?: string;
};

/**
 * ねむみ放送・放送前待機。SMPTE カラーバーなしの暗い画面（指示書 v2）。
 */
export default function NemumiColorBarScreen({
  networkTitle = "REMREAL TELEPATHIC NETWORK",
  sleepingText = "ねむみの波が近づいています...",
  nextText = "しばらくお待ちください",
  wakeText = "おきる",
}: NemumiColorBarScreenProps) {
  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center px-5 py-10 text-[#E8E4DF]"
      style={{ background: "#080A0D" }}
    >
      <p className="text-[0.55rem] tracking-[0.45em] uppercase text-[rgba(232,228,223,0.45)] mb-6">
        {networkTitle}
      </p>
      <div
        className="w-full max-w-[640px] aspect-video rounded border border-[rgba(255,255,255,0.06)] bg-[#050608] flex flex-col items-center justify-center gap-4 shadow-[inset_0_0_80px_rgba(0,0,0,0.5)]"
        aria-hidden
      >
        <div className="text-[0.65rem] tracking-[0.35em] text-[rgba(232,228,223,0.35)]">
          NEMUMI
        </div>
      </div>
      <p className="mt-10 text-center font-shippori text-[clamp(1rem,3vw,1.25rem)] text-[rgba(232,228,223,0.72)] tracking-[0.08em]">
        {sleepingText}
      </p>
      <p className="mt-4 text-center text-[0.85rem] text-[rgba(232,228,223,0.45)]">{nextText}</p>
      <Link
        href="/"
        className="mt-12 text-[0.72rem] tracking-[0.2em] text-[rgba(224,90,51,0.85)] border border-[rgba(224,90,51,0.35)] px-6 py-2 rounded-full hover:bg-[rgba(224,90,51,0.08)] transition-colors"
      >
        {wakeText}
      </Link>
    </div>
  );
}
