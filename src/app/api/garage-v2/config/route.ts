import { NextResponse } from "next/server";

export async function GET() {
  const passphraseRequired = Boolean(
    process.env.GARAGE_V2_PASSPHRASE && process.env.GARAGE_V2_PASSPHRASE.length > 0
  );
  return NextResponse.json({ passphraseRequired });
}
