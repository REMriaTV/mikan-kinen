export type ProgramItem = {
  title: string;
  desc: string;
};

/** 見逃しファーストビュー導線: A=カウントダウンバナー内リンク, B=ヒーロー内ピル */
export type MinogashiCtaVariant = "A" | "B";

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
  /** ねむみ放送（寝落ちチャンネル）トップ導線・解錠時刻 */
  nemumi: {
    visible: boolean;
    label: string;
    date: string;
    noteBefore: string;
    noteAfter: string;
    unlockEpochMs: number;
    closeEpochMs: number;
  };
  topPage: {
    heroDateBadge: string;
    heroDateLine: string;
    joinDateLine: string;
    minogashiVisible: boolean;
    minogashiLabel: string;
    minogashiTitle: string;
    minogashiDate: string;
    minogashiYoutubeUrl: string;
    minogashiYoutubeId: string;
    minogashiDescription: string;
    /** ヒーロー内ピル左側の文（右は minogashiTitle）。例: 前回の放送を観る。案Aのバナー文言左段にも使う */
    minogashiHeroBadgeLead: string;
    /** 見逃し導線: A=バナー内 / B=ヒーロー内ピル */
    minogashiCtaVariant: MinogashiCtaVariant;
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
  nemumi: {
    visible: false,
    label: "寝落ちチャンネル（ねむみ）",
    date: "",
    noteBefore: "ねむみの波が近づいています...",
    noteAfter: "ねむみの波の中にいます",
    unlockEpochMs: Date.parse("2020-01-01T00:00:00Z"),
    closeEpochMs: Date.parse("2099-12-31T14:59:00Z"),
  },
  topPage: {
    heroDateBadge: "2026.3.30 MON",
    heroDateLine: "2026年 3月30日（月）22:00〜",
    joinDateLine: "2026年3月30日（月）22:00〜 / オンライン / 無料",
    minogashiVisible: true,
    minogashiLabel: "見逃し夢配信",
    minogashiTitle: "第二回 未完記念トークショー",
    minogashiDate: "2026.3.30 MON 22:00〜",
    minogashiYoutubeUrl: "https://youtu.be/RM77oWS95Ac",
    minogashiYoutubeId: "RM77oWS95Ac",
    minogashiDescription: "",
    minogashiHeroBadgeLead: "前回の放送を観る",
    minogashiCtaVariant: "A",
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

/** youtu.be / watch?v= / embed / 生の11桁ID から動画IDを取り出す */
export function extractYoutubeVideoId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  const short = s.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (short?.[1]) return short[1];
  const vParam = s.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (vParam?.[1]) return vParam[1];
  const embed = s.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embed?.[1]) return embed[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  return null;
}

/** ヒーロー内ピルに表示する文言（▶ {lead} — {title}） */
export function formatMinogashiHeroBadgeText(lead: string, title: string): string {
  const l = lead.trim();
  const t = title.trim();
  const left = l.length > 0 ? l : "前回の放送を観る";
  return `▶ ${left} — ${t}`;
}

/** 案A バナー内リンク（▶ {lead} ↓） */
export function formatMinogashiBannerLinkText(lead: string): string {
  const l = lead.trim();
  const left = l.length > 0 ? l : "前回の放送を観る";
  return `▶ ${left} ↓`;
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
    nemumi: {
      visible:
        typeof r.nemumi?.visible === "boolean"
          ? r.nemumi.visible
          : fallback.nemumi.visible,
      label:
        typeof r.nemumi?.label === "string" ? r.nemumi.label : fallback.nemumi.label,
      date: typeof r.nemumi?.date === "string" ? r.nemumi.date : fallback.nemumi.date,
      noteBefore:
        typeof r.nemumi?.noteBefore === "string"
          ? r.nemumi.noteBefore
          : fallback.nemumi.noteBefore,
      noteAfter:
        typeof r.nemumi?.noteAfter === "string"
          ? r.nemumi.noteAfter
          : fallback.nemumi.noteAfter,
      unlockEpochMs:
        typeof r.nemumi?.unlockEpochMs === "number"
          ? r.nemumi.unlockEpochMs
          : fallback.nemumi.unlockEpochMs,
      closeEpochMs:
        typeof r.nemumi?.closeEpochMs === "number"
          ? r.nemumi.closeEpochMs
          : fallback.nemumi.closeEpochMs,
    },
    topPage: (() => {
      const tp = r.topPage;
      const fb = fallback.topPage;
      let minogashiYoutubeId =
        typeof tp?.minogashiYoutubeId === "string"
          ? tp.minogashiYoutubeId.trim()
          : fb.minogashiYoutubeId;
      const minogashiYoutubeUrl =
        typeof tp?.minogashiYoutubeUrl === "string"
          ? tp.minogashiYoutubeUrl.trim()
          : fb.minogashiYoutubeUrl;
      const extracted =
        extractYoutubeVideoId(minogashiYoutubeId) ||
        extractYoutubeVideoId(minogashiYoutubeUrl);
      if (extracted) {
        minogashiYoutubeId = extracted;
      }

      return {
        heroDateBadge:
          typeof tp?.heroDateBadge === "string"
            ? tp.heroDateBadge
            : fb.heroDateBadge,
        heroDateLine:
          typeof tp?.heroDateLine === "string"
            ? tp.heroDateLine
            : fb.heroDateLine,
        joinDateLine:
          typeof tp?.joinDateLine === "string"
            ? tp.joinDateLine
            : fb.joinDateLine,
        minogashiVisible:
          typeof tp?.minogashiVisible === "boolean"
            ? tp.minogashiVisible
            : fb.minogashiVisible,
        minogashiLabel:
          typeof tp?.minogashiLabel === "string"
            ? tp.minogashiLabel
            : fb.minogashiLabel,
        minogashiTitle:
          typeof tp?.minogashiTitle === "string"
            ? tp.minogashiTitle
            : fb.minogashiTitle,
        minogashiDate:
          typeof tp?.minogashiDate === "string"
            ? tp.minogashiDate
            : fb.minogashiDate,
        minogashiYoutubeUrl:
          minogashiYoutubeUrl.length > 0
            ? minogashiYoutubeUrl
            : fb.minogashiYoutubeUrl,
        minogashiYoutubeId,
        minogashiDescription:
          typeof tp?.minogashiDescription === "string"
            ? tp.minogashiDescription
            : fb.minogashiDescription,
        minogashiHeroBadgeLead:
          typeof tp?.minogashiHeroBadgeLead === "string"
            ? tp.minogashiHeroBadgeLead
            : fb.minogashiHeroBadgeLead,
        minogashiCtaVariant:
          tp?.minogashiCtaVariant === "A" || tp?.minogashiCtaVariant === "B"
            ? tp.minogashiCtaVariant
            : fb.minogashiCtaVariant,
      };
    })(),
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

