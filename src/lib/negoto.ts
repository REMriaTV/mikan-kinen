import type { SupabaseClient } from "@supabase/supabase-js";

export const NEGOTO_AUTHORS = [
  "百面惣の寝言",
  "味木の寝言",
  "PEHの寝言",
  "絵本ノリの寝言",
  "エアーの寝言",
  "O津K平の寝言",
] as const;

export type NegotoAuthor = (typeof NEGOTO_AUTHORS)[number];

export type NegotoEntryRow = {
  id: string;
  slug: string;
  title: string;
  topic: string | null;
  author: string;
  body: string;
  published: boolean;
  date: string;
  created_at: string;
  updated_at: string;
};

/** 本文1行ぶんの画像（Markdown `![alt](url)` から生成） */
export type NegotoBodyImage = {
  kind: "image";
  src: string;
  alt: string;
};

export type NegotoSectionBlock = {
  kind: "section";
  h2?: string;
  /** 段落テキストまたは画像ブロック（上から順） */
  paragraphs: (string | NegotoBodyImage)[];
};

export type NegotoZzzBlock = {
  kind: "zzz";
  isFirst: boolean;
};

export type NegotoParsedBlock = NegotoSectionBlock | NegotoZzzBlock;

/** 段落・見出し内の `**太字**` を表すフラットな断片 */
export type NegotoInlinePiece =
  | { kind: "text"; text: string }
  | { kind: "bold"; text: string };

const MD_IMAGE_LINE = /^\s*!\[([^\]]*)\]\(([^)]+)\)\s*$/;

/** `**` で挟んだ部分を太字として解釈（Markdown に近い簡易ルール）。 */
export function parseNegotoBoldSegments(text: string): NegotoInlinePiece[] {
  const parts = text.split(/\*\*/);
  if (parts.length === 1) {
    return [{ kind: "text", text }];
  }
  const out: NegotoInlinePiece[] = [];
  for (let i = 0; i < parts.length; i++) {
    const segment = parts[i];
    if (i % 2 === 0) {
      out.push({ kind: "text", text: segment });
    } else {
      out.push({ kind: "bold", text: segment });
    }
  }
  return out;
}

/**
 * コラム本文に埋め込む画像 URL を制限する。
 * - `https://...` のみ（外部）
 * - 同一サイトのパス `/...` のみ
 */
export function sanitizeNegotoImageSrc(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  if (s.startsWith("/")) {
    if (s.startsWith("//")) return null;
    return s;
  }
  try {
    const u = new URL(s);
    if (u.protocol === "https:") return u.toString();
    return null;
  } catch {
    return null;
  }
}

/** `---` 区切り・`##` 見出し・空行段落・`![alt](url)` 画像行をパース */
export function parseNegotoBody(raw: string): NegotoParsedBlock[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  const parts = trimmed.split(/\r?\n---\r?\n/);
  const out: NegotoParsedBlock[] = [];

  parts.forEach((part, idx) => {
    if (idx > 0) {
      out.push({ kind: "zzz", isFirst: idx === 1 });
    }
    out.push(...parseNegotoSegment(part.trim()));
  });

  return out;
}

function parseNegotoSegment(segment: string): NegotoParsedBlock[] {
  if (!segment) return [];

  const lines = segment.split(/\r?\n/);
  const blocks: NegotoSectionBlock[] = [];
  let current: NegotoSectionBlock = { kind: "section", paragraphs: [] };
  let paraLines: string[] = [];

  const flushParagraph = () => {
    if (paraLines.length === 0) return;
    current.paragraphs.push(paraLines.join(""));
    paraLines = [];
  };

  const flushSection = () => {
    flushParagraph();
    if (current.h2 || current.paragraphs.length > 0) {
      blocks.push(current);
    }
    current = { kind: "section", paragraphs: [] };
  };

  for (const line of lines) {
    const t = line.trim();
    const m = /^##\s+(.+)$/.exec(t);
    if (m) {
      flushSection();
      current.h2 = m[1].trim();
      continue;
    }
    if (t === "") {
      flushParagraph();
      continue;
    }
    const imgM = MD_IMAGE_LINE.exec(line);
    if (imgM) {
      flushParagraph();
      const src = sanitizeNegotoImageSrc(imgM[2]);
      if (src) {
        current.paragraphs.push({
          kind: "image",
          src,
          alt: imgM[1].trim(),
        });
      } else {
        paraLines.push(line.trimEnd());
      }
      continue;
    }
    paraLines.push(line.trimEnd());
  }

  flushParagraph();
  if (current.h2 || current.paragraphs.length > 0) {
    blocks.push(current);
  }

  return blocks;
}

/** カード用: 本文から先頭3行相当の抜粋（装飾行を除く） */
export function excerptFromBody(body: string, maxLines = 3): string {
  const lines = body.split(/\r?\n/).map((l) => l.trim());
  const taken: string[] = [];
  for (const line of lines) {
    if (!line || line === "---" || /^##\s/.test(line)) continue;
    if (MD_IMAGE_LINE.test(line)) continue;
    taken.push(line.replace(/\*\*/g, ""));
    if (taken.length >= maxLines) break;
  }
  return taken.join(" ");
}

export function formatNegotoDateDot(isoDate: string): string {
  return isoDate.replace(/-/g, ".");
}

/** 新規作成時: date (YYYY-MM-DD) から一意な slug を決定 */
export async function generateSlugForDate(
  supabase: SupabaseClient,
  dateIso: string
): Promise<string> {
  const base = dateIso;
  const { data, error } = await supabase
    .from("negoto_entries")
    .select("slug")
    .like("slug", `${base}%`);

  if (error) throw new Error(error.message);

  const re = new RegExp(`^${base}(-\\d+)?$`);
  const used = new Set(
    (data ?? [])
      .map((r: { slug: string }) => r.slug)
      .filter((s) => re.test(s))
  );
  if (!used.has(base)) return base;

  let n = 2;
  while (used.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export function isValidAuthor(s: string): s is NegotoAuthor {
  return (NEGOTO_AUTHORS as readonly string[]).includes(s);
}
