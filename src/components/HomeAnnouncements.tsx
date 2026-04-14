import Link from "next/link";
import type { HomeAnnouncement } from "@/data/home-announcements";

function formatAnnounceDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return iso;
  return `${m[1]}.${m[2]}.${m[3]}`;
}

type Props = {
  items: HomeAnnouncement[];
};

export default function HomeAnnouncements({ items }: Props) {
  if (!items.length) return null;

  return (
    <section
      aria-label="お知らせ"
      className="w-full border-b border-[rgba(255,255,255,0.06)] bg-[rgba(8,10,14,0.65)] backdrop-blur-sm"
    >
      <div className="max-w-[680px] mx-auto px-6 py-8 md:py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6">
          <div>
            <p className="text-[0.6rem] tracking-[0.45em] text-dim uppercase mb-1">
              News
            </p>
            <h2 className="font-shippori font-bold text-[clamp(1.05rem,2.5vw,1.35rem)] text-secondary tracking-[0.02em]">
              お知らせ
            </h2>
          </div>
          <p className="text-[0.68rem] text-dim tracking-[0.06em] sm:text-right">
            コラム更新・作品データ・次回予定など
          </p>
        </div>
        <ul className="space-y-0 divide-y divide-[rgba(255,255,255,0.06)]">
          {items.map((a) => (
            <li key={a.id} className="py-4 first:pt-0">
              <AnnounceRow announcement={a} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function AnnounceRow({ announcement: a }: { announcement: HomeAnnouncement }) {
  const dateStr = formatAnnounceDate(a.date);
  const inner = (
    <>
      <time
        dateTime={a.date}
        className="block text-[0.68rem] text-gold/85 tracking-[0.12em] mb-1.5 font-mono"
      >
        {dateStr}
      </time>
      <span className="font-shippori font-semibold text-[0.95rem] text-primary leading-snug block mb-1">
        {a.title}
      </span>
      {a.summary ? (
        <span className="text-[0.82rem] text-secondary leading-relaxed block">
          {a.summary}
        </span>
      ) : null}
    </>
  );

  if (a.href) {
    const isExternal =
      a.external === true ||
      /^https?:\/\//i.test(a.href);
    if (isExternal) {
      return (
        <a
          href={a.href}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-left rounded-sm -mx-2 px-2 py-1 -my-1 hover:bg-[rgba(255,255,255,0.04)] transition-colors group"
        >
          {inner}
          <span className="inline-block mt-2 text-[0.65rem] text-gold/70 tracking-[0.15em] group-hover:text-gold">
            開く →
          </span>
        </a>
      );
    }
    return (
      <Link
        href={a.href}
        className="block text-left rounded-sm -mx-2 px-2 py-1 -my-1 hover:bg-[rgba(255,255,255,0.04)] transition-colors group"
      >
        {inner}
        <span className="inline-block mt-2 text-[0.65rem] text-gold/70 tracking-[0.15em] group-hover:text-gold">
          詳しく見る →
        </span>
      </Link>
    );
  }

  return <div className="text-left">{inner}</div>;
}
