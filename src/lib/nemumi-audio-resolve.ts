import type { NemumiAudioRegistryEntry } from "./nemumi-audio-registry";
import { NEMUMI_AUDIO_REGISTRY } from "./nemumi-audio-registry";

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

type DbRow = {
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

/**
 * DB の行（track_id, public_url）とレジストリをマージしてクライアント向け JSON を生成する
 */
export function buildNemumiAudioPayload(rows: DbRow[] | null | undefined): NemumiAudioPublicPayload {
  const overrides = new Map<string, string | null | undefined>();
  for (const r of rows ?? []) {
    overrides.set(r.track_id, r.public_url);
  }

  const bgm: NemumiResolvedTrack[] = [];
  const se: NemumiResolvedTrack[] = [];
  const interactive: NemumiResolvedTrack[] = [];
  let hashiraDokei: string | null = null;

  for (const entry of NEMUMI_AUDIO_REGISTRY) {
    const path = pathForEntry(entry, overrides);
    if (entry.category === "extra") {
      if (entry.trackId === "hashira") hashiraDokei = path;
      continue;
    }
    const item: NemumiResolvedTrack = { id: entry.trackId, label: entry.label, path };
    if (entry.category === "bgm") bgm.push(item);
    else if (entry.category === "se") se.push(item);
    else if (entry.category === "interactive") interactive.push(item);
  }

  return { bgm, se, interactive, hashiraDokei };
}
