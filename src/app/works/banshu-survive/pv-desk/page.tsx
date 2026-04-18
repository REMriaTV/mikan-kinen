import type { Metadata } from "next";
import Link from "next/link";
import PvDeskViewer from "@/components/PvDeskViewer";

export const metadata: Metadata = {
  title: "町内環境PV 制作進行（公開）| 播州サバイブ",
  description:
    "町内環境PVの絵コンテ・説明・歌詞・制作の記録を公開するレムリアテレビ制作進行ページです。編集は別URLです。",
};

export default function BanshuPvDeskPage() {
  return (
    <main className="min-h-screen pb-[72px] pt-[6px]">
      <div className="mx-auto max-w-[840px] px-6 py-10">
        <Link
          href="/works/banshu-survive"
          className="mb-8 inline-block text-sm text-gold hover:underline"
        >
          ← 播州サバイブ（作品ページ）
        </Link>
        <PvDeskViewer />
      </div>
    </main>
  );
}
