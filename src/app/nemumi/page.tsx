import NemumiRoom from "@/components/NemumiRoom";
import Link from "next/link";

export default function NemumiPage() {
  return (
    <main className="min-h-screen pt-[6px] pb-[60px] flex items-center">
      <div className="max-w-[720px] mx-auto px-6 w-full">
        <header className="mb-10 text-center">
          <p className="text-[0.6rem] tracking-[0.5em] text-dim uppercase mb-3">
            Nemumi Channel
          </p>
          <div className="inline-flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full border border-[rgba(255,255,255,0.3)] flex items-center justify-center relative overflow-hidden">
              <div className="w-14 h-[2px] bg-[rgba(255,255,255,0.75)] rounded-full rotate-[-8deg]" />
              <div className="absolute left-[22%] bottom-[32%] w-[6px] h-[6px] rounded-full bg-[rgba(255,255,255,0.75)]" />
              <div className="absolute right-[22%] bottom-[32%] w-[6px] h-[6px] rounded-full bg-[rgba(255,255,255,0.75)]" />
            </div>
          </div>
          <h1 className="font-shippori text-[clamp(1.5rem,3vw,2.1rem)] font-bold leading-snug mb-3">
            ねむみチャンネル
          </h1>
          <p className="text-secondary text-sm leading-relaxed max-w-[480px] mx-auto">
            画面を見なくていい、音だけの放送枠です。{" "}
            目を閉じて、布団に入ったまま、レムリアテレビの気配だけ受信してください。
          </p>
        </header>

        <section className="bg-card border border-[rgba(255,255,255,0.1)] rounded-xl px-6 py-6 mb-8">
          <NemumiRoom />
        </section>

        <div className="flex items-center justify-between text-[0.78rem] text-dim">
          <p>※ 音が出ない場合は、ブラウザの音量やミュート設定を確認してください。</p>
          <Link href="/" className="text-gold hover:underline">
            ← トップへ
          </Link>
        </div>
      </div>
    </main>
  );
}

