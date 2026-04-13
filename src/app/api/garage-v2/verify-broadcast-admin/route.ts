import { NextResponse } from "next/server";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

/** 管理画面と同じ ADMIN_BROADCAST_TOKEN で REM 音楽パネルを有効化する */
export async function POST(req: Request) {
  const expected = process.env.ADMIN_BROADCAST_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_BROADCAST_TOKEN is not configured" },
      { status: 500 }
    );
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const token =
    typeof body === "object" && body !== null && "token" in body
      ? String((body as { token?: unknown }).token ?? "")
      : "";
  const ok = timingSafeEqual(token, expected);
  return NextResponse.json({ ok });
}
