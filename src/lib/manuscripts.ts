export type Manuscript = {
  id: string;
  work_id: string;
  title: string;
  author: string;
  status: string;
  position: string;
  body: string;
  created_at: string;
  updated_at: string;
};

export type ManuscriptInput = {
  work_id: string;
  title: string;
  author: string;
  status: string;
  position: string;
  body: string;
};

export function splitPagesFromBody(body: string): string[] {
  if (!body.trim()) return [];
  return body
    .split(/\n---\n/g)
    .map((section) => section.trim())
    .filter((section) => section.length > 0);
}

export function formatParagraph(text: string): string {
  const trimmedRight = text.replace(/\s+$/g, "");
  if (!trimmedRight) return "";
  if (trimmedRight.startsWith("「") || trimmedRight.startsWith("『")) return trimmedRight;
  if (trimmedRight.startsWith("　")) return trimmedRight;
  return `　${trimmedRight}`;
}

export function buildFormattedParagraphs(section: string): string[] {
  return section
    .split(/\n{2,}/g)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) =>
      p
        .split("\n")
        .map((line) => formatParagraph(line))
        .join("\n")
    );
}

export type ParagraphBlock = {
  text: string;
  gapLines: number;
};

export function buildParagraphBlocks(section: string): ParagraphBlock[] {
  const lines = section.split("\n");
  const blocks: Array<{ raw: string; gapLines: number }> = [];

  let currentLines: string[] = [];
  let pendingGapLines = 0;
  let currentGapBefore = 0;

  const flushCurrent = () => {
    if (currentLines.length === 0) return;
    blocks.push({
      raw: currentLines.join("\n"),
      gapLines: currentGapBefore,
    });
    currentLines = [];
    currentGapBefore = 0;
  };

  for (const line of lines) {
    if (line.trim() === "") {
      flushCurrent();
      pendingGapLines += 1;
      continue;
    }

    if (currentLines.length === 0) {
      currentGapBefore = pendingGapLines;
      pendingGapLines = 0;
    }
    currentLines.push(line);
  }
  flushCurrent();

  return blocks.map((b) => ({
    gapLines: b.gapLines,
    text: b.raw
      .split("\n")
      .map((line) => formatParagraph(line))
      .join("\n"),
  }));
}

