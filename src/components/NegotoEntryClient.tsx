"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import {
  parseNegotoBoldSegments,
  type NegotoParsedBlock,
} from "@/lib/negoto";

type Props = {
  blocks: NegotoParsedBlock[];
  newerSlug: string | null;
  olderSlug: string | null;
};

function NegotoInlineText({ text }: { text: string }) {
  const pieces = parseNegotoBoldSegments(text);
  return (
    <>
      {pieces.map((piece, idx) =>
        piece.kind === "bold" ? (
          <strong key={idx}>{piece.text}</strong>
        ) : (
          <span key={idx}>{piece.text}</span>
        )
      )}
    </>
  );
}

export default function NegotoEntryClient({
  blocks,
  newerSlug,
  olderSlug,
}: Props) {
  const pathname = usePathname();
  const arrowRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  /**
   * 一覧などからクライアント遷移した直後、window.scrollY がまだ前ページの値のまま
   * useEffect の reveal が走ると本文が一括表示される。レイアウト前に先頭へ戻す。
   */
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  useEffect(() => {
    const arrow = arrowRef.current;
    const root = containerRef.current;
    if (!root) return;

    /** 前エントリで矢印に付いた inline opacity をリセット（同一コンポーネントで slug だけ変わる場合） */
    if (arrow) {
      arrow.style.opacity = "";
    }

    /** 初回はタイトル＋矢印のみ。少しスクロールしてから本文ブロックを順に表示 */
    const SCROLL_START = 36;

    const reveal = () => {
      const vh = window.innerHeight;
      const sy = window.scrollY || window.pageYOffset;

      if (arrow && sy > 40) {
        arrow.style.opacity = "0";
      }

      const items = root.querySelectorAll(
        ".negoto-scroll-reveal, .negoto-entry-footer"
      );
      const allowBody = sy >= SCROLL_START;
      items.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (allowBody && rect.top < vh * 0.82) {
          el.classList.add("visible");
        }
      });
    };

    /** useLayoutEffect の scrollTo がブラウザに反映された後の scrollY を読む */
    const t = window.setTimeout(reveal, 0);

    window.addEventListener("scroll", reveal, { passive: true });
    window.addEventListener("resize", reveal, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", reveal);
      window.removeEventListener("resize", reveal);
    };
  }, [pathname]);

  return (
    <div ref={containerRef}>
      <div ref={arrowRef} className="negoto-scroll-arrow">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(232,228,223,0.4)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>

      {blocks.map((b, i) => {
        if (b.kind === "zzz") {
          return (
            <div
              key={`z-${i}`}
              className="negoto-scroll-reveal negoto-zzz-block"
            >
              {b.isFirst ? "zzz . . ." : "zzz . . . zzZ"}
            </div>
          );
        }
        return (
          <div key={`s-${i}`} className="negoto-section-group">
            {b.h2 ? (
              <div className="negoto-scroll-reveal">
                <h2>
                  <NegotoInlineText text={b.h2} />
                </h2>
              </div>
            ) : null}
            {b.paragraphs.map((p, j) =>
              typeof p === "string" ? (
                <div key={j} className="negoto-scroll-reveal">
                  <p>
                    <NegotoInlineText text={p} />
                  </p>
                </div>
              ) : (
                <div
                  key={j}
                  className="negoto-scroll-reveal negoto-entry-figure-wrap"
                >
                  <figure className="negoto-entry-figure">
                    <img
                      src={p.src}
                      alt={p.alt}
                      loading="lazy"
                      decoding="async"
                    />
                  </figure>
                </div>
              )
            )}
          </div>
        );
      })}

      <footer className="negoto-entry-footer">
        {olderSlug ? (
          <Link className="negoto-entry-nav" href={`/negoto/${olderSlug}`}>
            ← 前の寝言
          </Link>
        ) : (
          <span className="negoto-entry-nav" style={{ opacity: 0.15 }}>
            ← 前の寝言
          </span>
        )}
        <div className="negoto-entry-sig">REMREAL TELEPATHIC NETWORK</div>
        {newerSlug ? (
          <Link className="negoto-entry-nav" href={`/negoto/${newerSlug}`}>
            次の寝言 →
          </Link>
        ) : (
          <span className="negoto-entry-nav" style={{ opacity: 0.15 }}>
            次の寝言 →
          </span>
        )}
      </footer>
    </div>
  );
}
