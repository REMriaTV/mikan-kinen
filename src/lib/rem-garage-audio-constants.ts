/** Daily.co startCustomTrack / participant.tracks のキー（50文字以内・予約語以外） */
export const REM_GARAGE_CUSTOM_TRACK_NAME = "remMusic";

export const GARAGE_SYNC_MODE_KEY = "garage-rem-sync-mode-v1";

export type GarageSyncMode = "customTrack" | "htmlAudio";

export function readGarageSyncMode(): GarageSyncMode {
  if (typeof window === "undefined") return "customTrack";
  return sessionStorage.getItem(GARAGE_SYNC_MODE_KEY) === "htmlAudio" ? "htmlAudio" : "customTrack";
}
