"use client";

import Link from "next/link";

type Props = {
  token: string;
  current: "broadcast" | "nemumi-audio";
};

export default function AdminNav({ token, current }: Props) {
  const q = `?token=${encodeURIComponent(token)}`;
  return (
    <nav className="flex flex-wrap gap-3 gap-y-2 mb-8 pb-4 border-b border-[rgba(255,255,255,0.1)] text-[0.85rem]">
      <Link
        href={`/admin/broadcast${q}`}
        className={
          current === "broadcast"
            ? "text-[#E8E4DF] font-semibold"
            : "text-[rgba(232,228,223,0.5)] hover:text-[rgba(224,90,51,0.9)]"
        }
      >
        Broadcast 設定
      </Link>
      <span className="text-[rgba(255,255,255,0.2)]">|</span>
      <Link
        href={`/admin/nemumi-audio${q}`}
        className={
          current === "nemumi-audio"
            ? "text-[#E8E4DF] font-semibold"
            : "text-[rgba(232,228,223,0.5)] hover:text-[rgba(224,90,51,0.9)]"
        }
      >
        ねむみ音素材
      </Link>
    </nav>
  );
}
