"use client";

import Link from "next/link";
import {
  formatAnnouncementDate,
  type SiteAnnouncementRow,
} from "@/lib/site-announcements";

type Props = {
  items: SiteAnnouncementRow[];
};

function resolvePrimaryHref(latest: SiteAnnouncementRow): string {
  const u = latest.link_url?.trim();
  if (u) return u;
  return "/#site-news";
}

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/**
 * ヘッダー右：最新1件を表示。全体クリックで link_url（未設定時は /#site-news）。
 * プルダウンなし（一覧はトップ中段 #site-news）。
 */
export default function HeaderAnnouncementsPanel({ items }: Props) {
  const latest = items[0];
  if (!latest) return null;

  const href = resolvePrimaryHref(latest);
  const external = isExternalUrl(href);
  const showListLink = Boolean(latest.link_url?.trim());

  const inner = (
    <>
      <p className="text-[0.58rem] tracking-[0.35em] uppercase text-[rgba(232,228,223,0.55)] mb-1">
        News
      </p>
      <p className="text-[0.68rem] text-gold/90 font-mono tracking-[0.06em] mb-0.5">
        {formatAnnouncementDate(latest.published_at)}
      </p>
      <p className="font-shippori text-[0.88rem] text-[#E8E4DF] leading-snug">
        {latest.title}
      </p>
      {latest.summary ? (
        <p className="text-[0.72rem] text-[rgba(232,228,223,0.72)] mt-1.5 leading-relaxed">
          {latest.summary}
        </p>
      ) : null}
    </>
  );

  const cardClass =
    "block w-full text-left rounded-sm border border-[rgba(255,255,255,0.12)] bg-[rgba(0,0,0,0.35)] px-3 py-2.5 md:px-4 md:py-3 hover:border-[rgba(224,180,90,0.4)] hover:bg-[rgba(255,255,255,0.05)] transition-colors";

  return (
    <div className="w-full min-w-0 md:max-w-none">
      {external ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cardClass}
        >
          {inner}
        </a>
      ) : (
        <Link href={href} className={cardClass}>
          {inner}
        </Link>
      )}

      {showListLink ? (
        <div className="mt-2 text-right">
          <Link
            href="/#site-news"
            className="text-[0.62rem] tracking-[0.12em] text-[rgba(232,228,223,0.45)] hover:text-gold/80 transition-colors"
          >
            お知らせ一覧へ →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
