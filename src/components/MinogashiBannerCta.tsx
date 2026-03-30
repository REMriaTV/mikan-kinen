"use client";

import React from "react";
import { MINOGASHI_SECTION_DOM_ID } from "@/lib/minogashi-layout";

export type MinogashiBannerCtaProps = {
  /** 例: ▶ 前回の放送を観る ↓ */
  linkText: string;
};

/**
 * 案A: BroadcastCountdownBanner 内（REM Chat 下）の見逃し導線。
 */
export default function MinogashiBannerCta({ linkText }: MinogashiBannerCtaProps) {
  function scrollToMinogashi() {
    document
      .getElementById(MINOGASHI_SECTION_DOM_ID)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <button
      type="button"
      onClick={scrollToMinogashi}
      className={
        "block w-full text-left md:w-auto md:text-right md:ml-auto " +
        "text-[11px] leading-snug tracking-[0.05em] text-[#E05A33] " +
        "cursor-pointer bg-transparent border-0 p-0 " +
        "underline-offset-2 hover:opacity-70 hover:underline transition-opacity " +
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E05A33] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0F12]"
      }
      aria-label={`見逃しセクションへ: ${linkText}`}
    >
      {linkText}
    </button>
  );
}
