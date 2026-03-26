"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { buildParagraphBlocks } from "@/lib/manuscripts";

type Props = {
  workId: string;
  title: string;
  author: string;
  status: string;
  position: string;
  sections: string[];
};

type ReaderPage =
  | { type: "cover" }
  | { type: "body"; section: string }
  | { type: "colophon" };

export default function TategakiReaderClient({
  workId,
  title,
  author,
  status,
  position,
  sections,
}: Props) {
  const pages = useMemo<ReaderPage[]>(
    () => [{ type: "cover" }, ...sections.map((section) => ({ type: "body" as const, section })), { type: "colophon" }],
    [sections]
  );
  const totalPages = pages.length;
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [showLoading, setShowLoading] = useState(true);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const goToPage = (target: number) => {
    if (target < 0 || target >= totalPages || target === currentPage) return;
    setDirection(target > currentPage ? "next" : "prev");
    setCurrentPage(target);
  };
  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowLoading(false), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === " ") {
        e.preventDefault();
        nextPage();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        prevPage();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#0D0F12] text-[#E8E4DF]">
      {showLoading && (
        <div className="fixed inset-0 z-[1200] flex flex-col items-center justify-center gap-3 bg-[#0D0F12]">
          <div className="text-[24px]">𝇍</div>
          <div className="text-[10px] tracking-[0.25em] uppercase text-[rgba(232,228,223,0.6)] font-mono">
            REM Sync...
          </div>
        </div>
      )}

      <header className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex items-center justify-between bg-gradient-to-b from-[#0D0F12] to-transparent px-5 py-3">
        <div className="pointer-events-auto">
          <div className="font-mono text-[8px] tracking-[0.25em] text-[rgba(232,228,223,0.4)]">
            REMREAL TELEPATHIC NETWORK
          </div>
          <div className="font-shippori text-[14px] tracking-[0.18em] text-[rgba(232,228,223,0.65)]">
            {title}
          </div>
        </div>
        <Link
          href="/works"
          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(232,228,223,0.1)] bg-[rgba(13,15,18,0.6)] text-[rgba(232,228,223,0.65)] transition hover:text-[#E8E4DF]"
          aria-label="閉じる"
        >
          ✕
        </Link>
      </header>

      <section
        className="absolute inset-0 flex"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
          touchStartY.current = e.touches[0].clientY;
        }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          const dy = e.changedTouches[0].clientY - touchStartY.current;
          if (Math.abs(dx) <= Math.abs(dy) || Math.abs(dx) < 50) return;
          if (dx > 0) nextPage();
          else prevPage();
        }}
      >
        <div className="absolute inset-y-0 left-0 w-1/2 z-30 cursor-w-resize" onClick={nextPage} />
        <div className="absolute inset-y-0 right-0 w-1/2 z-30 cursor-e-resize" onClick={prevPage} />

        <div className="relative h-full w-full overflow-hidden">
          {pages.map((page, index) => {
            const isActive = index === currentPage;
            const className = [
              "absolute inset-0 flex items-center justify-center px-6 pb-20 pt-16 md:px-12 md:pb-24 md:pt-20",
              "transition-all duration-[600ms] ease-[ease]",
              isActive ? "opacity-100 translate-x-0" : "pointer-events-none opacity-0",
              !isActive && index < currentPage
                ? direction === "next"
                  ? "translate-x-[30px]"
                  : "-translate-x-[30px]"
                : !isActive
                  ? direction === "next"
                    ? "-translate-x-[30px]"
                    : "translate-x-[30px]"
                  : "",
            ].join(" ");

            if (page.type === "cover") {
              return (
                <article key={`cover-${workId}`} className={className}>
                  <div className="flex flex-col items-center gap-5 text-center">
                    <div className="font-mono text-[8px] tracking-[0.25em] text-[rgba(232,228,223,0.45)]">
                      REMREAL TELEPATHIC NETWORK
                    </div>
                    <h1 className="font-shippori text-[28px] font-semibold tracking-[0.2em] [writing-mode:vertical-rl]">
                      {title}
                    </h1>
                    <p className="text-[13px] tracking-[0.25em] text-[rgba(232,228,223,0.6)]">{author}</p>
                    <p className="font-mono text-[10px] tracking-[0.2em] text-[#E05A33]">{status} — {position}</p>
                  </div>
                </article>
              );
            }

            if (page.type === "colophon") {
              return (
                <article key={`colophon-${workId}`} className={className}>
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="font-shippori text-[16px] tracking-[0.15em] [writing-mode:vertical-rl] text-[rgba(232,228,223,0.7)]">
                      {title}
                    </div>
                    <div className="h-px w-6 bg-[#E05A33]/40" />
                    <p className="font-mono text-[10px] leading-7 tracking-[0.2em] text-[rgba(232,228,223,0.5)]">
                      {author}
                      <br />
                      {status}
                      <br />
                      <br />
                      {position}
                      <br />
                      <br />
                      REMREAL TELEPATHIC NETWORK
                    </p>
                  </div>
                </article>
              );
            }

            const blocks = buildParagraphBlocks(page.section);
            return (
              <article key={`body-${index}`} className={className}>
                <div className="max-h-[calc(100dvh-144px)] overflow-hidden [writing-mode:vertical-rl] [text-orientation:mixed] font-shippori text-[15px] leading-[2] tracking-[0.08em] md:text-[17px] md:leading-[2.2]">
                  {blocks.map((block, idx) => (
                    <p
                      key={idx}
                      className="whitespace-pre-line"
                      style={
                        idx === 0
                          ? undefined
                          : { marginBlockStart: `${Math.max(1, block.gapLines) * 2}em` }
                      }
                    >
                      {block.text}
                    </p>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex items-center justify-center gap-4 bg-gradient-to-t from-[#0D0F12] to-transparent px-5 pb-5 pt-4">
        <div className="pointer-events-auto font-mono text-[10px] tracking-[0.08em] text-[rgba(232,228,223,0.5)]">
          {currentPage + 1} / {totalPages}
        </div>
        <div className="pointer-events-auto flex items-center gap-1.5">
          {[...pages.keys()].reverse().map((i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              className={`h-1.5 w-1.5 rounded-full transition ${
                i === currentPage ? "bg-[rgba(232,228,223,0.65)]" : "bg-[rgba(232,228,223,0.2)]"
              }`}
              aria-label={`ページ ${i + 1} へ`}
            />
          ))}
        </div>
      </footer>
    </main>
  );
}

