import type { Metadata } from "next";
import NegotoBackToHome from "@/components/NegotoBackToHome";
import "./negoto.css";

export const metadata: Metadata = {
  title: "レムの波打ち際より | REMREAL TV",
  description:
    "夢と現実の境界線で綴る、走り書きの備忘録。レムリアテレビのコラム。",
};

export default function NegotoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="negoto-root relative z-[1002] min-h-screen bg-[#0D0F12]">
      {children}
      <NegotoBackToHome />
    </div>
  );
}
