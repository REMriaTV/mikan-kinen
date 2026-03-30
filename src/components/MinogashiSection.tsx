"use client";

import React, { useState } from "react";
import { MINOGASHI_SECTION_DOM_ID } from "@/lib/minogashi-layout";

export type MinogashiSectionProps = {
  label: string;
  title: string;
  dateLine: string;
  description: string;
  youtubeId: string;
};

export default function MinogashiSection({
  label,
  title,
  dateLine,
  description,
  youtubeId,
}: MinogashiSectionProps) {
  const [playing, setPlaying] = useState(false);
  const [thumbHiResFailed, setThumbHiResFailed] = useState(false);

  const thumbSrc = thumbHiResFailed
    ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    : `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;

  // rel=0: 関連動画を同一チャンネルに限定 / playlist=同一ID: 単一動画として扱い「その他の動画」系の表示を抑える
  const q = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
    playlist: youtubeId,
  });
  const embedSrc = `https://www.youtube.com/embed/${encodeURIComponent(
    youtubeId
  )}?${q.toString()}`;

  return (
    <section
      id={MINOGASHI_SECTION_DOM_ID}
      className="max-w-[680px] mx-auto px-6 py-14 md:py-16 text-center bg-[#0D0F12] text-[#E8E4DF] scroll-mt-4"
      aria-labelledby="minogashi-heading"
    >
      <p className="text-[0.6rem] tracking-[0.45em] uppercase text-[rgba(232,228,223,0.55)] mb-2 animate-fade-in">
        Archive
      </p>
      <p className="text-[0.68rem] tracking-[0.12em] text-[rgba(232,228,223,0.72)] mb-2 animate-fade-in">
        {label}
      </p>
      <h2
        id="minogashi-heading"
        className="font-shippori font-bold text-[clamp(1.15rem,2.8vw,1.55rem)] leading-snug mb-2 text-[#E8E4DF] animate-fade-in"
      >
        {title}
      </h2>
      <p className="text-[0.82rem] text-[rgba(232,228,223,0.62)] tracking-[0.06em] mb-6 animate-fade-in">
        {dateLine}
      </p>
      {description.trim() ? (
        <p className="text-[0.88rem] text-secondary leading-[1.85] mb-8 max-w-[32rem] mx-auto animate-fade-in">
          {description.trim()}
        </p>
      ) : null}

      <div className="w-full max-w-[640px] mx-auto">
        <div
          className="relative w-full overflow-hidden rounded-[4px] border border-[rgba(255,255,255,0.08)] bg-black/40 shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
          style={{ aspectRatio: "16 / 9" }}
        >
          {!playing ? (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="group relative block h-full w-full cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E05A33] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0F12]"
              aria-label={`${title} を再生`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbSrc}
                alt=""
                className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-85"
                loading="lazy"
                onError={() => {
                  if (!thumbHiResFailed) setThumbHiResFailed(true);
                }}
              />
              <span
                className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover:bg-black/15"
                aria-hidden
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(232,228,223,0.35)] bg-[rgba(13,15,18,0.55)] text-[#E8E4DF] text-2xl pl-1 shadow-lg backdrop-blur-[2px]">
                  ▶
                </span>
              </span>
            </button>
          ) : (
            <iframe
              title={title}
              src={embedSrc}
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>
      </div>
    </section>
  );
}
