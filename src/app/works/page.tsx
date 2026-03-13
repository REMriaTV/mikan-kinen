"use client";

import Link from "next/link";
import { mainWorks, subWorks, Work, TimeSlot, timeSlotInfo, getWorksByTimeSlot } from "@/data/works";

const timeSlotOrder: TimeSlot[] = ["BOTTOM", "DRIFT", "REM", "LUCID", "TRANSIT"];

function WorkCard({ work }: { work: Work }) {
  return (
    <Link
      href={`/works/${work.slug}`}
      className="block p-4 bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] rounded-lg transition-all duration-300 cursor-pointer group border border-[rgba(255,255,255,0.05)]"
    >
      <h3 className="font-shippori font-bold text-base group-hover:text-gold transition-colors mb-2">
        {work.title}
      </h3>
      <div className="flex flex-wrap gap-2 text-[0.7rem] text-dim">
        <span>{work.debut}</span>
        {work.broadcastImage && (
          <span className="text-secondary">/ {work.broadcastImage}</span>
        )}
        {work.meta.length > 0 && (
          <span className="opacity-60">/ {work.meta[0]}</span>
        )}
      </div>
    </Link>
  );
}

function TimeSlotBlock({ slot }: { slot: TimeSlot }) {
  const info = timeSlotInfo[slot];
  const works = getWorksByTimeSlot(slot);

  return (
    <section
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: info.color }}
    >
      {/* Time Slot Header */}
      <div className="p-6 border-b border-[rgba(255,255,255,0.1)]">
        <div className="flex items-baseline gap-3 mb-2">
          <h2 className="font-shippori text-2xl font-bold tracking-wider">
            {info.name}
          </h2>
          <span className="text-sm text-[rgba(255,255,255,0.6)]">
            {info.frequency}
          </span>
        </div>
        <p className="text-sm text-[rgba(255,255,255,0.5)] mb-1">
          {info.time}
        </p>
        <p className="text-[0.8rem] text-[rgba(255,255,255,0.7)] leading-relaxed">
          {info.description}
        </p>
      </div>

      {/* Works Grid */}
      <div className="p-4 grid gap-2 sm:grid-cols-2">
        {works.map((work) => (
          <WorkCard key={work.id} work={work} />
        ))}
      </div>
    </section>
  );
}

export default function WorksPage() {
  return (
    <main className="min-h-screen pt-[6px] pb-[60px]">
      {/* Header */}
      <div className="max-w-[800px] mx-auto px-4 py-8">
        <Link href="/" className="text-gold text-sm hover:underline mb-4 inline-block">
          ← トップに戻る
        </Link>
        <h1 className="font-shippori text-2xl md:text-3xl font-bold mb-2">番組表</h1>
        <p className="text-secondary text-sm mb-2">
          レムリアテレビ ─ 百面惣の未完放送一覧
        </p>
        <p className="text-dim text-xs">
          番組編成は社の方針で途中で変わることがあります
        </p>
      </div>

      {/* Time Slot Blocks (Vertical Layout) */}
      <div className="max-w-[800px] mx-auto px-4 space-y-4">
        {timeSlotOrder.map((slot) => (
          <TimeSlotBlock key={slot} slot={slot} />
        ))}
      </div>

      {/* Sub Works Section */}
      <div className="max-w-[800px] mx-auto px-4 mt-12">
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
