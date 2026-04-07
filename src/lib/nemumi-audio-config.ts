/** ねむみ BGM / SE のデフォルトパス（Supabase 未設定時のフォールバック） */
import { NEMUMI_AUDIO_REGISTRY } from "./nemumi-audio-registry";

export const NEMUMI_BGM_TRACKS = NEMUMI_AUDIO_REGISTRY.filter((e) => e.category === "bgm").map(
  (e) => ({ id: e.trackId, label: e.label, path: e.defaultPath })
);

export const NEMUMI_SE_TRACKS = [
  ...NEMUMI_AUDIO_REGISTRY.filter((e) => e.category === "se"),
  ...NEMUMI_AUDIO_REGISTRY.filter((e) => e.category === "interactive"),
].map((e) => ({ id: e.trackId, label: e.label, path: e.defaultPath }));

export const NEMUMI_SE_COOLDOWN_MS = 45_000;

const hashira = NEMUMI_AUDIO_REGISTRY.find((e) => e.trackId === "hashira");
export const NEMUMI_HASHIRA_DOKEI = hashira?.defaultPath ?? "/audio/se/hashira-dokei.mp3";
