"use client";

import { useEffect, useState } from "react";

const VIDEO_SELECTOR = ".negoto-video-header video";

/**
 * /negoto コラムトップ：ヘッダー動画の canplaythrough（またはキャッシュ済み）を待ってから
 * ページ全体をゆっくりフェードイン。遷移元は問わない。
 */
export default function NegotoPageReveal({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = document.querySelector(
      VIDEO_SELECTOR
    ) as HTMLVideoElement | null;

    if (!video) {
      setReady(true);
      return;
    }

    const onReady = () => setReady(true);

    if (video.readyState >= 3) {
      setTimeout(onReady, 150);
    } else {
      video.addEventListener("canplaythrough", onReady, { once: true });
    }

    const fallback = setTimeout(onReady, 3000);

    return () => {
      clearTimeout(fallback);
      video.removeEventListener("canplaythrough", onReady);
    };
  }, []);

  return (
    <div className={`negoto-page ${ready ? "ready" : ""}`}>{children}</div>
  );
}
