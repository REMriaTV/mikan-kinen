"use client";

import Link from "next/link";
import { mainWorks, subWorks, Work, WorkFormat } from "@/data/works";

type ChannelType = "文章" | "マンガ" | "コンセプト";

const channelColors: Record<ChannelType, { bg: string; border: string }> = {
  文章: { bg: "bg-[#1d3557]", border: "border-[#a8dadc]" },
  マンガ: { bg: "bg-[#6b2c3e]", border: "border-[#f4a8b8]" },
  コンセプト: { bg: "bg-[#5c4d1a]", border: "border-[#c9a84c]" },
};

function getChannel(format: WorkFormat): ChannelType {
  if (format === "マンガ" || format === "イラスト") return "マンガ";
  if (format === "ライフスタイル") return "コンセプト";
  return "文章";
}

function getRowSpan(scale: string): number {
  if (scale === "長編") return 3;
  if (scale === "短編") return 2;
  return 1;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    継続: "bg-[#2d6a4f] text-[#95d5b2]",
    保留: "bg-[rgba(255,255,255,0.08)] text-dim",
    休止: "bg-[rgba(255,255,255,0.05)] text-dim",
    完成: "bg-[#c9a84c] text-[#0a0a0c]",
  };
  return (
    <span className={`text-[0.6rem] px-2 py-0.5 rounded-full ${colors[status] || ""}`}>
      {status}
    </span>
  );
}

function WorkCard({ work, rowSpan }: { work: Work; rowSpan: number }) {
  const channel = getChannel(work.format);
  const colors = channelColors[channel];

  return (
    <Link
      href={`/works/${work.slug}`}
      className={`
        block p-3 border-l-4 ${colors.border} bg-card hover:bg-card-hover
        transition-all duration-300 cursor-pointer group
        ${rowSpan === 3 ? "min-h-[120px]" : rowSpan === 2 ? "min-h-[80px]" : "min-h-[50px]"}
      `}
      style={{ gridRow: `span ${rowSpan}` }}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="font-shippori font-bold text-sm group-hover:text-gold transition-colors">
          {work.title}
        </h3>
        <StatusBadge status={work.status} />
      </div>
      <div className="text-[0.65rem] text-dim">
        {work.debut}
        {work.meta.length > 0 && <span className="ml-2 opacity-60">{work.meta[0]}</span>}
      </div>
    </Link>
  );
}

function ChannelHeader({ name, color }: { name: ChannelType; color: string }) {
  return (
    <div className={`${color} px-3 py-2 text-center sticky top-[6px] z-10`}>
      <span className="text-xs font-zen tracking-widest">{name}ch</span>
    </div>
  );
}

export default function WorksPage() {
  const bunshoCh = mainWorks.filter((w) => getChannel(w.format) === "文章");
  const mangaCh = mainWorks.filter((w) => getChannel(w.format) === "マンガ");
  const conceptCh = mainWorks.filter((w) => getChannel(w.format) === "コンセプト");

  return (
    <main className="min-h-screen pt-[6px] pb-[60px]">
      {/* Header */}
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <Link href="/" className="text-gold text-sm hover:underline mb-4 inline-block">
          ← トップに戻る
        </Link>
        <h1 className="font-shippori text-2xl md:text-3xl font-bold mb-2">番組表</h1>
        <p className="text-secondary text-sm">
          レムリアテレビ ─ 百面惣の未完放送一覧
        </p>
      </div>

      {/* EPG Grid */}
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-3 gap-[1px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg overflow-hidden">
          {/* Channel Headers */}
          <ChannelHeader name="文章" color="bg-[#1d3557]" />
          <ChannelHeader name="マンガ" color="bg-[#6b2c3e]" />
          <ChannelHeader name="コンセプト" color="bg-[#5c4d1a]" />

          {/* Channel Content */}
          <div className="bg-deep p-2 space-y-[1px]">
            {bunshoCh.map((work) => (
              <WorkCard key={work.id} work={work} rowSpan={getRowSpan(work.scale)} />
            ))}
          </div>
          <div className="bg-deep p-2 space-y-[1px]">
            {mangaCh.map((work) => (
              <WorkCard key={work.id} work={work} rowSpan={getRowSpan(work.scale)} />
            ))}
          </div>
          <div className="bg-deep p-2 space-y-[1px]">
            {conceptCh.map((work) => (
              <WorkCard key={work.id} work={work} rowSpan={getRowSpan(work.scale)} />
            ))}
          </div>
        </div>
      </div>

      {/* Sub Works Section */}
      <div className="max-w-[1200px] mx-auto px-4 mt-12">
        <div className="border-t border-[rgba(255,255,255,0.1)] pt-8">
          <p className="text-xs text-dim tracking-widest mb-4">
            深夜・再放送枠 ─ AND MORE
          </p>
          <div className="flex flex-wrap gap-2">
            {subWorks.map((work) => (
              <Link
                key={work.id}
                href={`/works/${work.slug}`}
                className="text-dim text-[0.75rem] hover:text-secondary transition-colors font-shippori"
              >
                {work.title}
                {work.meta.includes("完成") && (
                  <span className="ml-1 text-gold text-[0.6rem]">★</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
