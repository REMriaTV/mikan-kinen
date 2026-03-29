import { NextResponse } from "next/server";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

export async function POST(req: Request) {
  const expected = process.env.GARAGE_V2_PASSPHRASE;
  if (!expected) {
    return NextResponse.json({ ok: true });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const passphrase =
    typeof body === "object" && body !== null && "passphrase" in body
      ? String((body as { passphrase?: unknown }).passphrase ?? "")
      : "";
  const ok = timingSafeEqual(passphrase, expected);
  return NextResponse.json({ ok });
}
