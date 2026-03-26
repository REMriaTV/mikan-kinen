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

