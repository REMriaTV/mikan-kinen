import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "お知らせ UI プロトタイプ（比較用）",
  robots: { index: false, follow: false },
};

const MOCK = [
  {
    date: "2026.04.14",
    title: "コラムを更新しました",
    summary: "レムの波打ち際より、新しいエントリを公開しています。",
  },
  {
    date: "2026.04.01",
    title: "番組表のデータを整備中です",
    summary: "作品一覧とあらすじの連携を進めています。",
  },
  {
    date: "2026.03.20",
    title: "次回トークショーの日程は未定です",
    summary: "決まり次第、ここでお知らせする想定です。",
  },
];

export default function PrototypeAnnouncementsPage() {
  return (
    <main className="min-h-screen pb-24">
      <div className="max-w-[720px] mx-auto px-6 pt-10 pb-6 border-b border-[rgba(255,255,255,0.08)]">
        <p className="text-[0.65rem] tracking-[0.35em] text-dim uppercase mb-2">
          Prototype
        </p>
        <h1 className="font-shippori font-bold text-[clamp(1.2rem,3vw,1.6rem)] text-secondary mb-3">
          トップ「お知らせ」レイアウト比較
        </h1>
        <p className="text-[0.82rem] text-dim leading-relaxed mb-4">
          実装前に見た目のパターンを並べています。採用する1案を決めたあと、Supabase
          連携で組み立てる想定です。
        </p>
        <Link
          href="/"
          className="text-[0.72rem] text-gold/80 tracking-[0.12em] hover:text-gold"
        >
          ← トップへ戻る
        </Link>
      </div>

      {/* パターン A */}
      <section className="max-w-[720px] mx-auto px-6 py-12 border-b border-[rgba(255,255,255,0.06)]">
        <PatternLabel name="A" desc="バナー直下の帯・区切り線リスト（前に載せていた系統）" />
        <div className="mt-6 border border-[rgba(255,255,255,0.08)] rounded-sm bg-[rgba(8,10,14,0.5)]">
          <div className="px-5 py-5 border-b border-[rgba(255,255,255,0.06)]">
            <p className="text-[0.6rem] tracking-[0.45em] text-dim uppercase mb-1">
              News
            </p>
            <h2 className="font-shippori font-bold text-[1.15rem] text-secondary">
              お知らせ
            </h2>
            <p className="text-[0.68rem] text-dim mt-1">
              コラム・作品データ・次回予定など
            </p>
          </div>
          <ul className="divide-y divide-[rgba(255,255,255,0.06)]">
            {MOCK.map((item, i) => (
              <li key={i} className="px-5 py-4 hover:bg-[rgba(255,255,255,0.02)]">
                <time className="block text-[0.68rem] text-gold/85 font-mono tracking-[0.1em] mb-1">
                  {item.date}
                </time>
                <span className="font-shippori font-semibold text-[0.95rem] text-primary block mb-1">
                  {item.title}
                </span>
                <span className="text-[0.8rem] text-secondary">{item.summary}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* パターン B */}
      <section className="max-w-[720px] mx-auto px-6 py-12 border-b border-[rgba(255,255,255,0.06)]">
        <PatternLabel name="B" desc="1カード＝1件。縦に積む（目立たせたいとき）" />
        <div className="mt-6 space-y-4">
          <div className="flex items-baseline justify-between gap-3 mb-2">
            <h2 className="font-shippori font-bold text-[1.05rem] text-secondary">
              お知らせ
            </h2>
            <span className="text-[0.6rem] text-dim tracking-[0.2em]">News</span>
          </div>
          {MOCK.map((item, i) => (
            <article
              key={i}
              className="bg-card border border-[rgba(255,255,255,0.07)] p-5 rounded-sm hover:border-[rgba(224,180,90,0.2)] transition-colors"
            >
              <time className="text-[0.65rem] text-gold/75 font-mono tracking-[0.08em]">
                {item.date}
              </time>
              <h3 className="font-shippori font-semibold text-[0.98rem] text-primary mt-2 mb-2">
                {item.title}
              </h3>
              <p className="text-[0.82rem] text-secondary leading-relaxed">{item.summary}</p>
            </article>
          ))}
        </div>
      </section>

      {/* パターン C */}
      <section className="max-w-[720px] mx-auto px-6 py-12 border-b border-[rgba(255,255,255,0.06)]">
        <PatternLabel name="C" desc="コンパクト：最新1件だけ強調＋残りは小さく" />
        <div className="mt-6">
          <p className="text-[0.6rem] tracking-[0.4em] text-dim uppercase mb-3">News</p>
          <div className="border-l-2 border-gold/50 pl-5 py-1 mb-8">
            <time className="text-[0.7rem] text-gold font-mono">{MOCK[0].date}</time>
            <p className="font-shippori font-bold text-[1.05rem] text-primary mt-2 mb-2">
              {MOCK[0].title}
            </p>
            <p className="text-[0.85rem] text-secondary">{MOCK[0].summary}</p>
          </div>
          <p className="text-[0.65rem] text-dim tracking-[0.15em] mb-3">過去のお知らせ</p>
          <ul className="space-y-2">
            {MOCK.slice(1).map((item, i) => (
              <li
                key={i}
                className="flex flex-wrap gap-x-3 gap-y-1 text-[0.78rem] text-dim border-b border-[rgba(255,255,255,0.04)] pb-2"
              >
                <span className="font-mono text-gold/55 shrink-0">{item.date}</span>
                <span className="text-secondary">{item.title}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* パターン D */}
      <section className="max-w-[720px] mx-auto px-6 py-12">
        <PatternLabel name="D" desc="横並びチップ風（件数が少ない・短い文向け）" />
        <div className="mt-6">
          <h2 className="font-shippori font-bold text-[1.05rem] text-secondary mb-4">
            お知らせ
          </h2>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            {MOCK.map((item, i) => (
              <div
                key={i}
                className="flex-1 min-w-[200px] border border-[rgba(255,255,255,0.1)] rounded-sm px-4 py-3 bg-[rgba(255,255,255,0.02)]"
              >
                <time className="text-[0.62rem] text-gold/70 font-mono block mb-1">
                  {item.date}
                </time>
                <p className="text-[0.82rem] text-primary font-shippori font-medium leading-snug">
                  {item.title}
                </p>
              </div>
            ))}
          </div>
          <p className="text-[0.72rem] text-dim mt-4 leading-relaxed">
            ※スマホでは縦に積まれる想定です。
          </p>
        </div>
      </section>
    </main>
  );
}

function PatternLabel({ name, desc }: { name: string; desc: string }) {
  return (
    <div>
      <span className="inline-block text-[0.65rem] tracking-[0.25em] text-gold border border-gold/40 px-2 py-0.5 rounded-sm mb-2">
        パターン {name}
      </span>
      <p className="text-[0.78rem] text-dim leading-relaxed">{desc}</p>
    </div>
  );
}
