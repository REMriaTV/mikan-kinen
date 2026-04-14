"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  formatAnnouncementDate,
  type SiteAnnouncementRow,
} from "@/lib/site-announcements";

type Props = {
  items: SiteAnnouncementRow[];
};

export default function HeaderAnnouncementsPanel({ items }: Props) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const btnId = useId();

  const latest = items[0];
  const rest = items.slice(1);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  if (!latest) return null;

  return (
    <div
      ref={panelRef}
      className="w-full md:max-w-[min(100%,20rem)] md:justify-self-end"
    >
      <button
        id={btnId}
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left rounded-sm border border-[rgba(255,255,255,0.12)] bg-[rgba(0,0,0,0.35)] px-3 py-2.5 hover:border-[rgba(224,180,90,0.35)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[0.58rem] tracking-[0.35em] uppercase text-[rgba(232,228,223,0.55)] mb-1">
              News
            </p>
            <p className="text-[0.68rem] text-gold/90 font-mono tracking-[0.06em] mb-0.5">
              {formatAnnouncementDate(latest.published_at)}
            </p>
            <p className="font-shippori text-[0.88rem] text-[#E8E4DF] leading-snug line-clamp-2">
              {latest.title}
            </p>
            {latest.summary ? (
              <p className="text-[0.72rem] text-[rgba(232,228,223,0.7)] mt-1 line-clamp-2 leading-relaxed">
                {latest.summary}
              </p>
            ) : null}
          </div>
          <span
            className="shrink-0 text-[0.65rem] text-[rgba(232,228,223,0.5)] mt-5"
            aria-hidden
          >
            {open ? "▲" : "▼"}
          </span>
        </div>
        <p className="text-[0.62rem] text-[rgba(232,228,223,0.45)] mt-2 tracking-[0.08em]">
          お知らせ
          {rest.length > 0 ? `（他 ${rest.length} 件）` : ""}
          {open ? " · 閉じる" : " · タップで一覧"}
        </p>
      </button>

      {open ? (
        <div
          role="region"
          aria-labelledby={btnId}
          className="mt-2 border border-[rgba(255,255,255,0.1)] rounded-sm bg-[#0a0c0f] max-h-[min(50vh,18rem)] overflow-y-auto shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        >
          <ul className="divide-y divide-[rgba(255,255,255,0.06)]">
            {items.map((a) => (
              <li key={a.id} className="px-3 py-2.5 hover:bg-[rgba(255,255,255,0.03)]">
                <AnnounceRow announcement={a} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function AnnounceRow({ announcement: a }: { announcement: SiteAnnouncementRow }) {
  const dateStr = formatAnnouncementDate(a.published_at);
  const inner = (
    <>
      <time
        dateTime={a.published_at}
        className="block text-[0.62rem] text-gold/65 font-mono mb-0.5"
      >
        {dateStr}
      </time>
      <span className="font-shippori text-[0.82rem] text-[#E8E4DF] leading-snug block">
        {a.title}
      </span>
      {a.summary ? (
        <span className="text-[0.72rem] text-[rgba(232,228,223,0.65)] block mt-0.5 leading-relaxed">
          {a.summary}
        </span>
      ) : null}
    </>
  );

  if (a.link_url?.trim()) {
    const url = a.link_url.trim();
    const external = /^https?:\/\//i.test(url);
    if (external) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block -mx-1 px-1 rounded hover:text-gold/90"
        >
          {inner}
          <span className="inline-block mt-1 text-[0.58rem] text-gold/50">
            開く →
          </span>
        </a>
      );
    }
    return (
      <Link href={url} className="block -mx-1 px-1 rounded hover:text-gold/90">
        {inner}
        <span className="inline-block mt-1 text-[0.58rem] text-gold/50">
          詳しく →
        </span>
      </Link>
    );
  }

  return <div>{inner}</div>;
}
