import type { SupabaseClient } from "@supabase/supabase-js";
import { NEMUMI_AUDIO_REGISTRY } from "@/lib/nemumi-audio-registry";

/**
 * nemumi_audio_tracks が空なら、コードの既定一覧を1回だけ投入する。
 * 以降はこのテーブルが素材マスタ（追加・編集・削除の対象）。
 */
export async function ensureDefaultNemumiTracksIfEmpty(
  supabase: SupabaseClient
): Promise<void> {
  const { count, error: countErr } = await supabase
    .from("nemumi_audio_tracks")
    .select("*", { count: "exact", head: true });

  if (countErr) {
    console.error("[nemumi-tracks-ensure] count", countErr);
    return;
  }
  if ((count ?? 0) > 0) return;

  const counts: Record<string, number> = { bgm: 0, se: 0, interactive: 0, extra: 0 };
  const now = new Date().toISOString();
  const rows = NEMUMI_AUDIO_REGISTRY.map((e) => {
    const n = counts[e.category] ?? 0;
    counts[e.category] = n + 1;
    return {
      track_id: e.trackId,
      category: e.category,
      label: e.label,
      sort_order: n,
      updated_at: now,
    };
  });

  const { error } = await supabase.from("nemumi_audio_tracks").upsert(rows, {
    onConflict: "track_id",
  });
  if (error) {
    console.error("[nemumi-tracks-ensure] upsert", error);
  }
}
