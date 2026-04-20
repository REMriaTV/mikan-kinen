/**
 * REM Chat（garage-v2）音楽演出用の既定パス。
 * 実ファイルは public/audio 以下に配置（未配置時は play が失敗するだけ）。
 */

export type RemGarageSeItem = { id: string; label: string; path: string };
export type RemGarageBgmItem = { id: string; label: string; path: string };

export const REM_GARAGE_CUE_PATHS = {
  /**
   * 専用の pre-broadcast.mp3 を `public/audio/opening/` に置けば差し替え可。
   * 未配置時は opening と同じファイルを参照（自動開局前BGMと手動が同じ音源になる）。
   */
  "pre-broadcast": "/audio/opening/opening.mp3",
  opening: "/audio/opening/opening.mp3",
  ending: "/audio/ending/ending.mp3",
} as const;

export type RemGarageCueId = keyof typeof REM_GARAGE_CUE_PATHS;

/**
 * ジングル（ワンショット）— public/audio/se/ に置いたファイル名と一致させる。
 * （未配置のボタンは追加しない。ファイルを増やしたらここに追記。）
 */
export const REM_GARAGE_SE_TRACKS: RemGarageSeItem[] = [
  { id: "rooster", label: "鶏", path: "/audio/se/rooster.mp3" },
];

/** BGM（ループ）— ファイルを置いたらここに追記 */
export const REM_GARAGE_BGM_TRACKS: RemGarageBgmItem[] = [
  { id: "ambient-01", label: "Ambient 01", path: "/audio/bgm/ambient-01.mp3" },
  { id: "ambient-02", label: "Ambient 02", path: "/audio/bgm/ambient-02.mp3" },
  { id: "earth-01", label: "Earth 01", path: "/audio/bgm/earth-01.mp3" },
  { id: "healing-01", label: "Healing 01", path: "/audio/bgm/healing-01.mp3" },
  { id: "healing-02", label: "Healing 02", path: "/audio/bgm/healing-02.mp3" },
  { id: "healing-03", label: "Healing 03", path: "/audio/bgm/healing-03.mp3" },
  {
    id: "music-yashyamaru-chonaikankyou",
    label: "夜叉丸 室内環境",
    path: "/audio/music/yashyamaru-chonaikankyou.mp3",
  },
  {
    id: "music-pinopi-aru-hi-ii-tenki",
    label: "ピノピ ある日いい天気",
    path: "/audio/music/pinopi-aru-hi-ii-tenki.mp3",
  },
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
  | { t: "cue"; id: RemGarageCueId }
  /** 開局前ループ・OP・ED のいずれかが鳴っていればすべて停止 */
  | { t: "cueStop" };
