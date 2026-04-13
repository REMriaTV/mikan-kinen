/**
 * REM Chat（garage-v2）音楽演出用の既定パス。
 * 実ファイルは public/audio 以下に配置（未配置時は play が失敗するだけ）。
 */

export type RemGarageSeItem = { id: string; label: string; path: string };
export type RemGarageBgmItem = { id: string; label: string; path: string };

export const REM_GARAGE_CUE_PATHS = {
  "pre-broadcast": "/audio/opening/pre-broadcast.mp3",
  opening: "/audio/opening/opening.mp3",
  ending: "/audio/ending/ending.mp3",
} as const;

export type RemGarageCueId = keyof typeof REM_GARAGE_CUE_PATHS;

/** ジングル（ワンショット）— 指示書 A-3 に準拠 */
export const REM_GARAGE_SE_TRACKS: RemGarageSeItem[] = [
  { id: "rooster", label: "鶏", path: "/audio/se/rooster.mp3" },
  { id: "charumera", label: "チャルメラ", path: "/audio/se/charumera.mp3" },
  { id: "joya-no-kane", label: "除夜の鐘", path: "/audio/se/joya-no-kane.mp3" },
  { id: "yoru-karasu", label: "夜カラス", path: "/audio/se/yoru-karasu.mp3" },
  { id: "yopparai", label: "足音", path: "/audio/se/yopparai.mp3" },
  { id: "jitensha", label: "自転車", path: "/audio/se/jitensha.mp3" },
  { id: "truck", label: "トラック", path: "/audio/se/truck.mp3" },
  { id: "niwatori-yonaki", label: "鶏夜鳴き", path: "/audio/se/niwatori-yonaki.mp3" },
];

/** BGM（ループ）— ファイルを置いたらここに追記 */
export const REM_GARAGE_BGM_TRACKS: RemGarageBgmItem[] = [
  { id: "ambient-01", label: "Ambient 01", path: "/audio/bgm/ambient-01.mp3" },
  { id: "ambient-02", label: "Ambient 02", path: "/audio/bgm/ambient-02.mp3" },
];

export type RemGarageAudioPayload =
  | { t: "se"; id: string }
  | {
      t: "bgm";
      trackId: string;
      action: "start" | "stop" | "volume";
      volume?: number;
    }
  | { t: "bgm"; action: "stopAll" }
  | { t: "cue"; id: RemGarageCueId };
