export type ProgramItem = {
  title: string;
  desc: string;
};

export type BroadcastConfig = {
  version: number;
  countdown: {
    broadcastLabel: string;
    countdownPrefix: string;
    countdownSuffix: string;
    nowChanneling: string;
    remChatLabelBefore: string;
    remChatLabelAfter: string;
    remChatNoteBefore: string;
    remChatNoteAfter: string;
    targetEpochMs: number;
    eventDate: string;
    eventTagline: string;
  };
  colorBar: {
    networkTitle: string;
    sleepingText: string;
    nextText: string;
    wakeText: string;
  };
  garageV2: {
    unlockEpochMs: number;
    closeEpochMs: number;
  };
  topPage: {
    heroDateBadge: string;
    heroDateLine: string;
    joinDateLine: string;
  };
  programItems: ProgramItem[];
};

export const defaultBroadcastConfig: BroadcastConfig = {
  version: 1,
  countdown: {
    broadcastLabel: "2026.3.30 BROADCAST",
    countdownPrefix: "あと",
    countdownSuffix: "",
    nowChanneling: "Now Channeling...",
    remChatLabelBefore: "REM Chat（3/30 22:00 に開局）",
    remChatLabelAfter: "REM Chat に入る",
    remChatNoteBefore: "開始5分前になると、夢の世界がひらきます。",
    remChatNoteAfter: "交信を開始できます。",
    targetEpochMs: Date.parse("2026-03-30T13:00:00Z"),
    eventDate: "2026年3月30日（月）22:00〜",
    eventTagline: "月曜の夜は夢テレ。",
  },
  colorBar: {
    networkTitle: "REMREAL TELEPATHIC NETWORK",
    sleepingText: "只今放送休眠中",
    nextText: "次回の夢でお会いしましょう",
    wakeText: "おきる",
  },
  garageV2: {
    unlockEpochMs: Date.parse("2026-03-30T12:55:00Z"),
    closeEpochMs: Date.parse("2026-03-30T14:30:00Z"),
  },
  topPage: {
    heroDateBadge: "2026.3.30 MON",
    heroDateLine: "2026年 3月30日（月）22:00〜",
    joinDateLine: "2026年3月30日（月）22:00〜 / オンライン / 無料",
  },
  programItems: [
    {
      title: "百面惣と未完の世界",
      desc: "44作品の全体像を紹介。なぜこんなに作り続けているのか。",
    },
    {
      title: "プロット＆原稿 大公開",
      desc: "実際の制作ノート、ストーリーボード、途中原稿をスクリーンに映しながら語る。",
    },
    {
      title: "Q&A ─ 聞きたいこと、なんでも",
      desc: "Zoomのチャット・挙手機能を使って、自由に質問。",
    },
    {
      title: "打ち上げ ─ 酒でも飲みながら",
      desc: "作品の話、創作の話、なんでもありのフリートーク。",
    },
  ],
};

export function epochMsToJstDateTimeLocal(epochMs: number): string {
  const d = new Date(epochMs + 9 * 60 * 60 * 1000);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export function jstDateTimeLocalToEpochMs(value: string): number {
  // value: "YYYY-MM-DDTHH:mm"
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/
  );
  if (!match) return defaultBroadcastConfig.countdown.targetEpochMs;

  const [, ys, ms, ds, hs, mins] = match;
  const y = Number(ys);
  const m = Number(ms);
  const d = Number(ds);
  const hh = Number(hs);
  const minute = Number(mins);

  const utcMs = Date.UTC(y, m - 1, d, hh, minute, 0);
  // JST is UTC+9
  return utcMs - 9 * 60 * 60 * 1000;
}

