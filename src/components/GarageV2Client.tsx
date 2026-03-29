"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  DailyProvider,
  DailyAudio,
  useDaily,
  useDailyEvent,
  useParticipantIds,
  useScreenShare,
} from "@daily-co/daily-react";

const GARAGE_ROOM_URL = "https://remreal-tv.daily.co/garage-room";

// 文言（差し替え用に1箇所で管理）
const COPY = {
  PAGE_TITLE: "REM Chat",
  LABEL_DN: "D.N.:",
  STATUS_SYNC: "REM Sync...",
  STATUS_ASYNC: "REM Async",
  PLACEHOLDER_CHAT: "寝言をつづる",
  SEND_BUTTON: "zzZ",
  BTN_MUTE_OFF: "ROM",
  BTN_MUTE_ON: "REM",
  BTN_SHARE: "映写する",
  BTN_SHARE_STOP: "映写を終える",
  BTN_LEAVE: "覚醒",
  SHARE_HINT_BEFORE: "映写する内容（画面/ウィンドウ/タブ）を選びます。",
  SHARE_HINT_ACTIVE: "映写中です。ロゴを押すと瞼の裏側が開きます。",
  SHARE_HINT_CANCELED: "映写は開始されませんでした（キャンセル）。",
  SHARE_HINT_MIC_CONFLICT:
    "映写とマイクを同時に使えない場合があります。先にREM（マイクON）にしてから映写するか、ブラウザの許可を確認してください。",
  JOIN_NOTICE: "また一人、眠りに落ちました",
  LABEL_PASSPHRASE: "合言葉",
  PLACEHOLDER_PASSPHRASE: "会の合言葉を入力",
  BTN_EXPORT: "寝言を遺す",
  ARCHIVE_NOTE: "テキストは「寝言を遺す」で保存できます。",
  EXPORT_SUCCESS: "寝言をコピーしました。あなたの夢日記に貼り付けることができます。",
  EXPORT_FILE_ONLY:
    "テキストファイルを保存しました。夢日記に貼るときは、保存したファイルを開いてコピーしてください。",
} as const;

const DREAM_NAME_CANDIDATES = [
  "夢の中の通りすがりA",
  "あっちの世界の一般人",
  "寝ても覚めても寝不足",
];

function getRandomDreamName() {
  return DREAM_NAME_CANDIDATES[
    Math.floor(Math.random() * DREAM_NAME_CANDIDATES.length)
  ];
}

