import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type Body = {
  token?: string;
  trackId?: string;
};

export async function POST(req: Request) {
  const envToken = process.env.ADMIN_BROADCAST_TOKEN;
  if (!envToken) {
    return NextResponse.json(
      { ok: false, error: "Missing env: ADMIN_BROADCAST_TOKEN" },
      { status: 500 }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.token || body.token !== envToken) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const trackId = typeof body.trackId === "string" ? body.trackId.trim() : "";
  if (!trackId) {
    return NextResponse.json({ ok: false, error: "Invalid trackId" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data: row } = await supabase
      .from("nemumi_audio_assets")
      .select("storage_path")
      .eq("track_id", trackId)
      .maybeSingle();

    if (row?.storage_path) {
      await supabase.storage.from("nemumi-audio").remove([row.storage_path]);
    }

    const { error } = await supabase.from("nemumi_audio_assets").delete().eq("track_id", trackId);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, trackId });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
