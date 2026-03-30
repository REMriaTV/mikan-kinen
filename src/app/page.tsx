import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import BroadcastCountdownBanner from "@/components/BroadcastCountdownBanner";
import MinogashiHeroBadge from "@/components/MinogashiHeroBadge";
import MinogashiSection from "@/components/MinogashiSection";
import {
  defaultBroadcastConfig,
  formatMinogashiHeroBadgeText,
  normalizeBroadcastConfig,
  type BroadcastConfig,
} from "@/lib/broadcast-config";

export const dynamic = "force-dynamic";

async function loadBroadcastConfig(): Promise<BroadcastConfig> {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return defaultBroadcastConfig;

  try {
    const supabase = createClient(url, serviceRoleKey, {
      auth: { persistSession: false },
    });
    const { data, error } = await supabase
      .from("broadcast_config")
      .select("config")
      .eq("id", "singleton")
      .maybeSingle();
    if (error) return defaultBroadcastConfig;
    const rawConfig: unknown = (data as { config?: unknown } | null | undefined)
      ?.config;
    return normalizeBroadcastConfig(rawConfig);
  } catch {
    return defaultBroadcastConfig;
  }
}

export default async function Home() {
  const cfg = await loadBroadcastConfig();
  const showMinogashi =
    cfg.topPage.minogashiVisible && cfg.topPage.minogashiYoutubeId.trim() !== "";
  const minogashiHeroBadgeText = formatMinogashiHeroBadgeText(
    cfg.topPage.minogashiHeroBadgeLead,
    cfg.topPage.minogashiTitle
  );
  return (
    <main>
      <BroadcastCountdownBanner />
      {/* HERO */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 py-20 relative">
        <p className="text-[0.7rem] tracking-[0.4em] uppercase text-dim mb-3 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <span className="text-gold">▶</span> レムリアテレビ意識波息株式会社　特別番組
        </p>
        <div className="inline-block border border-gold text-gold text-[0.65rem] tracking-[0.35em] px-5 py-1.5 mb-10 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          {cfg.topPage.heroDateBadge}
        </div>
        <h1 className="font-shippori font-extrabold text-[clamp(1.8rem,5vw,3.2rem)] leading-tight mb-2 animate-fade-in" style={{ animationDelay: "0.9s" }}>
          【未完記念トークショー】<br />百面惣 ～育まれるもの～
        </h1>
        <p className="font-shippori text-[clamp(1rem,2.5vw,1.5rem)] text-secondary mb-12 animate-fade-in" style={{ animationDelay: "1.1s" }}>
          完成してなくても、語りたいことがある。
        </p>
        <p className="text-[0.8rem] tracking-[0.3em] text-dim animate-fade-in" style={{ animationDelay: "1.4s" }}>
          <strong className="text-primary text-[1.1rem]">{cfg.topPage.heroDateLine}</strong>
          <br />
          ONLINE / 無料
        </p>
        {showMinogashi && cfg.topPage.minogashiCtaVariant === "B" ? (
          <div
            className="w-full flex justify-center px-2 animate-fade-in"
            style={{ animationDelay: "1.55s" }}
          >
            <MinogashiHeroBadge badgeText={minogashiHeroBadgeText} />
          </div>
        ) : null}
        <div className="max-w-[520px] mt-12 animate-fade-in" style={{ animationDelay: "1.7s" }}>
          <p className="font-shippori text-[0.95rem] text-secondary leading-[2.2] tracking-[0.05em]">
            頭の中にはできてるんだ。<br />
            未完であり続けるストイックさ。<br />
            形にしたら終わってしまう。<br />
            語ることで出来事になる。<br />
            余白の中に物語が立ち現れる。
          </p>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float" style={{ animationDelay: "2.5s" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-dim">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {showMinogashi ? (
        <MinogashiSection
          label={cfg.topPage.minogashiLabel}
          title={cfg.topPage.minogashiTitle}
          dateLine={cfg.topPage.minogashiDate}
          description={cfg.topPage.minogashiDescription}
          youtubeId={cfg.topPage.minogashiYoutubeId.trim()}
        />
      ) : null}

      <div className="divider" />

      {/* STATS */}
      <div className="flex justify-center gap-12 flex-wrap py-16 max-w-[680px] mx-auto px-6">
        <div className="text-center">
          <div className="font-shippori text-[2.4rem] font-extrabold text-gold leading-none">44</div>
          <div className="text-[0.7rem] text-dim tracking-[0.15em] mt-2">作品</div>
        </div>
        <div className="text-center">
          <div className="font-shippori text-[2.4rem] font-extrabold text-gold leading-none">6+</div>
          <div className="text-[0.7rem] text-dim tracking-[0.15em] mt-2">年の制作期間</div>
        </div>
        <div className="text-center">
          <div className="font-shippori text-[2.4rem] font-extrabold text-gold leading-none">∞</div>
          <div className="text-[0.7rem] text-dim tracking-[0.15em] mt-2">語りたいこと</div>
        </div>
      </div>

      <div className="divider" />

      {/* ABOUT */}
      <section className="max-w-[680px] mx-auto px-6 py-20">
        <p className="text-[0.6rem] tracking-[0.5em] text-dim uppercase mb-2">About</p>
        <h2 className="font-shippori font-bold text-[clamp(1.3rem,3vw,1.8rem)] mb-8 leading-snug">
          未完記念ってなに？<br />未完で何を記念するの！？
        </h2>
        <p className="text-secondary text-[0.92rem] leading-[2] mb-5">
          44の物語。ドラマ、映画、コミック、小説──ジャンルも形式もバラバラに、6年以上にわたって生み出され続けてきた作品群。完成に至ったのは、ほんの数本。
        </p>
        <p className="text-secondary text-[0.92rem] leading-[2] mb-5">
          「完成させて欲しい」という声をもらい続けている。でも、終わらせることができない。終わらせたくないのかもしれない。
        </p>
        <p className="text-secondary text-[0.92rem] leading-[2] mb-5">
          だったら、語ろう。プロット、ストーリーボード、途中の原稿──あらゆる「過程」を見せながら、有り余る情熱で語り尽くす。それ自体がひとつのエンタメとして成り立つのではないか。
        </p>
        <p className="text-secondary text-[0.92rem] leading-[2]">
          ロマンに満ちた未完の大作集について、大いに語るワンナイト。
        </p>
      </section>

      <div className="divider divider-wide" />

      {/* メイン：番組表 */}
      <section className="max-w-[680px] mx-auto text-center px-6 pt-20 pb-10">
        <p className="text-[0.6rem] tracking-[0.5em] text-dim uppercase mb-2">
          Works
        </p>
        <h2 className="font-shippori font-bold text-[clamp(1.3rem,3vw,1.8rem)] mb-6">
          44の未完作品たち
        </h2>
        <p className="text-secondary text-sm mb-8 max-w-md mx-auto">
          文章、マンガ、コンセプト──<br />
          レムリアテレビの番組表でご覧ください。
        </p>
        <Link
          href="/works"
          className="inline-block text-[0.8rem] tracking-[0.3em] bg-gold text-deep px-12 py-4 border border-gold hover:bg-transparent hover:text-gold transition-all"
        >
          ▶ 番組表を見る
        </Link>
      </section>

      {/* サブ：コラム（見出しサイズ・CTAを一段下げ、番組表の補助導線） */}
      <section className="max-w-[560px] mx-auto px-6 pb-20">
        <div className="border-t border-[rgba(255,255,255,0.08)] pt-12 text-center">
          <p className="text-[0.55rem] tracking-[0.35em] text-dim uppercase mb-1 opacity-75">
            Column
          </p>
          <p className="text-[0.68rem] text-dim mb-3 tracking-[0.06em]">
            番組のほかに
          </p>
          <h2 className="font-shippori font-semibold text-[clamp(1.05rem,2.4vw,1.35rem)] mb-4 text-secondary">
            レムの波打ち際より
          </h2>
          <p className="text-[0.8rem] text-dim leading-[1.9] mb-6 max-w-[26rem] mx-auto">
            夢と現実の境界線で綴る、走り書きの備忘録です。
          </p>
          <Link
            href="/negoto"
            className="inline-block text-[0.72rem] tracking-[0.22em] text-gold/90 border border-gold/45 px-8 py-2.5 hover:bg-gold/8 hover:border-gold/70 transition-all"
          >
            コラムを読む →
          </Link>
        </div>
      </section>

      <div className="divider" />

      {/* PROGRAM */}
      <section className="max-w-[680px] mx-auto px-6 py-20">
        <p className="text-[0.6rem] tracking-[0.5em] text-dim uppercase mb-2">Program</p>
        <h2 className="font-shippori font-bold text-[clamp(1.3rem,3vw,1.8rem)] mb-8">
          当日の内容
        </h2>
        <ol className="list-none counter-reset-program">
          {cfg.programItems.map((item, i) => (
            <li key={i} className="py-5 border-b border-[rgba(255,255,255,0.04)] flex gap-5 items-baseline">
              <span className="text-[0.7rem] text-gold tracking-[0.1em] shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <strong className="font-shippori font-bold block mb-1">{item.title}</strong>
                <span className="text-[0.8rem] text-dim">{item.desc}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="divider" />

      {/* PROFILE */}
      <section className="max-w-[680px] mx-auto px-6 py-20">
        <p className="text-[0.6rem] tracking-[0.5em] text-dim uppercase mb-2">Speaker</p>
        <h2 className="font-shippori font-bold text-[clamp(1.3rem,3vw,1.8rem)] mb-8">
          語り手
        </h2>
        <div className="bg-card border border-[rgba(255,255,255,0.06)] p-10">
          <h3 className="font-shippori text-[1.4rem] font-extrabold mb-1">百面惣</h3>
          <p className="text-[0.7rem] text-dim tracking-[0.2em] mb-5">HYAKUMENSO</p>
          <p className="text-secondary text-[0.88rem] leading-[1.9]">
            レムリアテレビの総合プロデューサー兼クリエイティブディレクター。複数の顔を持ち、プロジェクトごとに異なるスタイルで制作を指揮するため、「百面」の異名を持つ。表立った役員ではなく、あくまでクリエイティブの現場に身を置き続けるスタンスを貫いている。
          </p>
        </div>
      </section>

      <div className="divider" />

      {/* CTA */}
      <section className="text-center py-24 px-6 max-w-[680px] mx-auto">
        <p className="text-[0.6rem] tracking-[0.5em] text-dim uppercase mb-2">Join</p>
        <h2 className="font-shippori font-bold text-[clamp(1.3rem,3vw,1.8rem)] mb-4">
          参加する
        </h2>
        <p className="text-secondary text-[0.88rem] mb-10">
          {cfg.topPage.joinDateLine}
          <br />
          お風呂に入って、<br />布団の中からどうぞ。
        </p>
        <a
          href="https://forms.gle/sv8kSGbv2qhSzh3M9"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-[0.8rem] tracking-[0.3em] bg-gold text-deep px-12 py-4 border border-gold hover:bg-transparent hover:text-gold transition-all"
        >
          参加を申し込む
        </a>
        <p className="mt-4 text-[0.72rem] text-dim">
          ※ Googleフォームが開きます。
        </p>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-10 px-6 text-[0.6rem] text-dim tracking-[0.2em] leading-[2]">
        <p className="font-shippori text-[0.75rem] text-secondary mb-2">
          夢に生きる。おわりからはじまりまで。
        </p>
        <p>
          REMURIA TELEPATHIC NETWORK CORPORATION<br />
          レムリアテレビ意識波息株式会社
        </p>
      </footer>
    </main>
  );
}
