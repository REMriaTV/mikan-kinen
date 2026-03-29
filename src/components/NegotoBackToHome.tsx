"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * コラム配下共通：ページ末尾付近までスクロールしたら「浮上する」を表示（固定ではない）
 */
export default function NegotoBackToHome() {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisible(true);
      },
      { root: null, rootMargin: "0px 0px 0px 0px", threshold: 0.15 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div
        ref={sentinelRef}
        className="pointer-events-none h-px w-full shrink-0"
        aria-hidden
      />
      <div
        className={`text-center overflow-hidden transition-all duration-[900ms] ease-out ${
          visible
            ? "max-h-24 opacity-100 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-3"
            : "max-h-0 py-0 opacity-0 pointer-events-none"
        }`}
      >
        <Link href="/" className="negoto-back-home-link">
          浮上する
        </Link>
      </div>
    </>
  );
}
