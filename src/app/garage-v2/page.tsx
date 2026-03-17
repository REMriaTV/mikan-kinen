import GarageV2Client from "@/components/GarageV2Client";
import Link from "next/link";
import Image from "next/image";

export default function GarageV2Page() {
  return (
    <main className="min-h-screen pt-[6px] pb-[60px]">
      <div className="max-w-[960px] mx-auto px-6 py-10 space-y-10">
        <header className="space-y-3">
          <div className="flex items-center gap-4">
            <Image
              src="/logo-nemumi.png"
              alt="レムリアテレビのロゴ"
              width={72}
              height={72}
              className="w-18 h-18 object-contain"
            />
            <div>
              <p className="text-[0.6rem] tracking-[0.5em] text-dim uppercase">
                Garage Hunt v2
              </p>
              <h1 className="font-shippori text-[clamp(1.5rem,3vw,2rem)] font-bold leading-snug">
                ガレージハント 実験版スタジオ
              </h1>
            </div>
          </div>
          <p className="text-secondary text-sm leading-relaxed max-w-[620px]">
            レムリアテレビのガレージ配信UIをカスタムで実験する専用ページです。
            音声とチャットが中心で、画面共有はサムネイルとして控えめに表示します。
          </p>
        </header>

        <section>
          <GarageV2Client />
        </section>

        <footer className="flex items-center justify-between text-[0.78rem] text-dim">
          <p>※ このページは開発用です。3/20パイロット本番では使用しません。</p>
          <Link href="/garage" className="text-gold hover:underline">
            ← 既存のガレージハントページへ
          </Link>
        </footer>
      </div>
    </main>
  );
}

