import { NextResponse } from "next/server";
import {
  NEMUMI_AUDIO_REGISTRY,
  type NemumiRegistryCategory,
} from "@/lib/nemumi-audio-registry";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

export async function GET(req: Request) {
  const envToken = process.env.ADMIN_BROADCAST_TOKEN;
  if (!envToken) {
    return NextResponse.json(
      { ok: false, error: "Missing env: ADMIN_BROADCAST_TOKEN" },
      { status: 500 }
    );
  }
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token || token !== envToken) return unauthorized();

  try {
    const supabase = getSupabaseAdminClient();
    const { data: rows, error } = await supabase
      .from("nemumi_audio_assets")
      .select("track_id, storage_path, public_url, updated_at");
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const registry = NEMUMI_AUDIO_REGISTRY.map((e) => {
      const row = (rows ?? []).find((x) => x.track_id === e.trackId);
      return {
        trackId: e.trackId,
        category: e.category as NemumiRegistryCategory,
        label: e.label,
        defaultPath: e.defaultPath,
        storagePath: row?.storage_path ?? null,
        publicUrl: row?.public_url ?? null,
        updatedAt: row?.updated_at ?? null,
      };
    });

    return NextResponse.json({
      ok: true,
      registry,
      rows: rows ?? [],
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
