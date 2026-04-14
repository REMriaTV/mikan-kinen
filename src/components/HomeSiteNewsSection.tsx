import Link from "next/link";
import {
  formatAnnouncementDate,
  type SiteAnnouncementRow,
} from "@/lib/site-announcements";

type Props = {
  items: SiteAnnouncementRow[];
};

function itemHref(a: SiteAnnouncementRow): string | null {
  const u = a.link_url?.trim();
  return u || null;
}

function isExternal(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export default function HomeSiteNewsSection({ items }: Props) {
  if (!items.length) return null;

  return (
    <section
      id="site-news"
      className="scroll-mt-[5.5rem] max-w-[680px] mx-auto px-6 py-16 md:py-20"
      aria-label="お知らせ一覧"
    >
      <p className="text-[0.6rem] tracking-[0.45em] text-dim uppercase mb-2">
        News
      </p>
      <h2 className="font-shippori font-bold text-[clamp(1.2rem,3vw,1.6rem)] mb-2 text-secondary">
        お目覚めのしらせ
      </h2>
      <p className="text-[0.82rem] text-dim mb-8 leading-relaxed">
        夢の入口で拾った小さな気配を、ここに記していきます。
      </p>
      <ul className="space-y-0 divide-y divide-[rgba(255,255,255,0.08)] border-t border-b border-[rgba(255,255,255,0.08)]">
        {items.map((a) => {
          const href = itemHref(a);
          const cardContent = (
            <div className="rounded-sm border border-transparent px-3 py-3 transition-colors duration-200 group-hover:border-[rgba(224,180,90,0.35)] group-hover:bg-[rgba(255,255,255,0.03)]">
              <p className="text-[0.68rem] text-gold/80 font-mono tracking-[0.08em] mb-1">
                {formatAnnouncementDate(a.published_at)}
              </p>
              <h3 className="font-shippori font-semibold text-[0.95rem] text-primary mb-1.5">
                {a.title}
              </h3>
              {a.summary ? (
                <p className="text-[0.85rem] text-secondary leading-relaxed mb-2">
                  {a.summary}
                </p>
              ) : null}
              {href ? (
                <span className="inline-block text-[0.72rem] text-gold/75 tracking-[0.1em] group-hover:text-gold">
                  {isExternal(href) ? "開く →" : "詳しく見る →"}
                </span>
              ) : null}
            </div>
          );

          return (
            <li key={a.id} className="py-5 first:pt-4 last:pb-4">
              {href ? (
                isExternal(href) ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block cursor-pointer"
                  >
                    {cardContent}
                  </a>
                ) : (
                  <Link
                    href={href}
                    className="group block cursor-pointer"
                  >
                    {cardContent}
                  </Link>
                )
              ) : (
                cardContent
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
