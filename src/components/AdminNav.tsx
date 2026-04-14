"use client";

import Link from "next/link";

type Props = {
  token: string;
  current: "broadcast" | "nemumi-audio" | "negoto" | "announcements";
};

export default function AdminNav({ token, current }: Props) {
  const q = `?token=${encodeURIComponent(token)}`;
  const linkN = (active: boolean) =>
    active
      ? "text-[#E8E4DF] font-semibold"
      : "text-[rgba(232,228,223,0.5)] hover:text-[rgba(224,90,51,0.9)]";

  return (
    <nav className="flex flex-wrap gap-x-3 gap-y-2 mb-8 pb-4 border-b border-[rgba(255,255,255,0.1)] text-[0.82rem] items-center">
      <Link href={`/admin/broadcast${q}`} className={linkN(current === "broadcast")}>
        Broadcast 設定
      </Link>
      <span className="text-[rgba(255,255,255,0.2)] select-none">|</span>
      <Link href={`/admin/negoto${q}`} className={linkN(current === "negoto")}>
        寝言帳
      </Link>
      <span className="text-[rgba(255,255,255,0.2)] select-none">|</span>
      <Link href={`/admin/nemumi-audio${q}`} className={linkN(current === "nemumi-audio")}>
        ねむみ音素材
      </Link>
      <span className="text-[rgba(255,255,255,0.2)] select-none">|</span>
      <Link
        href={`/admin/announcements${q}`}
        className={linkN(current === "announcements")}
      >
        お知らせ
      </Link>
    </nav>
  );
}
