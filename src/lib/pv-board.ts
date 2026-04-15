/** 播州サバイブ「町内環境PV」制作デスク用のデータ形（Supabase JSON と同期） */

export const PV_BOARD_DEFAULT_SLUG = "chonaikankyo-pv";

export type PvTimeOfDay = "day" | "night" | "evening" | "flex";

export type PvBoardCut = {
  id: string;
  sortOrder: number;
  section?: string;
  sceneTitle: string;
  timecodeStart?: string;
  timecodeEnd?: string;
  lyricsPart?: string;
  direction?: string;
  visual?: string;
  camera?: string;
  timeOfDay?: PvTimeOfDay;
  shootDone?: boolean;
  cutName?: string;
  contentAction?: string;
  method?: string;
  shootDate?: string;
  notes?: string;
  /** Supabase Storage（pv-storyboard）の公開 URL */
  thumbnailUrl?: string;
};

export type PvProcessLogEntry = {
  at: string;
  message: string;
};

export type PvBoardData = {
  title: string;
  /** 参照用 YouTube 動画 ID（例: SmeUJFhZD0I） */
  youtubeVideoId?: string;
  cuts: PvBoardCut[];
  processLog: PvProcessLogEntry[];
};

export function emptyPvBoardData(): PvBoardData {
  return {
    title: "町内環境 PV 制作進行",
    youtubeVideoId: "SmeUJFhZD0I",
    cuts: [],
    processLog: [],
  };
}

export function defaultPvBoardData(): PvBoardData {
  const now = new Date().toISOString();
  return {
    title: "町内環境 PV 制作進行",
    youtubeVideoId: "SmeUJFhZD0I",
    cuts: [
      {
        id: "seed-1",
        sortOrder: 0,
        section: "プロローグ",
        sceneTitle: "仏壇の前の子ども",
        timecodeStart: "00:00:00",
        timecodeEnd: "00:00:15",
        lyricsPart: "音楽なし／ドラマパート",
        direction: "5歳児が仏壇の前で遊び、古い記憶にアクセスする",
        visual: "仏壇の灯り、畳、子どもの手元",
        camera: "固定／正面",
        timeOfDay: "day",
        shootDone: false,
        notes: "修正候補: 開始時間の調整、フェードイン効果の追加",
      },
      {
        id: "seed-2",
        sortOrder: 1,
        section: "ヴァース",
        sceneTitle: "用水路で黄昏",
        lyricsPart: "子午線またいで緑のコード",
        direction: "用水路の縁に座り、夕日を背に",
        visual: "正面から回り込んでアップへ",
        camera: "手持ち回り込み",
        timeOfDay: "evening",
        shootDone: false,
      },
    ],
    processLog: [
      {
        at: now,
        message: "制作デスクを初期化しました（サンプル2カット入り）。不要なら削除して保存してください。",
      },
    ],
  };
}

export function normalizePvBoardData(raw: unknown): PvBoardData {
  const base = emptyPvBoardData();
  if (!raw || typeof raw !== "object") return defaultPvBoardData();

  const o = raw as Record<string, unknown>;
  if (!Array.isArray(o.cuts)) return defaultPvBoardData();

  if (typeof o.title === "string" && o.title.trim()) base.title = o.title.trim();
  if (typeof o.youtubeVideoId === "string" && o.youtubeVideoId.trim()) {
    base.youtubeVideoId = o.youtubeVideoId.trim();
  }

  base.cuts = o.cuts
    .map((c, i) => normalizeCut(c, i))
    .filter((c): c is PvBoardCut => c !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (Array.isArray(o.processLog)) {
    base.processLog = o.processLog
      .map((p) => {
        if (!p || typeof p !== "object") return null;
        const e = p as Record<string, unknown>;
        if (typeof e.at !== "string" || typeof e.message !== "string") return null;
        return { at: e.at, message: e.message };
      })
      .filter((p): p is PvProcessLogEntry => p !== null);
  }

  return base;
}

function normalizeCut(raw: unknown, fallbackIndex: number): PvBoardCut | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;
  const id = typeof c.id === "string" && c.id ? c.id : `cut-${fallbackIndex}`;
  const sceneTitle =
    typeof c.sceneTitle === "string" && c.sceneTitle.trim()
      ? c.sceneTitle.trim()
      : `シーン ${fallbackIndex + 1}`;
  const sortOrder = typeof c.sortOrder === "number" && Number.isFinite(c.sortOrder) ? c.sortOrder : fallbackIndex;

  const timeOfDayRaw = c.timeOfDay;
  let timeOfDay: PvTimeOfDay | undefined;
  if (timeOfDayRaw === "day" || timeOfDayRaw === "night" || timeOfDayRaw === "evening" || timeOfDayRaw === "flex") {
    timeOfDay = timeOfDayRaw;
  }

  return {
    id,
    sortOrder,
    section: typeof c.section === "string" ? c.section : undefined,
    sceneTitle,
    timecodeStart: typeof c.timecodeStart === "string" ? c.timecodeStart : undefined,
    timecodeEnd: typeof c.timecodeEnd === "string" ? c.timecodeEnd : undefined,
    lyricsPart: typeof c.lyricsPart === "string" ? c.lyricsPart : undefined,
    direction: typeof c.direction === "string" ? c.direction : undefined,
    visual: typeof c.visual === "string" ? c.visual : undefined,
    camera: typeof c.camera === "string" ? c.camera : undefined,
    timeOfDay,
    shootDone: typeof c.shootDone === "boolean" ? c.shootDone : undefined,
    cutName: typeof c.cutName === "string" ? c.cutName : undefined,
    contentAction: typeof c.contentAction === "string" ? c.contentAction : undefined,
    method: typeof c.method === "string" ? c.method : undefined,
    shootDate: typeof c.shootDate === "string" ? c.shootDate : undefined,
    notes: typeof c.notes === "string" ? c.notes : undefined,
    thumbnailUrl: typeof c.thumbnailUrl === "string" ? c.thumbnailUrl : undefined,
  };
}
