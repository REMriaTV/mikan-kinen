/**
 * ねむみ音素材の固定レジストリ（trackId はコード・DB・Storage で共通キー）
 */

export type NemumiRegistryCategory = "bgm" | "se" | "interactive" | "extra";

export type NemumiAudioRegistryEntry = {
  trackId: string;
  category: NemumiRegistryCategory;
  label: string;
  /** ローカル public または相対パス（Supabase 未設定時のフォールバック） */
  defaultPath: string;
};

export const NEMUMI_AUDIO_REGISTRY: NemumiAudioRegistryEntry[] = [
  { trackId: "clock", category: "bgm", label: "時計のチクタク", defaultPath: "/audio/bgm/clock.mp3" },
  { trackId: "water", category: "bgm", label: "水道のピチョン", defaultPath: "/audio/bgm/water.mp3" },
  { trackId: "mushi", category: "bgm", label: "虫の声", defaultPath: "/audio/bgm/mushi.mp3" },
  { trackId: "train", category: "bgm", label: "遠くの電車", defaultPath: "/audio/bgm/train.mp3" },
  { trackId: "joya", category: "se", label: "除夜の鐘", defaultPath: "/audio/se/joya-no-kane.mp3" },
  { trackId: "charu", category: "se", label: "チャルメラ", defaultPath: "/audio/se/charumera.mp3" },
  { trackId: "karasu", category: "se", label: "夜カラス", defaultPath: "/audio/se/yoru-karasu.mp3" },
  { trackId: "yopparai", category: "se", label: "酔っ払いの足音", defaultPath: "/audio/se/yopparai.mp3" },
  { trackId: "jitensha", category: "se", label: "近所の自転車", defaultPath: "/audio/se/jitensha.mp3" },
  { trackId: "truck", category: "se", label: "深夜トラック", defaultPath: "/audio/se/truck.mp3" },
  { trackId: "niwatori", category: "se", label: "鶏", defaultPath: "/audio/se/niwatori.mp3" },
  { trackId: "neiki", category: "interactive", label: "寝息（zzZ連動）", defaultPath: "/audio/se/neiki.mp3" },
  { trackId: "hashira", category: "extra", label: "柱時計", defaultPath: "/audio/se/hashira-dokei.mp3" },
];

const REGISTRY_IDS = new Set(NEMUMI_AUDIO_REGISTRY.map((e) => e.trackId));

export function isKnownNemumiTrackId(id: string): boolean {
  return REGISTRY_IDS.has(id);
}

export function getRegistryEntry(trackId: string): NemumiAudioRegistryEntry | undefined {
  return NEMUMI_AUDIO_REGISTRY.find((e) => e.trackId === trackId);
}
