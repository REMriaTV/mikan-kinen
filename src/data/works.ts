export type WorkTier = "main" | "sub" | "odai";
export type WorkStatus = "継続" | "休止" | "保留" | "完成";
export type WorkFormat = "文章" | "マンガ" | "イラスト" | "ライフスタイル";
export type WorkScale = "長編" | "短編" | "SS" | "コンセプト" | "未定";
export type TimeSlot = "BOTTOM" | "DRIFT" | "REM" | "LUCID" | "TRANSIT";
export type LunarPhase = "HUI" | "XIAXIAN" | "WANG" | "SHANGXIAN" | "MEIYUE" | "SHUO";
export type HourSlot = 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33;

export interface Work {
  id: number;
  slug: string;
  title: string;
  tier: WorkTier;
  scale: WorkScale;
  format: WorkFormat;
  status: WorkStatus;
  debut: string;
  synopsis: string;
  peekNote: string;
  driveLink: string;
  meta: string[];
  timeSlot?: TimeSlot;
  lunarPhase?: LunarPhase;
  hourSlot?: HourSlot;
  broadcastImage?: string;
}

// 時間帯（縦軸）の定義
// 夜から朝への意識の旅を色で表現
export const timeSlotInfo: Record<TimeSlot, {
  name: string;
  time: string;
  frequency: string;
  color: string;
  description: string;
}> = {
  BOTTOM: {
    name: "BOTTOM",
    time: "22-25時",
    frequency: "δ 0.5-4Hz",
    color: "#0a0a1a", // 最も深いダークトーン。ほぼ黒に近い紺
    description: "底からはじまる。底だと思ったら、世界の入り口だった",
  },
  DRIFT: {
    name: "DRIFT",
    time: "25-27時",
    frequency: "θ 4-8Hz",
    color: "#1a1040", // 深い紫。夜空の底
    description: "さまよう。まどろみの中を漂流する",
  },
  REM: {
    name: "R.E.M",
    time: "27-30時",
    frequency: "α 8-13Hz",
    color: "#1e2060", // 神秘的な青紫。夢の中の鮮やかさ
    description: "Rapid Eye Movement。局名の由来そのもの。夢を見る時間。",
  },
  LUCID: {
    name: "LUCID",
    time: "30-32時",
    frequency: "β 13-30Hz",
    color: "#243442", // 雲海の上の朝。深いブルーグレー/スレートブルー。山並みと雲海の色
    description: "明晰夢。夢の中で「気づいている」状態",
  },
  TRANSIT: {
    name: "TRANSIT",
    time: "32-33時",
    frequency: "γ 30Hz〜",
    color: "#6b3060", // 朝焼けの空。鮮やかな紫〜ローズ〜マゼンタ。夜明けのエモい瞬間
    description: "「目覚め＝別の現実への乗り継ぎ地点」日常の繰り返しではない、全然違う次元の世界へ",
  },
};

// 月の相（横軸）の定義
export const lunarPhaseInfo: Record<LunarPhase, {
  name: string;
  pinyin: string;
  meaning: string;
}> = {
  HUI: {
    name: "晦",
    pinyin: "huì",
    meaning: "月の最終日。隠れる、暗い",
  },
  XIAXIAN: {
    name: "下弦",
    pinyin: "xià xián",
    meaning: "弦が緩む。降りていく",
  },
  WANG: {
    name: "望",
    pinyin: "wàng",
    meaning: "望む。満月を仰ぎ望む",
  },
  SHANGXIAN: {
    name: "上弦",
    pinyin: "shàng xián",
    meaning: "弦が張る。エネルギーが満ちる",
  },
  MEIYUE: {
    name: "眉月",
    pinyin: "méi yuè",
    meaning: "眉のような細い月。繊細",
  },
  SHUO: {
    name: "朔",
    pinyin: "shuò",
    meaning: "月の第一日。原点に戻る",
  },
};

