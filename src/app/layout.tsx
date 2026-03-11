import type { Metadata } from "next";
import { Shippori_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

const shipporiMincho = Shippori_Mincho({
  weight: ["400", "700", "800"],
  subsets: ["latin"],
  variable: "--font-shippori",
  display: "swap",
});

const zenKaku = Zen_Kaku_Gothic_New({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-zen-kaku",
  display: "swap",
});

export const metadata: Metadata = {
  title: "【未完記念トークショー】百面惣 ~育まれるもの~",
  description:
    "44作品。完成したのは、ほんの数本。それでも語りたいことがある。レムリアテレビ特別番組。2026.3.17 ONE NIGHT ONLY.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${shipporiMincho.variable} ${zenKaku.variable} antialiased bg-deep text-primary`}
      >
        {/* Color Bar Top */}
        <div className="color-bar fixed top-0 left-0 w-full h-[6px] z-[1000]" />

        {/* Noise Overlay */}
        <div className="noise-overlay" />

        {children}

        {/* Color Bar Bottom */}
        <div className="color-bar-bottom fixed bottom-0 left-0 w-full h-[6px] z-[1000]" />
      </body>
    </html>
  );
}
