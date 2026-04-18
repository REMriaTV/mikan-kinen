import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import PvDeskEditor from "@/components/PvDeskEditor";

export const metadata: Metadata = {
  title: "PV 制作デスク（編集）| 播州サバイブ",
  description: "町内環境PVの絵コンテ・制作メモを編集する管理用ページです。",
  robots: { index: false, follow: false },
};

function EditorFallback() {
  return (
    <div className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.25)] px-6 py-16 text-center text-secondary">
      読み込み中…
    </div>
  );
}

export default function BanshuPvDeskEditPage() {
  return (
    <main className="min-h-screen pb-[72px] pt-[6px]">
      <div className="mx-auto max-w-[720px] px-6 py-10">
        <Link href="/works/banshu-survive/pv-desk" className="mb-8 inline-block text-sm text-gold hover:underline">
          ← 閲覧ページ（公開）
        </Link>
        <Suspense fallback={<EditorFallback />}>
          <PvDeskEditor />
        </Suspense>
      </div>
    </main>
  );
}
