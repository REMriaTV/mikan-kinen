import type { NemumiAudioRegistryEntry, NemumiRegistryCategory } from "./nemumi-audio-registry";
import { NEMUMI_AUDIO_REGISTRY, getRegistryEntry } from "./nemumi-audio-registry";

export type NemumiResolvedTrack = {
  id: string;
  label: string;
  path: string;
};

export type NemumiAudioPublicPayload = {
  bgm: NemumiResolvedTrack[];
  se: NemumiResolvedTrack[];
  interactive: NemumiResolvedTrack[];
  /** 柱時計（任意） */
  hashiraDokei: string | null;
};

export type NemumiTrackRow = {
  track_id: string;
  category: string;
  label: string;
  sort_order: number;
};

type AssetRow = {
  track_id: string;
  public_url: string | null;
};

function pathForEntry(
  entry: NemumiAudioRegistryEntry,
  overrides: Map<string, string | null | undefined>
): string {
  const u = overrides.get(entry.trackId);
  if (u && u.trim().length > 0) return u.trim();
  return entry.defaultPath;
}

/** DB の行をレジストリ形式に変換（既定パスはコード側のフォールバック） */
export function dbTrackRowsToEntries(rows: NemumiTrackRow[]): NemumiAudioRegistryEntry[] {
  return [...rows]
    .sort((a, b) => {
      const c = a.category.localeCompare(b.category);
      if (c !== 0) return c;
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return a.track_id.localeCompare(b.track_id);
    })
    .map((row) => {
      const reg = getRegistryEntry(row.track_id);
      return {
        trackId: row.track_id,
        category: row.category as NemumiRegistryCategory,
        label: row.label,
        defaultPath: reg?.defaultPath ?? "",
      };
    });
}

/**
 * DB の素材一覧 + アセット URL からクライアント向け JSON を生成する。
 * trackRows が空のときのみコード既定にフォールバック（テーブル未作成時など）。
 */
export function buildNemumiAudioPayload(
  assetRows: AssetRow[] | null | undefined,
  trackRows: NemumiTrackRow[] | null | undefined
): NemumiAudioPublicPayload {
  const overrides = new Map<string, string | null | undefined>();
  for (const r of assetRows ?? []) {
    overrides.set(r.track_id, r.public_url);
  }

  const entries: NemumiAudioRegistryEntry[] =
    trackRows && trackRows.length > 0
      ? dbTrackRowsToEntries(trackRows)
      : [...NEMUMI_AUDIO_REGISTRY];

  const bgm: NemumiResolvedTrack[] = [];
  const se: NemumiResolvedTrack[] = [];
  const interactive: NemumiResolvedTrack[] = [];
  let hashiraDokei: string | null = null;

  for (const entry of entries) {
    const path = pathForEntry(entry, overrides);
    if (entry.category === "extra") {
      if (entry.trackId === "hashira") hashiraDokei = path || null;
      continue;
    }
    const item: NemumiResolvedTrack = { id: entry.trackId, label: entry.label, path };
    if (entry.category === "bgm") bgm.push(item);
    else if (entry.category === "se") se.push(item);
    else if (entry.category === "interactive") interactive.push(item);
  }

  return { bgm, se, interactive, hashiraDokei };
}
