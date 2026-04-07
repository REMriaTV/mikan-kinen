import { NextResponse } from "next/server";
import type { NemumiTrackRow } from "@/lib/nemumi-audio-resolve";
import { getRegistryEntry, type NemumiRegistryCategory } from "@/lib/nemumi-audio-registry";
import { ensureDefaultNemumiTracksIfEmpty } from "@/lib/nemumi-tracks-ensure";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

export type AdminRegistryRow = {
  trackId: string;
  category: NemumiRegistryCategory;
  label: string;
  /** コードにフォールバック用パスがある場合（カスタム枠は空） */
  defaultPath: string;
  sortOrder: number;
  storagePath: string | null;
  publicUrl: string | null;
  updatedAt: string | null;
};

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
    await ensureDefaultNemumiTracksIfEmpty(supabase);

    const [assetsRes, tracksRes] = await Promise.all([
      supabase.from("nemumi_audio_assets").select("track_id, storage_path, public_url, updated_at"),
      supabase.from("nemumi_audio_tracks").select("track_id, category, label, sort_order, updated_at"),
    ]);

    if (assetsRes.error) {
      return NextResponse.json({ ok: false, error: assetsRes.error.message }, { status: 500 });
    }
    if (tracksRes.error) {
      return NextResponse.json({ ok: false, error: tracksRes.error.message }, { status: 500 });
    }

    const assetRows = assetsRes.data ?? [];
    const dbTrackRows = (tracksRes.data ?? []) as Array<
      NemumiTrackRow & { updated_at?: string }
    >;

    const sorted = [...dbTrackRows].sort((a, b) => {
      const c = a.category.localeCompare(b.category);
      if (c !== 0) return c;
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return a.track_id.localeCompare(b.track_id);
    });

    const registry: AdminRegistryRow[] = sorted.map((tr) => {
      const reg = getRegistryEntry(tr.track_id);
      const row = assetRows.find((x) => x.track_id === tr.track_id);
      return {
        trackId: tr.track_id,
        category: tr.category as NemumiRegistryCategory,
        label: tr.label,
        defaultPath: reg?.defaultPath ?? "",
        sortOrder: tr.sort_order,
        storagePath: row?.storage_path ?? null,
        publicUrl: row?.public_url ?? null,
        updatedAt: row?.updated_at ?? tr.updated_at ?? null,
      };
    });

    return NextResponse.json({
      ok: true,
      registry,
      assetRows,
      trackRows: dbTrackRows,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
