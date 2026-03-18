"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  DailyProvider,
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
  BTN_MUTE_OFF: "沈黙中",
  BTN_MUTE_ON: "寝言中",
  BTN_SHARE: "映写する",
  BTN_SHARE_STOP: "映写を終える",
  BTN_LEAVE: "退出",
  SHARE_HINT_BEFORE: "映写する内容（画面/ウィンドウ/タブ）を選びます。",
  SHARE_HINT_ACTIVE: "映写中です。ロゴを押すと瞼の裏側が開きます。",
  SHARE_HINT_CANCELED: "映写は開始されませんでした（キャンセル）。",
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

type ChatMessage = {
  id: string;
  from: string;
  text: string;
  timestamp: number;
};

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

function GarageV2Inner() {
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

  const myDreamName = useMemo(
    () => resolvedName || displayName || "（未設定）",
    [resolvedName, displayName]
  );

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
    }, [])
  );

  useDailyEvent(
    "app-message",
    useCallback((ev: any) => {
      if (!ev?.data || typeof ev.data.text !== "string") return;
      const from = ev?.from?.user_name || "guest";
      setChatMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          from,
          text: ev.data.text,
          timestamp: Date.now(),
        },
      ]);
    }, [])
  );

  const handleJoin = async () => {
    if (!daily || hasJoined) return;
    const name = displayName.trim() || getRandomDreamName();
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
    } catch {
      // join 失敗時は何もしない
    }
  };

  const handleSend = async () => {
    if (!daily || !chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        from: "you",
        text,
        timestamp: Date.now(),
      },
    ]);
    try {
      daily.sendAppMessage({ text }, "*");
    } catch {
      // 送信失敗は握りつぶす
    }
    textareaRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLeave = () => {
    if (!daily) return;
    daily.leave();
  };

  const handleToggleMute = () => {
    if (!daily) return;
    const next = !daily.localAudio();
    daily.setLocalAudio(next);
    setIsAudioOn(next);
  };

  const handleToggleShare = async () => {
    if (!daily) return;
    try {
      if (isSharingScreen) {
        await stopScreenShare();
      } else {
        setShareHint(COPY.SHARE_HINT_BEFORE);
        await startScreenShare();
      }
    } catch {
      // 映写の開始/終了失敗時は握りつぶす
      setShareHint(COPY.SHARE_HINT_CANCELED);
    }
  };

  const displayNameFor = (from: string) =>
    from === "you" ? (resolvedName || displayName || "（未設定）") : from;

  // 映写状態の変化に合わせて短いヒントを出す
  useEffect(() => {
    if (isSharingScreen) setShareHint(COPY.SHARE_HINT_ACTIVE);
    else if (shareHint === COPY.SHARE_HINT_ACTIVE) setShareHint(null);
  }, [isSharingScreen, shareHint]);

  // ヒントは短時間で消える（常時表示はしない）
  useEffect(() => {
    if (!shareHint) return;
    const t = window.setTimeout(() => setShareHint(null), 2800);
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
          <p className="text-[0.75rem] text-[rgba(255,255,255,0.55)]">
            空欄のまま入室すると、「夢の中の通りすがりA」などの夢氏名がレムリア側でそっと選ばれます。
          </p>
          <button
            type="button"
            onClick={handleJoin}
            className="w-full mt-2 px-4 py-2 text-[0.85rem] tracking-[0.18em] bg-gold text-deep border border-gold hover:bg-transparent hover:text-gold transition-colors"
          >
            入室する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* 固定ヘッダー：ロゴ（瞼の裏側ボタン）＋タイトル＋右上3ボタン */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 px-4 py-2 md:px-6 md:py-3 bg-[rgba(13,15,18,0.98)] border-b border-[rgba(255,255,255,0.08)]">
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
        <div className="sm:min-w-[140px] flex items-center gap-1.5 md:gap-2 justify-end">
          <button
            type="button"
            onClick={handleToggleMute}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-[rgba(255,255,255,0.25)] hover:bg-[rgba(255,255,255,0.06)] text-[0.7rem]"
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
      </header>

      {/* 情報バー：D.N. と参加者・ステータス（邪魔にならない位置） */}
      <div className="flex items-center justify-between gap-3 px-4 py-1.5 text-[0.68rem] text-[rgba(255,255,255,0.6)] bg-[rgba(13,15,18,0.55)] border-b border-[rgba(255,255,255,0.06)]">
        <span>
          {COPY.LABEL_DN}
          <span className="text-secondary ml-1">{myDreamName}</span>
        </span>
        <span>参加者: {participantIds.length}</span>
        <span
          className={
            joined
              ? "text-amber-400/90 font-medium"
              : "text-[rgba(255,255,255,0.45)]"
          }
        >
          {joined ? COPY.STATUS_SYNC : COPY.STATUS_ASYNC}
        </span>
      </div>

      {/* チャット本文（スクロール） */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 pb-28">
        {chatMessages.length === 0 && (
          <p className="text-[0.8rem] text-[rgba(255,255,255,0.4)]">
            ここにチャットが流れます。まだ何も話されていません。
          </p>
        )}
        <div className="space-y-2 text-[0.85rem]">
          {[...chatMessages].reverse().map((msg) => {
            const name = displayNameFor(msg.from);
            const color = getUserColor(name);
            return (
              <div key={msg.id} className="flex gap-2 items-baseline">
                <span
                  className="shrink-0 text-[0.7rem] font-medium min-w-[4.5rem]"
                  style={{ color }}
                >
                  {name}:
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.04)] text-secondary break-words">
                  {msg.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 入力エリア（フッター固定） */}
      <div className="fixed left-0 right-0 bottom-0 z-40">
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
              placeholder={COPY.PLACEHOLDER_CHAT}
              className="flex-1 min-w-0 bg-[rgba(0,0,0,0.35)] border border-[rgba(255,255,255,0.16)] rounded-md text-[0.85rem] px-3 py-2 outline-none focus:border-gold resize-none"
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

export default function GarageV2Client() {
  return (
    <DailyProvider url={GARAGE_ROOM_URL}>
      <div className="min-h-[100dvh] flex flex-col max-w-[960px] mx-auto">
        <GarageV2Inner />
      </div>
    </DailyProvider>
  );
}
