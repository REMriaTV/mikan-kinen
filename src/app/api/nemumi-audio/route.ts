import { NextResponse } from "next/server";
import { buildNemumiAudioPayload } from "@/lib/nemumi-audio-resolve";
import { ensureDefaultNemumiTracksIfEmpty } from "@/lib/nemumi-tracks-ensure";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();
    await ensureDefaultNemumiTracksIfEmpty(supabase);

    const [assetsRes, tracksRes] = await Promise.all([
      supabase.from("nemumi_audio_assets").select("track_id, public_url"),
      supabase.from("nemumi_audio_tracks").select("track_id, category, label, sort_order"),
    ]);
    if (assetsRes.error) {
      console.error("[nemumi-audio assets]", assetsRes.error);
    }
    if (tracksRes.error) {
      console.error("[nemumi-audio tracks]", tracksRes.error);
    }
    const assets = assetsRes.error ? [] : assetsRes.data ?? [];
    const tracks = tracksRes.error ? [] : tracksRes.data ?? [];
    return NextResponse.json(buildNemumiAudioPayload(assets, tracks));
  } catch (e) {
    console.error("[nemumi-audio GET]", e);
    return NextResponse.json(buildNemumiAudioPayload([], []));
  }
}
