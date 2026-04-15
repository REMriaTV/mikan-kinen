import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorkBySlug, allWorks } from "@/data/works";

export function generateStaticParams() {
  return allWorks.map((work) => ({
    slug: work.slug,
  }));
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    継続: "bg-[#2d6a4f] text-[#95d5b2]",
    保留: "bg-[rgba(255,255,255,0.12)] text-dim",
    休止: "bg-[rgba(255,255,255,0.08)] text-dim",
    完成: "bg-[#c9a84c] text-[#0a0a0c]",
  };
  return (
    <span className={`text-xs px-3 py-1 rounded-full ${colors[status] || ""}`}>
      {status}
    </span>
  );
}

function FormatBadge({ format }: { format: string }) {
  const colors: Record<string, string> = {
    文章: "bg-[#1d3557] text-[#a8dadc]",
    マンガ: "bg-[#6b2c3e] text-[#f4a8b8]",
    イラスト: "bg-[#6b2c3e] text-[#f4a8b8]",
    ライフスタイル: "bg-[#5c4d1a] text-[#c9a84c]",
  };
  return (
    <span className={`text-xs px-3 py-1 rounded-full ${colors[format] || ""}`}>
      {format}
    </span>
  );
}

function ScaleBadge({ scale }: { scale: string }) {
  return (
    <span className="text-xs px-3 py-1 rounded-full bg-[rgba(255,255,255,0.06)] text-secondary">
      {scale}
    </span>
  );
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = getWorkBySlug(slug);

  if (!work) {
    notFound();
  }

  return (
    <main className="min-h-screen pt-[6px] pb-[60px]">
      <div className="max-w-[680px] mx-auto px-6 py-12">
        {/* Back Link */}
        <Link
          href="/works"
          className="text-gold text-sm hover:underline mb-8 inline-block"
        >
          ← 番組表に戻る
        </Link>

        {/* Title */}
        <h1 className="font-shippori text-2xl md:text-3xl font-bold mb-4 leading-tight">
          {work.title}
        </h1>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-8">
          <StatusBadge status={work.status} />
          <FormatBadge format={work.format} />
          <ScaleBadge scale={work.scale} />
        </div>

        {/* Meta */}
        <div className="text-sm text-dim mb-8 space-y-1">
          <p>初出: {work.debut}</p>
          {work.meta.length > 0 && (
            <p className="text-secondary">{work.meta.join(" / ")}</p>
          )}
        </div>

        {/* Synopsis Section */}
        <section className="mb-10">
          <h2 className="text-xs text-dim tracking-widest mb-3 border-b border-[rgba(255,255,255,0.1)] pb-2">
            あらすじ
          </h2>
          <div className="bg-card p-6 rounded-lg border border-[rgba(255,255,255,0.06)]">
            {work.synopsis ? (
              <p className="text-secondary leading-relaxed">{work.synopsis}</p>
            ) : (
              <p className="text-dim italic text-sm">
                ── 詳細は当日のトークショーでお話しします
              </p>
            )}
          </div>
        </section>

        {/* Peek Note Section */}
        <section className="mb-10">
          <h2 className="text-xs text-dim tracking-widest mb-3 border-b border-[rgba(255,255,255,0.1)] pb-2">
            チラ見せメモ
          </h2>
          <div className="bg-card p-6 rounded-lg border border-[rgba(255,255,255,0.06)]">
            {work.peekNote ? (
              <p className="text-secondary leading-relaxed">{work.peekNote}</p>
            ) : (
              <p className="text-dim italic text-sm">
                ── 準備中
              </p>
            )}
          </div>
        </section>

        {/* Drive Link Section */}
        {work.driveLink && (
          <section className="mb-10">
            <h2 className="text-xs text-dim tracking-widest mb-3 border-b border-[rgba(255,255,255,0.1)] pb-2">
              資料リンク
            </h2>
            <a
              href={work.driveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-gold hover:underline"
            >
              Googleドライブで見る →
            </a>
          </section>
        )}

        {work.slug === "banshu-survive" && (
          <section className="mb-10">
            <h2 className="text-xs text-dim tracking-widest mb-3 border-b border-[rgba(255,255,255,0.1)] pb-2">
              制作進行（公開）
            </h2>
            <p className="text-secondary text-sm leading-relaxed mb-4">
              町内環境PVの絵コンテ・歌詞・撮影メモをブラウザで編集し、Supabase に保存できます。
            </p>
            <Link
              href="/works/banshu-survive/pv-desk"
              className="inline-block text-gold hover:underline"
            >
              PV 制作デスクを開く →
            </Link>
          </section>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-[rgba(255,255,255,0.1)]">
          <p className="text-xs text-dim">
            この作品について詳しく聞きたい方は、トークショーでお気軽にご質問ください。
          </p>
        </div>
      </div>
    </main>
  );
}
