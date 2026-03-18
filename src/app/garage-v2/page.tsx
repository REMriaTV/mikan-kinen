import GarageV2Client from "@/components/GarageV2Client";
import Image from "next/image";

// 仮タイトル＆コピー（後で差し替えやすいように定数化）
const GARAGE_V2_TITLE_JP = "バックヤード・ヘッド・チャンネル";
const GARAGE_V2_TITLE_EN = "BACKYARD HEAD CHANNEL";
const GARAGE_V2_DESCRIPTION =
  "無意識下で繋がる場所。眠っている作品を起こしに行く。";

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
                {GARAGE_V2_TITLE_EN}
              </p>
              <h1 className="font-shippori text-[clamp(1.5rem,3vw,2rem)] font-bold leading-snug">
                {GARAGE_V2_TITLE_JP}
              </h1>
            </div>
          </div>
          <p className="text-secondary text-sm leading-relaxed max-w-[620px]">
            {GARAGE_V2_DESCRIPTION}
          </p>
        </header>

        <section>
          <GarageV2Client />
        </section>
      </div>
    </main>
  );
}

