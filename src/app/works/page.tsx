"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import WorkModal from "@/components/WorkModal";
import {
  subWorks,
  Work,
  HourSlot,
  TimeSlot,
  LunarPhase,
  timeSlotInfo,
  lunarPhaseInfo,
  hourSlotInfo,
  hourSlotOrder,
  lunarPhaseOrder,
  timeSlotRowCount,
  timeSlotFirstHour,
  getWorksByHourCell,
} from "@/data/works";

function WorkCell({
  work,
  bgColor,
  onClick,
}: {
  work: Work | null;
  bgColor: string;
  onClick?: () => void;
}) {
  if (!work) {
    return (
      <div
        className="min-h-[60px] h-full"
        style={{ backgroundColor: `${bgColor}33` }}
      />
    );
  }

  return (
    <div
      className="min-h-[60px] h-full p-1.5 flex flex-col justify-center cursor-pointer"
      style={{ backgroundColor: `${bgColor}66` }}
      onClick={onClick}
    >
      <div className="block px-1 py-0.5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors">
        <h4 className="font-shippori font-bold text-xs leading-snug break-words">
          {work.title}
        </h4>
        <div className="text-[0.55rem] text-[rgba(255,255,255,0.6)] leading-tight mt-0.5">
          <span>{work.debut}</span>
          {work.broadcastImage && (
            <span className="ml-1">/ {work.broadcastImage}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ScrollGuide({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-[rgba(255,255,255,0.2)] rounded-xl p-6 text-center max-w-xs">
        <p className="text-lg mb-4">← 横にスクロールできます →</p>
        <button
          onClick={onClose}
          className="text-sm text-gold hover:underline"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}

export default function WorksPage() {
  const [showScrollGuide, setShowScrollGuide] = useState(false);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const hasSeenGuide = sessionStorage.getItem("scrollGuideShown");

    if (isMobile && !hasSeenGuide) {
      setShowScrollGuide(true);
    }
  }, []);

  const handleCloseGuide = () => {
    setShowScrollGuide(false);
    sessionStorage.setItem("scrollGuideShown", "true");
  };

  // rowspanの開始行かどうかを判定
  const isFirstHourOfSlot = (hour: HourSlot): boolean => {
    const slot = hourSlotInfo[hour].timeSlot;
    return timeSlotFirstHour[slot] === hour;
  };

  return (
    <main className="min-h-screen pt-[6px] pb-[60px]">
      {showScrollGuide && <ScrollGuide onClose={handleCloseGuide} />}

      {/* Header */}
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <Link href="/" className="text-gold text-sm hover:underline mb-4 inline-block">
          ← トップに戻る
        </Link>
        <h1 className="font-shippori text-2xl md:text-3xl font-bold mb-2">REM RHYTHM</h1>
        <p className="text-secondary text-sm mb-2">
          レムリアテレビ ── 百面惣の未完放送一覧
        </p>
        <p className="text-dim text-xs">
          番組編成は社の方針で途中で変わることがあります
        </p>
      </div>

      {/* Matrix */}
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse table-fixed">
            {/* Column widths */}
            <colgroup>
              <col className="w-[100px]" />
              <col className="w-[70px]" />
              <col className="w-[130px]" />
              <col className="w-[130px]" />
              <col className="w-[130px]" />
              <col className="w-[130px]" />
              <col className="w-[130px]" />
              <col className="w-[130px]" />
            </colgroup>
            {/* Header Row (Lunar Phases) - sticky top */}
            <thead>
              <tr className="sticky top-0 z-30">
                {/* 時間帯グループヘッダー用の空セル */}
                <th className="p-2 border-b border-[rgba(255,255,255,0.2)] bg-[#0d0d0d]" />
                {/* 越境時間用の空セル */}
                <th className="p-2 border-b border-[rgba(255,255,255,0.2)] bg-[#0d0d0d]" />
                {/* Lunar Phase Headers */}
                {lunarPhaseOrder.map((phase) => {
                  const info = lunarPhaseInfo[phase];
                  return (
                    <th
                      key={phase}
                      className="p-2 border-b border-[rgba(255,255,255,0.2)] text-center bg-[#0d0d0d]"
                    >
                      <div className="font-shippori text-base font-bold">{info.name}</div>
                      <div className="text-[0.55rem] text-dim italic">{info.pinyin}</div>
                      <div className="text-[0.5rem] text-dim">{info.days}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Body Rows (Hour Slots) */}
            <tbody>
              {hourSlotOrder.map((hour) => {
                const hourInfo = hourSlotInfo[hour];
                const slotInfo = timeSlotInfo[hourInfo.timeSlot];
                const isFirstHour = isFirstHourOfSlot(hour);
                const rowSpan = timeSlotRowCount[hourInfo.timeSlot];

                return (
                  <tr key={hour}>
                    {/* 時間帯グループヘッダー（rowspan） */}
                    {isFirstHour && (
                      <th
                        rowSpan={rowSpan}
                        className="sticky left-0 z-10 p-2 text-left border-r border-[rgba(255,255,255,0.2)] align-middle w-[100px]"
                        style={{ backgroundColor: slotInfo.color }}
                      >
                        <div className="font-shippori text-sm font-bold text-white">
                          {slotInfo.name}
                        </div>
                        <div className="text-[0.5rem] text-[rgba(255,255,255,0.7)]">
                          {slotInfo.frequency}
                        </div>
                      </th>
                    )}

                    {/* 越境時間セル */}
                    <th
                      className="sticky z-10 p-1.5 text-center border-r border-[rgba(255,255,255,0.15)] bg-deep w-[70px]"
                      style={{ left: "100px" }}
                    >
                      <div className="text-xs font-bold">{hourInfo.displayTime}</div>
                      <div className="text-[0.5rem] text-dim">({hourInfo.realTime})</div>
                    </th>

                    {/* Cells */}
                    {lunarPhaseOrder.map((phase, index) => {
                      const works = getWorksByHourCell(hour, phase);
                      const work = works.length > 0 ? works[0] : null;
                      const isLastColumn = index === lunarPhaseOrder.length - 1;
                      return (
                        <td
                          key={`${hour}-${phase}`}
                          className={`p-0 border-b border-[rgba(255,255,255,0.1)] ${!isLastColumn ? 'border-r border-r-[rgba(255,255,255,0.1)]' : ''}`}
                        >
                          <WorkCell
                            work={work}
                            bgColor={slotInfo.color}
                            onClick={work ? () => setSelectedWork(work) : undefined}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sub Works Section */}
      <div className="max-w-[1200px] mx-auto px-4 mt-12">
        <div className="border-t border-[rgba(255,255,255,0.1)] pt-8">
          <p className="text-xs text-dim tracking-widest mb-4">
            深夜・再放送枠 ── AND MORE
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

      {/* Work Modal */}
      {selectedWork && (
        <WorkModal work={selectedWork} onClose={() => setSelectedWork(null)} />
      )}
    </main>
  );
}
