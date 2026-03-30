"use client";

import React from "react";
import { MINOGASHI_SECTION_DOM_ID } from "@/lib/minogashi-layout";

export type MinogashiHeroBadgeProps = {
  /** ピル内の全文（例: ▶ 前回の放送を観る — 第二回…） */
  badgeText: string;
};

/**
 * ヒーロー末尾の見逃し導線（B案）。将来カウントダウン横リンク等に差し替える場合もこのコンポーネントだけ入れ替えればよい。
 */
export default function MinogashiHeroBadge({ badgeText }: MinogashiHeroBadgeProps) {
  function scrollToMinogashi() {
    const el = document.getElementById(MINOGASHI_SECTION_DOM_ID);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <button
      type="button"
      onClick={scrollToMinogashi}
      className={
        "mt-6 mx-auto max-w-[min(100%,32rem)] rounded-[20px] border px-4 py-2.5 " +
        "text-center text-[0.72rem] sm:text-[0.78rem] leading-snug tracking-[0.04em] " +
        "cursor-pointer transition-colors duration-200 " +
        "bg-[rgba(224,90,51,0.1)] border-[rgba(224,90,51,0.25)] text-[#E8E4DF] " +
        "hover:bg-[rgba(224,90,51,0.18)] " +
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E05A33] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0F12]"
      }
      aria-label={`見逃しセクションへ: ${badgeText}`}
    >
      {badgeText}
    </button>
  );
}