// 1時間ごとの行定義（12行）
export const hourSlotInfo: Record<HourSlot, {
  hour: number;
  displayTime: string;
  realTime: string;
  timeSlot: TimeSlot;
}> = {
  22: { hour: 22, displayTime: "22時", realTime: "22:00", timeSlot: "BOTTOM" },
  23: { hour: 23, displayTime: "23時", realTime: "23:00", timeSlot: "BOTTOM" },
  24: { hour: 24, displayTime: "24時", realTime: "0:00", timeSlot: "BOTTOM" },
  25: { hour: 25, displayTime: "25時", realTime: "1:00", timeSlot: "DRIFT" },
  26: { hour: 26, displayTime: "26時", realTime: "2:00", timeSlot: "DRIFT" },
  27: { hour: 27, displayTime: "27時", realTime: "3:00", timeSlot: "REM" },
  28: { hour: 28, displayTime: "28時", realTime: "4:00", timeSlot: "REM" },
  29: { hour: 29, displayTime: "29時", realTime: "5:00", timeSlot: "REM" },
  30: { hour: 30, displayTime: "30時", realTime: "6:00", timeSlot: "LUCID" },
  31: { hour: 31, displayTime: "31時", realTime: "7:00", timeSlot: "LUCID" },
  32: { hour: 32, displayTime: "32時", realTime: "8:00", timeSlot: "TRANSIT" },
  33: { hour: 33, displayTime: "33時", realTime: "9:00", timeSlot: "TRANSIT" },
};

// 時間帯ごとの行数（rowspan用）
export const timeSlotRowCount: Record<TimeSlot, number> = {
  BOTTOM: 3,  // 22-24時
  DRIFT: 2,   // 25-26時
  REM: 3,     // 27-29時
  LUCID: 2,   // 30-31時
  TRANSIT: 2, // 32-33時
};

// 時間帯の最初の行（rowspan開始判定用）
export const timeSlotFirstHour: Record<TimeSlot, HourSlot> = {
  BOTTOM: 22,
  DRIFT: 25,
  REM: 27,
  LUCID: 30,
  TRANSIT: 32,
};

// 軸の順序
export const hourSlotOrder: HourSlot[] = [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33];
export const timeSlotOrder: TimeSlot[] = ["BOTTOM", "DRIFT", "REM", "LUCID", "TRANSIT"];
export const lunarPhaseOrder: LunarPhase[] = ["SHUO", "MEIYUE", "SHANGXIAN", "WANG", "XIAXIAN", "HUI"];

