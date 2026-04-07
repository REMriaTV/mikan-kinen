import { NextResponse } from "next/server";
import { buildNemumiAudioPayload } from "@/lib/nemumi-audio-resolve";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("nemumi_audio_assets")
      .select("track_id, public_url");
    if (error) {
      console.error("[nemumi-audio GET]", error);
      return NextResponse.json(buildNemumiAudioPayload([]));
    }
    return NextResponse.json(buildNemumiAudioPayload(data ?? []));
  } catch (e) {
    console.error("[nemumi-audio GET]", e);
    return NextResponse.json(buildNemumiAudioPayload([]));
  }
}
