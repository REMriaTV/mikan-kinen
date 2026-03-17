"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  DailyProvider,
  useDaily,
  useDailyEvent,
  useParticipantIds,
  useScreenShare,
} from "@daily-co/daily-react";

const GARAGE_ROOM_URL = "https://remreal-tv.daily.co/garage-room";

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

type ChatMessage = {
  id: string;
  from: string;
  text: string;
  timestamp: number;
};

/** 画面共有用 video 要素。autoPlay/playsInline/muted の3点セット＋readyState 対応 */
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
    if (!el) {
      console.warn("[ScreenShareVideo] video element not ready");
      return;
    }
    if (!track) {
      console.warn("[ScreenShareVideo] no track found on activeScreen");
      return;
    }

    const attachStream = () => {
      const stream = new MediaStream([track]);
      el.srcObject = stream;
      el.play().catch((err) => console.error("[ScreenShareVideo] play failed:", err));
    };

    if (track.readyState === "live") {
      attachStream();
    } else {
      const handler = () => attachStream();
      track.addEventListener("unmute", handler, { once: true });
      return () => track.removeEventListener("unmute", handler);
    }
  }, [track]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className={className}
    />
  );
}

function GarageV2Inner() {
  const daily = useDaily();
  const participantIds = useParticipantIds();
  const [joined, setJoined] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const { screens, isSharingScreen, startScreenShare, stopScreenShare } = useScreenShare();
  const activeScreen = screens[0] ?? null;
  const [showShareOverlay, setShowShareOverlay] = useState(false);

  // 参加状態の監視
  useDailyEvent(
    "joined-meeting",
    useCallback(() => {
      setJoined(true);
      if (daily) {
        setIsAudioOn(daily.localAudio());
        setIsCameraOn(daily.localVideo());
      }
    }, [daily])
  );

  useDailyEvent(
    "left-meeting",
    useCallback(() => {
      setJoined(false);
      setHasJoined(false);
      setIsAudioOn(false);
      setIsCameraOn(false);
      setChatMessages([]);
    }, [])
  );

  // app-message でチャット受信
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
      setIsAudioOn(false);
      setIsCameraOn(false);
    } catch {
      // join 失敗時は何もしない（メッセージも保持）
    }
  };

  const handleSend = async () => {
    if (!daily || !chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput("");
    // 自分側にも即時反映
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
      // 送信失敗はここでは握りつぶす
    }
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

  const handleToggleCamera = () => {
    if (!daily) return;
    const next = !isCameraOn;
    daily.setLocalVideo(next);
    setIsCameraOn(next);
  };

  const handleToggleShare = async () => {
    if (!daily) return;
    try {
      if (isSharingScreen) {
        await stopScreenShare();
      } else {
        await startScreenShare();
      }
    } catch {
      // 画面映写の開始/終了に失敗した場合はここでは握りつぶす
    }
  };

  if (!hasJoined) {
    return (
      <div className="flex flex-col items-center justify-center h-[520px] md:h-[480px] bg-[rgba(13,15,18,0.9)] border border-[rgba(255,255,255,0.08)] rounded-xl px-6">
        <div className="max-w-md w-full space-y-4 text-center">
          <h2 className="text-[1rem] md:text-[1.1rem] text-secondary tracking-[0.18em]">
            GARAGE HUNT v2
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
    <div className="flex flex-col md:flex-row gap-4 h-[520px] md:h-[480px]">
      {/* チャットメインエリア */}
      <div className="flex-1 flex flex-col min-h-0 bg-[rgba(13,15,18,0.9)] border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <div className="text-[0.8rem] text-dim">
              {joined ? "接続中 - GARAGE HUNT v2" : "接続準備中"}
            </div>
            <div className="text-[0.7rem] text-[rgba(255,255,255,0.5)]">
              参加者: {participantIds.length}
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleCamera}
            className="flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(255,255,255,0.25)] hover:bg-[rgba(255,255,255,0.06)]"
          >
            <span
              className={
                "relative inline-flex items-center justify-center w-6 h-6 rounded-full border " +
                (isCameraOn
                  ? "border-[rgba(255,80,80,0.9)] bg-[rgba(255,80,80,0.12)]"
                  : "border-[rgba(255,255,255,0.4)] bg-[rgba(0,0,0,0.6)]")
              }
            >
              {/* 瞳アイコン（シンプルな目の形） */}
              <span className="absolute inset-[5px] rounded-full border border-[rgba(255,255,255,0.6)] opacity-80" />
              {isCameraOn && (
                <span className="w-1.5 h-1.5 rounded-full bg-[rgba(255,255,255,0.95)]" />
              )}
              {!isCameraOn && (
                <span className="w-4 h-[1px] bg-[rgba(255,255,255,0.7)] rotate-[-12deg]" />
              )}
            </span>
            <span className="text-[0.7rem] text-[rgba(255,255,255,0.7)]">
              {isCameraOn ? "目を開いている" : "目を閉じている"}
            </span>
          </button>
        </div>
        <div className="flex-1 px-4 py-3 space-y-2 overflow-y-auto text-[0.85rem]">
          {chatMessages.length === 0 && (
            <p className="text-[0.8rem] text-[rgba(255,255,255,0.4)]">
              ここにチャットが流れます。まだ何も話されていません。
            </p>
          )}
          {chatMessages.map((msg) => (
            <div key={msg.id} className="flex flex-col">
              <span className="text-[0.7rem] text-[rgba(255,255,255,0.5)] mb-0.5">
                {msg.from}
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.04)] text-secondary">
                {msg.text}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-[rgba(255,255,255,0.1)] px-4 py-3 space-y-2">
          <textarea
            rows={2}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力（Enterで送信 / Shift+Enterで改行）"
            className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.16)] rounded-md text-[0.85rem] px-3 py-2 outline-none focus:border-gold resize-none"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSend}
              className="px-4 py-1.5 text-[0.8rem] tracking-[0.15em] bg-gold text-deep border border-gold hover:bg-transparent hover:text-gold transition-colors"
            >
              送信
            </button>
          </div>
        </div>
      </div>

      {/* 画面共有サムネイル＋コントロール */}
      <div className="w-full md:w-64 flex flex-col gap-3 min-h-0">
        <div
          className="flex-1 min-h-[120px] max-h-[200px] md:max-h-none bg-[rgba(13,15,18,0.9)] border border-[rgba(255,255,255,0.08)] rounded-xl flex items-center justify-center text-[0.8rem] text-[rgba(255,255,255,0.8)] cursor-pointer overflow-hidden"
          onClick={() => {
            if (activeScreen) setShowShareOverlay(true);
          }}
        >
          {!activeScreen && (
            <div className="text-center px-4">
              <p className="text-[0.8rem] text-[rgba(255,255,255,0.75)]">
                瞼の裏側 — まだ何も映されていません
              </p>
            </div>
          )}
          {activeScreen && (
            <ScreenShareVideo
              activeScreen={
                activeScreen as {
                  screenVideo?: { persistentTrack?: MediaStreamTrack; track?: MediaStreamTrack };
                }
              }
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="bg-[rgba(13,15,18,0.9)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 space-y-2 text-[0.8rem] text-dim">
          <div className="flex items-center justify-between">
            <span>声のスイッチ</span>
            <button
              type="button"
              onClick={handleToggleMute}
              className="flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(255,255,255,0.25)] hover:bg-[rgba(255,255,255,0.06)]"
            >
              <span
                className={
                  "relative inline-flex items-center justify-center w-5 h-5 rounded-full border " +
                  (isAudioOn
                    ? "border-[rgba(224,90,51,0.9)] bg-[rgba(224,90,51,0.12)]"
                    : "border-[rgba(255,255,255,0.4)] bg-[rgba(0,0,0,0.6)]")
                }
              >
                {isAudioOn ? (
                  <span className="w-3 h-3 rounded-full bg-[rgba(255,255,255,0.95)]" />
                ) : (
                  <span className="w-3 h-[1px] bg-[rgba(255,255,255,0.7)] rotate-[-18deg]" />
                )}
              </span>
              <span className="text-[0.7rem] text-[rgba(255,255,255,0.8)]">
                {isAudioOn ? "声を届けている" : "沈黙中"}
              </span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span>映写</span>
            <button
              type="button"
              onClick={handleToggleShare}
              className="px-3 py-1 rounded-full border border-[rgba(255,255,255,0.25)] hover:bg-[rgba(255,255,255,0.06)]"
            >
              {isSharingScreen ? "映写を終える" : "映写する"}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span>セッション</span>
            <button
              type="button"
              onClick={handleLeave}
              className="px-3 py-1 rounded-full border border-[rgba(255,255,255,0.25)] hover:bg-[rgba(255,255,255,0.06)]"
            >
              退出
            </button>
          </div>
        </div>
      </div>

      {/* 画面共有全画面オーバーレイ */}
      {showShareOverlay && activeScreen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center px-4">
          <div className="relative w-full max-w-4xl aspect-video bg-black border border-[rgba(255,255,255,0.3)] rounded-xl overflow-hidden">
            <ScreenShareVideo
              activeScreen={
                activeScreen as {
                  screenVideo?: { persistentTrack?: MediaStreamTrack; track?: MediaStreamTrack };
                }
              }
              className="w-full h-full object-contain bg-black"
            />
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
      <GarageV2Inner />
    </DailyProvider>
  );
}

