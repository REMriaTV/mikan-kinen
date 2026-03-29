import Link from "next/link";
import { notFound } from "next/navigation";
import NegotoEntryClient from "@/components/NegotoEntryClient";
import { formatNegotoDateDot, parseNegotoBody } from "@/lib/negoto";
import {
  getPublishedNegotoBySlug,
  getPublishedNeighbors,
} from "@/lib/negoto-queries";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let title = "レムの波打ち際より";
  try {
    const entry = await getPublishedNegotoBySlug(decodeURIComponent(slug));
    if (entry) {
      title = `${entry.title} | レムの波打ち際より`;
    }
  } catch {
    /* ignore */
  }
  return { title };
}

export default async function NegotoEntryPage({ params }: Props) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);

  let entry: Awaited<ReturnType<typeof getPublishedNegotoBySlug>>;
  try {
    entry = await getPublishedNegotoBySlug(slug);
  } catch {
    throw new Error("Failed to load entry");
  }

  if (!entry) notFound();

  const { newer, older } = await getPublishedNeighbors(slug);
  const blocks = parseNegotoBody(entry.body);

  return (
    <>
      <div className="negoto-water-bg">
        <div className="negoto-water-fade-top" />
        <video
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
          aria-hidden
        >
          <source src="/videos/negoto-water.mp4" type="video/mp4" />
        </video>
        <div className="negoto-water-fade-bottom" />
      </div>

      <div className="negoto-sand-bg" />

      <div className="negoto-entry">
        <Link className="negoto-back" href="/negoto">
          ← レムの波打ち際より
        </Link>

        <div className="negoto-entry-header">
          <div className="negoto-entry-meta">
            <span className="negoto-entry-date">
              {formatNegotoDateDot(entry.date)}
            </span>
            <span className="negoto-entry-who">{entry.author}</span>
          </div>
          <h1 className="negoto-entry-title">{entry.title}</h1>
          {entry.topic ? (
            <div className="negoto-entry-topic">— {entry.topic}</div>
          ) : null}
        </div>

        <NegotoEntryClient
          blocks={blocks}
          newerSlug={newer?.slug ?? null}
          olderSlug={older?.slug ?? null}
        />
      </div>
    </>
  );
}