export const mainWorks: Work[] = [
  // 22時 × HUI
  {
    id: 10,
    slug: "iki-high",
    title: "息をはいて、吸ってください（IKI-HIGH）",
    tier: "main",
    scale: "コンセプト",
    format: "ライフスタイル",
    status: "継続",
    debut: "2023/04",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: ["エアタバコ制作"],
    timeSlot: "BOTTOM",
    lunarPhase: "HUI",
    hourSlot: 22,
    broadcastImage: "教育テレビ",
  },
  // 23時 × SHUO
  {
    id: 26,
    slug: "door",
    title: "ドア、閉まってもいいですか？",
    tier: "main",
    scale: "短編",
    format: "マンガ",
    status: "継続",
    debut: "2023/12",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: ["完結させたい"],
    timeSlot: "BOTTOM",
    lunarPhase: "SHUO",
    hourSlot: 23,
    broadcastImage: "アニメ",
  },

  // 26時 × WANG
  {
    id: 18,
    slug: "paradise-semi",
    title: "パラダイス蝉",
    tier: "main",
    scale: "短編",
    format: "文章",
    status: "継続",
    debut: "2023/07",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
    timeSlot: "DRIFT",
    lunarPhase: "WANG",
    hourSlot: 26,
    broadcastImage: "土曜ドラマ",
  },
  // 25時 × SHUO
  {
    id: 20,
    slug: "ezo-maru",
    title: "忍者エゾ丸",
    tier: "main",
    scale: "長編",
    format: "文章",
    status: "保留",
    debut: "2023/07",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
    timeSlot: "DRIFT",
    lunarPhase: "SHUO",
    hourSlot: 25,
    broadcastImage: "土曜ドラマ",
  },

  // 28時 × HUI
  {
    id: 7,
    slug: "genyon",
    title: "ゲニョンの襲来!!",
    tier: "main",
    scale: "長編",
    format: "文章",
    status: "継続",
    debut: "2023/04",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: ["島根で着想"],
    timeSlot: "REM",
    lunarPhase: "HUI",
    hourSlot: 28,
    broadcastImage: "金曜ドラマ",
  },
  // 27時 × MEIYUE
  {
    id: 3,
    slug: "twin-peach",
    title: "ツインピーチ",
    tier: "main",
    scale: "長編",
    format: "文章",
    status: "継続",
    debut: "2022/11",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: ["島根で着想"],
    timeSlot: "REM",
    lunarPhase: "MEIYUE",
    hourSlot: 27,
    broadcastImage: "日9",
  },

  // 31時 × WANG
  {
    id: 100,
    slug: "banshu-survive",
    title: "播州サバイブ",
    tier: "main",
    scale: "長編",
    format: "文章",
    status: "継続",
    debut: "2025",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: ["姫路フィールドリサーチ"],
    timeSlot: "LUCID",
    lunarPhase: "WANG",
    hourSlot: 31,
    broadcastImage: "ニュース、バラエティ",
  },
  // 30時 × SHANGXIAN
  {
    id: 4,
    slug: "kawai-monjiro",
    title: "国家転覆人 河合紋次郎",
    tier: "main",
    scale: "長編",
    format: "文章",
    status: "継続",
    debut: "2022/12",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
    timeSlot: "LUCID",
    lunarPhase: "SHANGXIAN",
    hourSlot: 30,
    broadcastImage: "金10",
  },

  // 32時 × XIAXIAN
  {
    id: 16,
    slug: "yusurika",
    title: "ユスリカの仲人",
    tier: "main",
    scale: "長編",
    format: "文章",
    status: "継続",
    debut: "2023/06",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: ["前日譚・治打撲一方編"],
    timeSlot: "TRANSIT",
    lunarPhase: "XIAXIAN",
    hourSlot: 32,
    broadcastImage: "深夜放送、実験枠",
  },
  // 33時 × XIAXIAN
  {
    id: 29,
    slug: "sota-kun",
    title: "さくら組のソータくん",
    tier: "main",
    scale: "短編",
    format: "マンガ",
    status: "継続",
    debut: "2023/12",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: ["完結させたい"],
    timeSlot: "TRANSIT",
    lunarPhase: "XIAXIAN",
    hourSlot: 33,
    broadcastImage: "深夜放送、実験枠",
  },
  // 32時 × SHANGXIAN
  {
    id: 101,
    slug: "hand-to-hand",
    title: "HAND to HAND ～ 道程 ～",
    tier: "main",
    scale: "短編",
    format: "文章",
    status: "継続",
    debut: "2025",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
    timeSlot: "TRANSIT",
    lunarPhase: "SHANGXIAN",
    hourSlot: 32,
    broadcastImage: "深夜放送、実験枠",
  },
  // 32時 × MEIYUE
  {
    id: 102,
    slug: "kibokujin",
    title: "木人",
    tier: "main",
    scale: "短編",
    format: "文章",
    status: "継続",
    debut: "2025",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
    timeSlot: "TRANSIT",
    lunarPhase: "MEIYUE",
    hourSlot: 32,
    broadcastImage: "深夜放送、実験枠",
  },
];