export function normalizeBroadcastConfig(
  raw: unknown
): BroadcastConfig {
  const fallback = defaultBroadcastConfig;
  if (!raw || typeof raw !== "object") return fallback;
  const r = raw as Partial<BroadcastConfig>;

  return {
    version:
      typeof r.version === "number" ? r.version : fallback.version,
    countdown: {
      broadcastLabel:
        typeof r.countdown?.broadcastLabel === "string"
          ? r.countdown.broadcastLabel
          : fallback.countdown.broadcastLabel,
      countdownPrefix:
        typeof r.countdown?.countdownPrefix === "string"
          ? r.countdown.countdownPrefix
          : fallback.countdown.countdownPrefix,
      countdownSuffix:
        typeof r.countdown?.countdownSuffix === "string"
          ? r.countdown.countdownSuffix
          : fallback.countdown.countdownSuffix,
      nowChanneling:
        typeof r.countdown?.nowChanneling === "string"
          ? r.countdown.nowChanneling
          : fallback.countdown.nowChanneling,
      remChatLabelBefore:
        typeof r.countdown?.remChatLabelBefore === "string"
          ? r.countdown.remChatLabelBefore
          : fallback.countdown.remChatLabelBefore,
      remChatLabelAfter:
        typeof r.countdown?.remChatLabelAfter === "string"
          ? r.countdown.remChatLabelAfter
          : fallback.countdown.remChatLabelAfter,
      remChatNoteBefore:
        typeof r.countdown?.remChatNoteBefore === "string"
          ? r.countdown.remChatNoteBefore
          : fallback.countdown.remChatNoteBefore,
      remChatNoteAfter:
        typeof r.countdown?.remChatNoteAfter === "string"
          ? r.countdown.remChatNoteAfter
          : fallback.countdown.remChatNoteAfter,
      targetEpochMs:
        typeof r.countdown?.targetEpochMs === "number"
          ? r.countdown.targetEpochMs
          : fallback.countdown.targetEpochMs,
      eventDate:
        typeof r.countdown?.eventDate === "string"
          ? r.countdown.eventDate
          : fallback.countdown.eventDate,
      eventTagline:
        typeof r.countdown?.eventTagline === "string"
          ? r.countdown.eventTagline
          : fallback.countdown.eventTagline,
    },
    colorBar: {
      networkTitle:
        typeof r.colorBar?.networkTitle === "string"
          ? r.colorBar.networkTitle
          : fallback.colorBar.networkTitle,
      sleepingText:
        typeof r.colorBar?.sleepingText === "string"
          ? r.colorBar.sleepingText
          : fallback.colorBar.sleepingText,
      nextText:
        typeof r.colorBar?.nextText === "string"
          ? r.colorBar.nextText
          : fallback.colorBar.nextText,
      wakeText:
        typeof r.colorBar?.wakeText === "string"
          ? r.colorBar.wakeText
          : fallback.colorBar.wakeText,
    },
    garageV2: {
      unlockEpochMs:
        typeof r.garageV2?.unlockEpochMs === "number"
          ? r.garageV2.unlockEpochMs
          : fallback.garageV2.unlockEpochMs,
      closeEpochMs:
        typeof r.garageV2?.closeEpochMs === "number"
          ? r.garageV2.closeEpochMs
          : fallback.garageV2.closeEpochMs,
    },
    topPage: {
      heroDateBadge:
        typeof r.topPage?.heroDateBadge === "string"
          ? r.topPage.heroDateBadge
          : fallback.topPage.heroDateBadge,
      heroDateLine:
        typeof r.topPage?.heroDateLine === "string"
          ? r.topPage.heroDateLine
          : fallback.topPage.heroDateLine,
      joinDateLine:
        typeof r.topPage?.joinDateLine === "string"
          ? r.topPage.joinDateLine
          : fallback.topPage.joinDateLine,
    },
    programItems: Array.isArray(r.programItems)
      ? r.programItems
          .filter(
            (it) =>
              it &&
              typeof it === "object" &&
              typeof (it as { title?: unknown; desc?: unknown }).title === "string" &&
              typeof (it as { title?: unknown; desc?: unknown }).desc === "string"
          )
          .slice(0, 4)
          .map((it) => {
            const obj = it as { title: string; desc: string };
            return { title: obj.title, desc: obj.desc };
          })
      : fallback.programItems,
  };
}

