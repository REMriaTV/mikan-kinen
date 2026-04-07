/** REM Chat / ねむみで共有する夢氏名（D.N.）候補 */

export const DREAM_NAME_CANDIDATES = [
  "夢の中の通りすがりA",
  "夢の中の通りすがりB",
  "あっちの世界の一般人",
  "寝ても覚めても寝不足",
  "マイケル小林",
  "モブボブ",
  "世界一のいびきかき",
  "空とぶ鼻水",
  "絶対に割れないシャボン玉",
  "惑星ジャグラー",
  "4,032,519,831代目",
  "初代",
  "次世代",
  "サンタを届けるトナカイ",
  "エリック・クラッカートン",
  "無限に食べ続けられる下敷き",
  "やみ夜のおなら",
  "鉄のまくら",
  "ピンク時々モスグリーンの空",
  "夢の番人の娘",
  "占い師の占い師",
  "電動ピース",
  "ブラインドに指を挟む少年",
  "駅長C",
  "長ズボンのじっじ",
  "夜行性太陽",
  "誰かの弟子",
] as const;

export function getRandomDreamName(): string {
  return DREAM_NAME_CANDIDATES[
    Math.floor(Math.random() * DREAM_NAME_CANDIDATES.length)
  ];
}

function randomSuffix(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`.slice(0, 12);
}

/** 無記名入室時: 候補から1つ選び、末尾に一意IDを付けて他ユーザーと名前・色が被らないようにする */
export function makeUniqueDreamName(): string {
  const base = getRandomDreamName();
  return `${base}·${randomSuffix()}`;
}

export function makeUniqueDreamNameFromBase(base: string): string {
  const trimmed = base.trim() || getRandomDreamName();
  return `${trimmed}·${randomSuffix()}`;
}

const NEMUMI_LAST_BASE_KEY = "nemumi_last_dn_base";

/** ねむみ: 直前に選んだベース名と被りにくくしつつ、Daily 用の一意 userName を返す */
export function pickNemumiDreamName(): string {
  let last = "";
  try {
    if (typeof window !== "undefined") {
      last = localStorage.getItem(NEMUMI_LAST_BASE_KEY) || "";
    }
  } catch {
    /* ignore */
  }
  const pool =
    last.length > 0
      ? DREAM_NAME_CANDIDATES.filter((c) => c !== last)
      : [...DREAM_NAME_CANDIDATES];
  const base =
    pool[Math.floor(Math.random() * pool.length)] ?? DREAM_NAME_CANDIDATES[0];
  try {
    if (typeof window !== "undefined" && base) {
      localStorage.setItem(NEMUMI_LAST_BASE_KEY, base);
    }
  } catch {
    /* ignore */
  }
  return makeUniqueDreamNameFromBase(base);
}

/** 内部ID（·サフィックス）は Daily / 色分け用に保持し、UI には出さない */
export function displayDreamName(full: string): string {
  if (!full || typeof full !== "string") return full;
  const hex10 = full.match(/^(.*)·[0-9a-f]{10}$/i);
  if (hex10?.[1]) return hex10[1];
  const alnum = full.match(/^(.*)·[a-z0-9]{10,12}$/i);
  if (alnum?.[1]) return alnum[1];
  return full;
}
