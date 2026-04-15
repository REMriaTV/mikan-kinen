import type { Metadata } from "next";
import Link from "next/link";
import PvDeskClient from "@/components/PvDeskClient";

export const metadata: Metadata = {
  title: "町内環境PV 制作デスク | 播州サバイブ",
  description:
    "絵コンテ・歌詞・撮影メモをブラウザで編集し、Supabase に保存するレムリアテレビ風の制作進行ページです。",
};

export default function BanshuPvDeskPage() {
  return (
    <main className="min-h-screen pb-[72px] pt-[6px]">
      <div className="mx-auto max-w-[720px] px-6 py-10">
        <Link
          href="/works/banshu-survive"
          className="mb-8 inline-block text-sm text-gold hover:underline"
        >
          ← 播州サバイブ（作品ページ）
        </Link>
        <PvDeskClient />
      </div>
    </main>
  );
}