export const subWorks: Work[] = [
  {
    id: 25,
    slug: "occult",
    title: "OCCULT",
    tier: "sub",
    scale: "短編",
    format: "文章",
    status: "継続",
    debut: "2023/12",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 31,
    slug: "genyon-world",
    title: "GENYON THE WORLD",
    tier: "sub",
    scale: "長編",
    format: "文章",
    status: "継続",
    debut: "2024/07",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 1,
    slug: "akasatana",
    title: "アカサタナ兄弟",
    tier: "sub",
    scale: "短編",
    format: "文章",
    status: "休止",
    debut: "2019/12",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 2,
    slug: "poached-egg",
    title: "ポーチドエッグ",
    tier: "sub",
    scale: "短編",
    format: "文章",
    status: "休止",
    debut: "2019/12",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 5,
    slug: "kokera",
    title: "こけら落ちた",
    tier: "sub",
    scale: "SS",
    format: "イラスト",
    status: "休止",
    debut: "2022/12",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 6,
    slug: "ie-karitemaasu",
    title: "家、借りてまーす",
    tier: "sub",
    scale: "短編",
    format: "文章",
    status: "休止",
    debut: "2023/03",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 8,
    slug: "tennyo",
    title: "天女シスターズ",
    tier: "sub",
    scale: "未定",
    format: "文章",
    status: "休止",
    debut: "2023/04",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 9,
    slug: "orihime",
    title: "織姫豪快伝説",
    tier: "sub",
    scale: "SS",
    format: "文章",
    status: "休止",
    debut: "2023/04",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: ["完成"],
  },
  {
    id: 11,
    slug: "merikuri",
    title: "3兆年後のメリクリ",
    tier: "sub",
    scale: "SS",
    format: "文章",
    status: "休止",
    debut: "2023/04",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 12,
    slug: "kinder",
    title: "キンダーランド（仮）",
    tier: "sub",
    scale: "短編",
    format: "文章",
    status: "保留",
    debut: "2023/04",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 13,
    slug: "kanae",
    title: "願わば、カナエちゃん",
    tier: "sub",
    scale: "未定",
    format: "文章",
    status: "休止",
    debut: "2023/05",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 14,
    slug: "yuurei",
    title: "幽霊のケンカ",
    tier: "sub",
    scale: "SS",
    format: "文章",
    status: "休止",
    debut: "2023/05",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 15,
    slug: "yakyuu",
    title: "野球を知っているか",
    tier: "sub",
    scale: "短編",
    format: "イラスト",
    status: "休止",
    debut: "2023/05",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 17,
    slug: "picasso",
    title: "ピカソ、賞をとる",
    tier: "sub",
    scale: "短編",
    format: "文章",
    status: "休止",
    debut: "2023/07",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 21,
    slug: "good-meaning",
    title: "グッドミーニング",
    tier: "sub",
    scale: "短編",
    format: "文章",
    status: "保留",
    debut: "2023/07",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 22,
    slug: "unmei",
    title: "運命の人",
    tier: "sub",
    scale: "短編",
    format: "文章",
    status: "保留",
    debut: "2023/07",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 23,
    slug: "torishirabe",
    title: "ひと夏の取り調べ",
    tier: "sub",
    scale: "SS",
    format: "文章",
    status: "保留",
    debut: "2023/08",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 24,
    slug: "nemuttara",
    title: "眠ったら教えてください",
    tier: "sub",
    scale: "SS",
    format: "マンガ",
    status: "休止",
    debut: "2023/09",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: ["完成"],
  },
  {
    id: 27,
    slug: "shide",
    title: "紙垂ふり少女",
    tier: "sub",
    scale: "短編",
    format: "文章",
    status: "保留",
    debut: "2023/12",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 30,
    slug: "shujin",
    title: "主人の思い出",
    tier: "sub",
    scale: "SS",
    format: "文章",
    status: "休止",
    debut: "2023/12",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: ["完成"],
  },
  {
    id: 32,
    slug: "kimutaku",
    title: "ただのキムタク",
    tier: "sub",
    scale: "SS",
    format: "文章",
    status: "保留",
    debut: "2024/07",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 33,
    slug: "laundry",
    title: "ランドリーウォーズ",
    tier: "sub",
    scale: "SS",
    format: "文章",
    status: "保留",
    debut: "2024/07",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 34,
    slug: "nemurenu",
    title: "眠れぬ夜に",
    tier: "sub",
    scale: "SS",
    format: "文章",
    status: "保留",
    debut: "2024/07",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 35,
    slug: "ame",
    title: "雨",
    tier: "sub",
    scale: "短編",
    format: "文章",
    status: "保留",
    debut: "2024/08",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 36,
    slug: "chatter",
    title: "チャッター",
    tier: "sub",
    scale: "短編",
    format: "文章",
    status: "保留",
    debut: "2024/08",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 37,
    slug: "logical",
    title: "ロジカルミーツガール",
    tier: "sub",
    scale: "短編",
    format: "文章",
    status: "保留",
    debut: "2024/08",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 39,
    slug: "otoko",
    title: "男といえば",
    tier: "sub",
    scale: "短編",
    format: "文章",
    status: "保留",
    debut: "2024/08",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 40,
    slug: "mochibe",
    title: "モチベの総量",
    tier: "sub",
    scale: "短編",
    format: "文章",
    status: "保留",
    debut: "2024/08",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 44,
    slug: "junbi",
    title: "準備が９割",
    tier: "sub",
    scale: "短編",
    format: "文章",
    status: "保留",
    debut: "2024/08",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 45,
    slug: "cup",
    title: "汚れたカップ",
    tier: "sub",
    scale: "短編",
    format: "文章",
    status: "保留",
    debut: "2024/08",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 46,
    slug: "safari",
    title: "海のサファリーン",
    tier: "sub",
    scale: "短編",
    format: "文章",
    status: "保留",
    debut: "2024/08",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 47,
    slug: "ghost",
    title: "ゴースト",
    tier: "odai",
    scale: "短編",
    format: "文章",
    status: "保留",
    debut: "2024/10",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 48,
    slug: "white-burger",
    title: "ホワイトバーガー",
    tier: "odai",
    scale: "短編",
    format: "文章",
    status: "保留",
    debut: "2024/10",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 49,
    slug: "wakaki",
    title: "若き血",
    tier: "odai",
    scale: "短編",
    format: "文章",
    status: "保留",
    debut: "2024/10",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 50,
    slug: "haru-arashi",
    title: "春の嵐",
    tier: "odai",
    scale: "短編",
    format: "文章",
    status: "保留",
    debut: "2024/10",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
  {
    id: 51,
    slug: "shiroi-akuma",
    title: "白い悪魔",
    tier: "odai",
    scale: "短編",
    format: "文章",
    status: "保留",
    debut: "2024/10",
    synopsis: "",
    peekNote: "",
    driveLink: "",
    meta: [],
  },
];

export const allWorks = [...mainWorks, ...subWorks];

export function getWorkBySlug(slug: string): Work | undefined {
  return allWorks.find((work) => work.slug === slug);
}

export function getWorksByFormat(format: WorkFormat): Work[] {
  return allWorks.filter((work) => work.format === format);
}

export function getWorksByTimeSlot(timeSlot: TimeSlot): Work[] {
  return mainWorks.filter((work) => work.timeSlot === timeSlot);
}

export function getWorksByCell(timeSlot: TimeSlot, lunarPhase: LunarPhase): Work[] {
  return mainWorks.filter(
    (work) => work.timeSlot === timeSlot && work.lunarPhase === lunarPhase
  );
}

export function getWorksByHourCell(hourSlot: HourSlot, lunarPhase: LunarPhase): Work[] {
  return mainWorks.filter(
    (work) => work.hourSlot === hourSlot && work.lunarPhase === lunarPhase
  );
}
