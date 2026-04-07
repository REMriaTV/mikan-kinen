import { NextResponse } from "next/server";
import {
  isValidNemumiTrackSlug,
  type NemumiRegistryCategory,
} from "@/lib/nemumi-audio-registry";
import { ensureDefaultNemumiTracksIfEmpty } from "@/lib/nemumi-tracks-ensure";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type CreateBody = {
  token?: string;
  trackId?: string;
  category?: NemumiRegistryCategory;
  label?: string;
  sort_order?: number;
};

export async function POST(req: Request) {
  const envToken = process.env.ADMIN_BROADCAST_TOKEN;
  if (!envToken) {
    return NextResponse.json(
      { ok: false, error: "Missing env: ADMIN_BROADCAST_TOKEN" },
      { status: 500 }
    );
  }

  let body: CreateBody;
  try {
    body = (await req.json()) as CreateBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.token || body.token !== envToken) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const trackId = typeof body.trackId === "string" ? body.trackId.trim() : "";
  const label = typeof body.label === "string" ? body.label.trim() : "";
  const category = body.category;
  const sortOrder = typeof body.sort_order === "number" && Number.isFinite(body.sort_order) ? body.sort_order : 0;

  if (!isValidNemumiTrackSlug(trackId)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "trackId は英小文字で始まり、英数字・ハイフン・アンダースコアのみ（2〜50文字）にしてください",
      },
      { status: 400 }
    );
  }

  if (!label) {
    return NextResponse.json({ ok: false, error: "label が必要です" }, { status: 400 });
  }

  if (
    category !== "bgm" &&
    category !== "se" &&
    category !== "interactive" &&
    category !== "extra"
  ) {
    return NextResponse.json({ ok: false, error: "category が不正です" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    await ensureDefaultNemumiTracksIfEmpty(supabase);
    const { data: exists } = await supabase
      .from("nemumi_audio_tracks")
      .select("track_id")
      .eq("track_id", trackId)
      .maybeSingle();
    if (exists) {
      return NextResponse.json({ ok: false, error: "同じ trackId が既にあります" }, { status: 409 });
    }

    const now = new Date().toISOString();
    const { error } = await supabase.from("nemumi_audio_tracks").insert({
      track_id: trackId,
      category,
      label,
      sort_order: sortOrder,
      updated_at: now,
    });

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
