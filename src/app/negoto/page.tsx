import Link from "next/link";
import NegotoPageReveal from "@/components/NegotoPageReveal";
import {
  excerptFromBody,
  formatNegotoDateDot,
} from "@/lib/negoto";
import { listPublishedNegotoEntries } from "@/lib/negoto-queries";

export const dynamic = "force-dynamic";

export default async function NegotoTopPage() {
  let entries: Awaited<ReturnType<typeof listPublishedNegotoEntries>> = [];
  let loadError: string | null = null;

  try {
    entries = await listPublishedNegotoEntries();
  } catch (e) {
    loadError = e instanceof Error ? e.message : String(e);
  }

  return (
    <NegotoPageReveal>
      <div className="negoto-video-header">
        <video autoPlay muted loop playsInline>
          <source src="/videos/negoto-header.mp4" type="video/mp4" />
        </video>
        <div className="negoto-video-fade-top" />
        <div className="negoto-video-fade" />
        <div className="negoto-video-title">
          <h1>レムの波打ち際より</h1>
        </div>
      </div>

      <div className="negoto-body-wrap">
        <div className="negoto-desc negoto-fi">
          深いノンレム睡眠から浅いレム睡眠へ移行する、夢と現実の境界線。
          <br />
          レムの波が押し寄せる浜辺に、夢の海から戻ってきて枝で書くメモ。
          <br />
          完成したコラムというより、走り書きの備忘録。
          <br />
          朝、起きた時に夢の内容をメモに書こうとして、それすらも夢の中だった——
          <br />
          そんな手触りの場所です。
        </div>

        {loadError ? (
          <p
            className="text-center text-sm"
            style={{ color: "rgba(232,228,223,0.35)" }}
          >
            一覧を読み込めませんでした。時間をおいて再度お試しください。
          </p>
        ) : entries.length === 0 ? (
          <p
            className="text-center text-sm"
            style={{ color: "rgba(232,228,223,0.25)" }}
          >
            まだ公開中の寝言はありません。
          </p>
        ) : (
          entries.map((e, idx) => (
            <div key={e.id}>
              <Link
                href={`/negoto/${encodeURIComponent(e.slug)}`}
                className="negoto-card negoto-fi"
              >
                <div className="negoto-card-meta">
                  <span className="negoto-card-date">
                    {formatNegotoDateDot(e.date)}
                  </span>
                  <span className="negoto-card-who">{e.author}</span>
                </div>
                <div className="negoto-card-title">{e.title}</div>
                {e.topic ? (
                  <div className="negoto-card-topic">— {e.topic}</div>
                ) : null}
                <div className="negoto-card-excerpt">
                  {excerptFromBody(e.body)}
                </div>
                <span className="negoto-card-arrow">→</span>
              </Link>
              {idx < entries.length - 1 ? (
                <div className="negoto-zzz-sep negoto-fi">zzz . . .</div>
              ) : null}
            </div>
          ))
        )}

        <div className="negoto-page-footer">
          <p>REMREAL TELEPATHIC NETWORK</p>
          <p>夢の中であいましょう</p>
        </div>
      </div>
    </NegotoPageReveal>
  );
}
