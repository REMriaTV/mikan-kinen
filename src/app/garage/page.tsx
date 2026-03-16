import GarageRoom from "@/components/GarageRoom";
import Link from "next/link";

export default function GaragePage() {
  return (
    <main className="min-h-screen pt-[6px] pb-[60px]">
      <div className="max-w-[880px] mx-auto px-6 py-10 space-y-10">
        <header className="space-y-3">
          <p className="text-[0.6rem] tracking-[0.5em] text-dim uppercase">
            Garage Hunt
          </p>
          <h1 className="font-shippori text-[clamp(1.6rem,3vw,2.2rem)] font-bold leading-snug">
            ガレージハント特別番組
          </h1>
          <p className="text-secondary text-sm leading-relaxed">
            百面惣のガレージに入り込んで、眠っている未発表作品を一緒に棚卸しする時間です。
            詳しい台本は決めすぎず、インスタライブのようなゆるい特番を想定しています。
          </p>
          <div className="flex flex-wrap gap-4 text-[0.78rem] text-dim">
            <span>日時：2026年3月20日（月）19:23 – 20:53</span>
            <span>形式：クローズド・パイロット放送（招待制）</span>
          </div>
        </header>

        <section className="space-y-3 text-[0.8rem] text-dim">
          <p>
            画面共有は百面惣のみが行います。参加する方は、カメラやマイクを自由にオン・オフして構いません。
          </p>
          <p>
            放送のあとには、音声だけを流す「ねむみチャンネル」へと移行する予定です。眠気が強い方は、そちらでまどろんでください。
          </p>
        </section>

        <section>
          <GarageRoom />
        </section>

        <footer className="border-t border-[rgba(255,255,255,0.1)] pt-6 flex flex-wrap items-center justify-between gap-4 text-[0.78rem] text-dim">
          <div>
            <p>放送が安定して動作しない場合は、Zoomでの配信に切り替えます。</p>
            <p className="mt-1">
              Zoom URL：{" "}
              <span className="underline decoration-dotted">
                https://zoom.us/j/4822977534
              </span>
            </p>
          </div>
          <Link href="/" className="text-gold hover:underline">
            ← トップページへ戻る
          </Link>
        </footer>
      </div>
    </main>
  );
}