/** 無記名入室時: 候補から1つ選び、末尾に一意IDを付けて他ユーザーと名前・色が被らないようにする */
function makeUniqueDreamName(): string {
  const base = getRandomDreamName();
  let suffix: string;
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  } else {
    suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`.slice(0, 12);
  }
  return `${base}·${suffix}`;
}

// ユーザー名から安定した色を割り当て（チャット色分け用）
const USER_COLORS = [
  "rgba(224,90,51,0.85)",
  "rgba(100,180,200,0.9)",
  "rgba(180,140,220,0.9)",
  "rgba(220,180,80,0.9)",
  "rgba(120,200,140,0.9)",
  "rgba(220,120,150,0.9)",
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

function getUserColor(name: string): string {
  return USER_COLORS[hashString(name) % USER_COLORS.length];
}

function withAlpha(rgba: string, alpha: number): string {
  const m = rgba.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)$/);
  if (!m) return rgba;
  return `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${alpha})`;
}

type ChatMessage = {
  id: string;
  from: string;
  text: string;
  timestamp: number;
  system?: boolean;
};

const PASS_OK_KEY = "garage-v2-pass-ok";

function mapRowToChatMessage(row: {
  id: string;
  from_name: string;
  body: string;
  is_system: boolean;
  created_at: string;
}): ChatMessage {
  return {
    id: row.id,
    from: row.from_name,
    text: row.body,
    timestamp: new Date(row.created_at).getTime(),
    system: row.is_system,
  };
}

/** 画面共有用 video 要素 */
function ScreenShareVideo({
  activeScreen,
  className,
}: {
  activeScreen: {
    screenVideo?: {
      persistentTrack?: MediaStreamTrack;
      track?: MediaStreamTrack;
    };
  } | null;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sv =
    (activeScreen as {
      screenVideo?: { persistentTrack?: MediaStreamTrack; track?: MediaStreamTrack };
    } | null)?.screenVideo;
  const track: MediaStreamTrack | null = sv?.persistentTrack ?? sv?.track ?? null;

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !track) return;
    const attachStream = () => {
      const stream = new MediaStream([track]);
      el.srcObject = stream;
      el.play().catch((err) => console.error("[ScreenShareVideo] play failed:", err));
    };
    if (track.readyState === "live") attachStream();
    else {
      const handler = () => attachStream();
      track.addEventListener("unmute", handler, { once: true });
      return () => track.removeEventListener("unmute", handler);
    }
  }, [track]);

  return (
    <video ref={videoRef} autoPlay playsInline muted className={className} />
  );
}

function GarageV2Inner({ shouldForceClose }: { shouldForceClose: boolean }) {
  const daily = useDaily();
  const participantIds = useParticipantIds();
  const [joined, setJoined] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const { screens, isSharingScreen, startScreenShare, stopScreenShare } = useScreenShare();
  const activeScreen = screens[0] ?? null;
  const [showShareOverlay, setShowShareOverlay] = useState(false);
  const [shareHint, setShareHint] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [passphraseRequired, setPassphraseRequired] = useState(false);
  const [passphraseOk, setPassphraseOk] = useState(false);
  const [passphraseInput, setPassphraseInput] = useState("");
  const [passphraseError, setPassphraseError] = useState<string | null>(null);
  const [garageConfigReady, setGarageConfigReady] = useState(false);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());
  const announcedJoinIdsRef = useRef<Set<string>>(new Set());

  const canLocalScreenShare =
    typeof window !== "undefined" &&
    !!(navigator.mediaDevices && (navigator.mediaDevices as any).getDisplayMedia);

  const myDreamName = useMemo(
    () => resolvedName || displayName || "（未設定）",
    [resolvedName, displayName]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/garage-v2/config");
        const j = (await r.json()) as { passphraseRequired?: boolean };
        if (cancelled) return;
        const req = j.passphraseRequired === true;
        setPassphraseRequired(req);
        if (!req) setPassphraseOk(true);
        else if (typeof window !== "undefined" && sessionStorage.getItem(PASS_OK_KEY) === "1") {
          setPassphraseOk(true);
        }
      } catch {
        if (!cancelled) setPassphraseOk(true);
      } finally {
        if (!cancelled) setGarageConfigReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useDailyEvent(
    "joined-meeting",
    useCallback(() => {
      setJoined(true);
      if (daily) setIsAudioOn(daily.localAudio());
    }, [daily])
  );

  useDailyEvent(
    "left-meeting",
    useCallback(() => {
      setJoined(false);
      setIsAudioOn(false);
      setHasJoined(false);
      setResolvedName(null);
      setChatInput("");
      setChatMessages([]);
      seenMessageIdsRef.current.clear();
      announcedJoinIdsRef.current.clear();
    }, [])
  );

  useDailyEvent(
    "participant-joined",
    useCallback((ev) => {
      const p = ev?.participant;
      if (!p || p.local === true) return;
      const pid = String(p.user_id ?? "");
      if (!pid || announcedJoinIdsRef.current.has(pid)) return;
      announcedJoinIdsRef.current.add(pid);
      const un = p.user_name;
      const label = typeof un === "string" && un.trim() ? un.trim() : "guest";
      const id = `join-${pid}-${Date.now()}`;
      setChatMessages((prev) => [
        ...prev,
        {
          id,
          from: "REM",
          text: `${COPY.JOIN_NOTICE}（${label}）`,
          timestamp: Date.now(),
          system: true,
        },
      ]);
    }, [])
  );

  useDailyEvent(
    "app-message",
    useCallback((ev: { data?: { id?: string; text?: string; fromName?: string } }) => {
      const d = ev?.data;
      if (!d || typeof d.text !== "string") return;
      const bodyText: string = d.text;
      const mid = typeof d.id === "string" && d.id ? d.id : null;
      if (mid && seenMessageIdsRef.current.has(mid)) return;
      if (mid) seenMessageIdsRef.current.add(mid);
      const from =
        typeof d?.fromName === "string" && d.fromName.trim() ? d.fromName.trim() : "guest";
      setChatMessages((prev) => [
        ...prev,
        {
          id: mid ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          from,
          text: bodyText,
          timestamp: Date.now(),
        },
      ]);
    }, [])
  );

  const handleJoin = async () => {
    if (!daily || hasJoined) return;
    if (passphraseRequired && !passphraseOk) {
      if (!passphraseInput.trim()) {
        setPassphraseError("合言葉を入力してください");
        return;
      }
      setPassphraseError(null);
      try {
        const r = await fetch("/api/garage-v2/verify-passphrase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ passphrase: passphraseInput.trim() }),
        });
        const j = (await r.json()) as { ok?: boolean };
        if (!j.ok) {
          setPassphraseError("合言葉が違います");
          return;
        }
        if (typeof window !== "undefined") sessionStorage.setItem(PASS_OK_KEY, "1");
        setPassphraseOk(true);
      } catch {
        setPassphraseError("確認に失敗しました");
        return;
      }
    }
    const name = displayName.trim() || makeUniqueDreamName();
    try {
      await daily.join({
        url: GARAGE_ROOM_URL,
        userName: name,
        startAudioOff: true,
        startVideoOff: true,
      });
      setHasJoined(true);
      setResolvedName(name);
      setIsAudioOn(false);
      try {
        const r = await fetch("/api/garage-chat?limit=200");
        const j = (await r.json()) as {
          messages?: Array<{
            id: string;
            from_name: string;
            body: string;
            is_system: boolean;
            created_at: string;
          }>;
        };
        if (j.messages?.length) {
          seenMessageIdsRef.current.clear();
          for (const m of j.messages) {
            seenMessageIdsRef.current.add(m.id);
          }
          setChatMessages(j.messages.map(mapRowToChatMessage));
        }
      } catch {
        /* 履歴が取れなくても入室は続行 */
      }
    } catch {
      // join 失敗時は何もしない
    }
  };

  const handleSend = async () => {
    if (!daily) return;
    const text = chatInput.trim() || COPY.SEND_BUTTON;
    setChatInput("");
    if (textareaRef.current) textareaRef.current.value = "";

    let serverId: string | undefined;
    try {
      const r = await fetch("/api/garage-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromName: myDreamName, body: text, isSystem: false }),
      });
      const j = (await r.json()) as { message?: { id?: string } };
      if (j.message?.id) serverId = j.message.id;
    } catch {
      /* 保存失敗時もチャットは飛ばす */
    }
    if (serverId) seenMessageIdsRef.current.add(serverId);
    const localId = serverId ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const outText: string = text;
    setChatMessages((prev) => {
      if (serverId && prev.some((m) => m.id === serverId)) return prev;
      const row: ChatMessage = {
        id: localId,
        from: myDreamName,
        text: outText,
        timestamp: Date.now(),
      };
      return [...prev, row];
    });
    try {
      await daily.sendAppMessage(
        { id: serverId, text: outText, fromName: myDreamName },
        "*"
      );
    } catch {
      // 送信失敗は握りつぶす
    }
    textareaRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLeave = () => {
    if (!daily) return;
    daily.leave();
    // 体感を速くするため先に戻す（left-meetingでも同じリセットが走る）
    setJoined(false);
    setIsAudioOn(false);
    setHasJoined(false);
    setResolvedName(null);
    setChatInput("");
    setChatMessages([]);
    seenMessageIdsRef.current.clear();
    announcedJoinIdsRef.current.clear();
  };

  const handleToggleMute = () => {
    if (!daily) return;
    const next = !daily.localAudio();
    if (next) {
      try {
        daily.setLocalAudio(true);
        setIsAudioOn(true);
        if (isSharingScreen) {
          window.setTimeout(() => {
            try {
              daily.setLocalAudio(true);
            } catch {
              setShareHint(COPY.SHARE_HINT_MIC_CONFLICT);
            }
          }, 400);
        }
      } catch {
        setShareHint(COPY.SHARE_HINT_MIC_CONFLICT);
        setIsAudioOn(false);
      }
    } else {
      // iOSのマイク使用インジケータを確実に消すため、トラックを破棄する
      daily.setLocalAudio(false, { forceDiscardTrack: true } as { forceDiscardTrack: boolean });
      setIsAudioOn(false);
    }
  };

  const handleToggleShare = async () => {
    if (!daily) return;
    try {
      if (isSharingScreen) {
        await stopScreenShare();
      } else {
        if (!canLocalScreenShare) {
          setShareHint("この端末/ブラウザでは映写できません。PCからお試しください。");
          return;
        }
        setShareHint(COPY.SHARE_HINT_BEFORE);
        await startScreenShare();
        if (isAudioOn) {
          window.setTimeout(() => {
            try {
              daily.setLocalAudio(true);
            } catch {
              setShareHint(COPY.SHARE_HINT_MIC_CONFLICT);
            }
          }, 400);
        }
      }
    } catch {
      // 映写の開始/終了失敗時は握りつぶす
      setShareHint(COPY.SHARE_HINT_CANCELED);
    }
  };

  const handleExportLog = () => {
    const lines = [...chatMessages]
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((m) => `[${m.from}] ${m.text}`);
    const text = lines.join("\n");
    const stamp = new Date();
    const filename = `rem-chat-${stamp.getFullYear()}${String(stamp.getMonth() + 1).padStart(2, "0")}${String(stamp.getDate()).padStart(2, "0")}-${String(stamp.getHours()).padStart(2, "0")}${String(stamp.getMinutes()).padStart(2, "0")}.txt`;

    try {
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setShareHint("ファイルの保存に失敗しました");
      return;
    }

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(
        () => setShareHint(COPY.EXPORT_SUCCESS),
        () => setShareHint(COPY.EXPORT_FILE_ONLY)
      );
    } else {
      setShareHint(COPY.EXPORT_FILE_ONLY);
    }
  };

  const displayNameFor = (from: string) => from;

  // 映写状態の変化に合わせて短いヒントを出す
  useEffect(() => {
    if (isSharingScreen) setShareHint(COPY.SHARE_HINT_ACTIVE);
    else if (shareHint === COPY.SHARE_HINT_ACTIVE) setShareHint(null);
  }, [isSharingScreen, shareHint]);

  // ヒントは短時間で消える（常時表示はしない）
  useEffect(() => {
    if (!shareHint) return;
    const t = window.setTimeout(() => setShareHint(null), 5200);
    return () => window.clearTimeout(t);
  }, [shareHint]);

  // textarea の自動伸長（最大4行程度）
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxPx = 22 * 4 + 16; // おおよそ 4行 + padding
    el.style.height = `${Math.min(el.scrollHeight, maxPx)}px`;
  }, [chatInput]);

  // 予定終了時の強制クローズ（休止画面表示と同時に部屋から退出）
  useEffect(() => {
    if (!shouldForceClose) return;
    if (!daily) return;
    daily.leave();
    setJoined(false);
    setIsAudioOn(false);
    setHasJoined(false);
    setResolvedName(null);
    setChatInput("");
    setChatMessages([]);
  }, [shouldForceClose, daily]);

  if (!hasJoined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[520px] md:h-[480px] bg-[rgba(13,15,18,0.9)] border border-[rgba(255,255,255,0.08)] rounded-xl px-6 mx-4 mt-4">
        <div className="max-w-md w-full space-y-4 text-center">
          <h2 className="text-[1rem] md:text-[1.1rem] text-secondary tracking-[0.18em]">
            まどろみの窓
          </h2>
          <p className="text-[0.85rem] text-[rgba(255,255,255,0.7)]">
            夢の中での名前を入力してください。
          </p>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="例）百面惣、名もなき夢人 など"
            className="w-full bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.2)] rounded-md px-3 py-2 text-[0.9rem] text-secondary outline-none focus:border-gold"
          />
          {passphraseRequired && !passphraseOk && (
            <div className="w-full space-y-1 text-left">
              <label className="block text-[0.75rem] text-[rgba(255,255,255,0.65)]">{COPY.LABEL_PASSPHRASE}</label>
              <input
                type="password"
                autoComplete="off"
                value={passphraseInput}
                onChange={(e) => {
                  setPassphraseInput(e.target.value);
                  setPassphraseError(null);
                }}
                placeholder={COPY.PLACEHOLDER_PASSPHRASE}
                className="w-full bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.2)] rounded-md px-3 py-2 text-[0.9rem] text-secondary outline-none focus:border-gold"
              />
              {passphraseError && (
                <p className="text-[0.72rem] text-[rgba(224,90,51,0.9)]">{passphraseError}</p>
              )}
            </div>
          )}
          <p className="text-[0.75rem] text-[rgba(255,255,255,0.55)]">
            空欄のまま入室すると、夢氏名がランダムに付きます（重ならないよう末尾に短い識別が付きます）。
          </p>
          <button
            type="button"
            onClick={handleJoin}
            disabled={!garageConfigReady}
            className="w-full mt-2 px-4 py-2 text-[0.85rem] tracking-[0.18em] bg-gold text-deep border border-gold hover:bg-transparent hover:text-gold transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            {garageConfigReady ? "瞳を閉じる" : "準備中…"}
          </button>
          <div className="pt-1">
            <Link
              href="/"
              className="text-[0.78rem] text-[rgba(232,228,223,0.65)] hover:text-gold transition-colors"
            >
              ← 現実へ戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* 固定ヘッダー：ロゴ（瞼の裏側ボタン）＋タイトル＋右上3ボタン */}
      <header className="sticky top-0 z-40 bg-[rgba(13,15,18,0.98)] border-b border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center justify-between gap-3 px-4 py-2 md:px-6 md:py-3">
          <button
            type="button"
            onClick={() => setShowShareOverlay(true)}
            className="flex items-center gap-2 md:gap-3 shrink-0 focus:outline-none"
            aria-label="瞼の裏側（画面共有）を開く"
          >
            <span
              className={
                "relative flex rounded-full border-2 transition-all " +
                (activeScreen
                  ? "border-amber-400/90 bg-amber-500/20 shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                  : "border-[rgba(255,255,255,0.3)] bg-[rgba(0,0,0,0.4)]")
              }
            >
              <Image
                src="/logo-nemumi.png"
                alt=""
                width={40}
                height={40}
                className="w-10 h-10 md:w-12 md:h-12 object-contain rounded-full"
              />
            </span>
            <h1 className="font-shippori text-[0.95rem] md:text-[1.1rem] font-bold text-secondary leading-tight">
              {COPY.PAGE_TITLE}
            </h1>
          </button>
          <div className="sm:min-w-[140px] flex items-center gap-1.5 md:gap-2 justify-end flex-wrap">
            <button
              type="button"
              onClick={handleExportLog}
              className="inline-flex px-2.5 py-1.5 rounded-full border border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.06)] text-[0.65rem] text-[rgba(255,255,255,0.75)]"
            >
              {COPY.BTN_EXPORT}
            </button>
            <button
              type="button"
              onClick={handleToggleMute}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-[rgba(255,255,255,0.25)] hover:bg-[rgba(255,255,255,0.06)] text-[0.7rem]"
            >
              <span
                className={
                  "relative inline-flex items-center justify-center w-4 h-4 rounded-full border " +
                  (isAudioOn
                    ? "border-[rgba(224,90,51,0.9)] bg-[rgba(224,90,51,0.12)]"
                    : "border-[rgba(255,255,255,0.4)] bg-[rgba(0,0,0,0.6)]")
                }
              >
                {isAudioOn ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[rgba(255,255,255,0.95)]" />
                ) : (
                  <span className="w-2.5 h-[1px] bg-[rgba(255,255,255,0.7)] rotate-[-18deg]" />
                )}
              </span>
              <span className="text-[rgba(255,255,255,0.85)]">
                {isAudioOn ? COPY.BTN_MUTE_ON : COPY.BTN_MUTE_OFF}
              </span>
            </button>
            <button
              type="button"
              onClick={handleToggleShare}
              className={
                "px-2.5 py-1.5 rounded-full border hover:bg-[rgba(255,255,255,0.06)] text-[0.7rem] text-[rgba(255,255,255,0.85)] " +
                (isSharingScreen
                  ? "border-amber-400/50 bg-amber-500/10"
                  : "border-[rgba(255,255,255,0.25)]")
              }
            >
              {isSharingScreen ? COPY.BTN_SHARE_STOP : COPY.BTN_SHARE}
            </button>
            <button
              type="button"
              onClick={handleLeave}
              className="px-2.5 py-1.5 rounded-full border border-[rgba(255,255,255,0.25)] hover:bg-[rgba(255,255,255,0.06)] text-[0.7rem] text-[rgba(255,255,255,0.85)]"
            >
              {COPY.BTN_LEAVE}
            </button>
          </div>
        </div>

        {/* 情報バー：D.N. と参加者・ステータス（ヘッダー内に統合） */}
        <div className="flex flex-col gap-1 px-4 pb-2">
          <div className="flex items-center justify-between gap-3 text-[0.68rem] text-[rgba(255,255,255,0.6)]">
            <span>
              {COPY.LABEL_DN}
              <span className="text-secondary ml-1">{myDreamName}</span>
            </span>
            <span>参加者: {participantIds.length}</span>
            <span
              className={
                joined
                  ? "text-amber-400/90 font-medium animate-pulse"
                  : "text-[rgba(255,255,255,0.45)]"
              }
            >
              {joined ? COPY.STATUS_SYNC : COPY.STATUS_ASYNC}
            </span>
          </div>
          <p className="text-[0.62rem] leading-snug text-[rgba(255,255,255,0.38)]">{COPY.ARCHIVE_NOTE}</p>
        </div>
      </header>

      {/* チャット本文（スクロール） */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 pb-28">
        {chatMessages.length === 0 && (
          <p className="text-[0.8rem] text-[rgba(255,255,255,0.4)]">
            ここにチャットが流れます。まだ何も話されていません。
          </p>
        )}
        <div className="space-y-2 text-[0.85rem]">
          {[...chatMessages].reverse().map((msg) => {
            if (msg.system) {
              return (
                <div key={msg.id} className="text-center text-[0.72rem] text-[rgba(255,255,255,0.45)] italic py-1">
                  {msg.text}
                </div>
              );
            }
            const name = displayNameFor(msg.from);
            const color = getUserColor(name);
            const bubbleBg = withAlpha(color, 0.12);
            return (
              <div key={msg.id} className="flex gap-2 items-baseline">
                <span
                  className="shrink-0 text-[0.7rem] font-medium min-w-[4.5rem]"
                  style={{ color }}
                >
                  {name}:
                </span>
                <span
                  className="px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.06)] text-secondary break-words"
                  style={{ backgroundColor: bubbleBg }}
                >
                  {msg.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* モバイル：寝言マイク（REM / ROM）を右下に固定 */}
      <button
        type="button"
        onClick={handleToggleMute}
        className="md:hidden fixed z-[45] flex flex-col items-center justify-center gap-1 rounded-full border-2 border-[rgba(255,255,255,0.35)] bg-[rgba(13,15,18,0.92)] px-4 py-3 shadow-lg touch-manipulation"
        style={{
          right: "max(1rem, env(safe-area-inset-right))",
          bottom: "calc(5.75rem + env(safe-area-inset-bottom))",
        }}
        aria-label={isAudioOn ? "REM（マイクオン）" : "ROM（マイクオフ）"}
      >
        <span
          className={
            "flex h-8 w-8 items-center justify-center rounded-full border " +
            (isAudioOn
              ? "border-[rgba(224,90,51,0.95)] bg-[rgba(224,90,51,0.2)]"
              : "border-[rgba(255,255,255,0.45)] bg-[rgba(0,0,0,0.5)]")
          }
        >
          {isAudioOn ? (
            <span className="h-2 w-2 rounded-full bg-[rgba(255,255,255,0.95)]" />
          ) : (
            <span className="h-[2px] w-5 bg-[rgba(255,255,255,0.75)] rotate-[-20deg]" />
          )}
        </span>
        <span className="text-[0.65rem] font-medium tracking-[0.12em] text-[rgba(255,255,255,0.9)]">
          {isAudioOn ? COPY.BTN_MUTE_ON : COPY.BTN_MUTE_OFF}
        </span>
      </button>

      {/* 入力エリア（フッター固定） */}
      <div
        className="fixed left-0 right-0 bottom-0 z-40"
        style={{ bottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="max-w-[960px] mx-auto border-t border-[rgba(255,255,255,0.1)] px-4 py-3 bg-[rgba(13,15,18,0.55)] backdrop-blur-md">
          {shareHint && (
            <div className="mb-2 text-[0.72rem] text-[rgba(255,255,255,0.65)]">
              {shareHint}
            </div>
          )}
          <div
            className="flex gap-2 items-end"
            style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder={COPY.PLACEHOLDER_CHAT}
              className="flex-1 min-w-0 bg-[rgba(0,0,0,0.35)] border border-[rgba(255,255,255,0.16)] rounded-md text-[16px] md:text-[0.85rem] px-3 py-2 outline-none focus:border-gold resize-none"
            />
            <button
              type="button"
              onClick={handleSend}
              className="shrink-0 px-4 py-2 text-[0.8rem] tracking-[0.15em] bg-gold text-deep border border-gold hover:bg-transparent hover:text-gold transition-colors rounded-md whitespace-nowrap"
            >
              {COPY.SEND_BUTTON}
            </button>
          </div>
        </div>
      </div>

      {/* 瞼の裏側ポップアップ（ロゴクリックで表示） */}
      {showShareOverlay && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center px-4"
          onClick={() => setShowShareOverlay(false)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video bg-black border border-[rgba(255,255,255,0.3)] rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {activeScreen ? (
              <ScreenShareVideo
                activeScreen={
                  activeScreen as {
                    screenVideo?: {
                      persistentTrack?: MediaStreamTrack;
                      track?: MediaStreamTrack;
                    };
                  }
                }
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[rgba(255,255,255,0.5)] text-sm">
                瞼の裏側 — まだ何も映されていません
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowShareOverlay(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[rgba(0,0,0,0.6)] text-[rgba(255,255,255,0.8)] flex items-center justify-center hover:bg-[rgba(255,255,255,0.2)]"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GarageV2Client({
  shouldForceClose = false,
}: {
  shouldForceClose?: boolean;
}) {
  return (
    <DailyProvider url={GARAGE_ROOM_URL}>
      <div className="min-h-[100dvh] flex flex-col max-w-[960px] mx-auto">
        {/* リモート音声再生（これがないと相手の声が聞こえない） */}
        <DailyAudio />
        <GarageV2Inner shouldForceClose={shouldForceClose} />
      </div>
    </DailyProvider>
  );
}
