/** YouTube の動画 ID / URL から 11 文字の ID を取り出す（PV デスク共通） */

export function parseYoutubeId(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace(/^\//, "").slice(0, 11);
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    const v = u.searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
  } catch {
    /* ignore */
  }
  const m = s.match(/(?:v=|\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m?.[1] ?? null;
}
