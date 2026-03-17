"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  DailyProvider,
  useDaily,
  useDailyEvent,
  useParticipantIds,
  useScreenShare,
} from "@daily-co/daily-react";

const GARAGE_ROOM_URL = "https://remreal-tv.daily.co/garage-room";

type ChatMessage = {
  id: string;
  from: string;
  text: string;
  timestamp: number;
};

function GarageV2Inner() {
  const daily = useDaily();
  const participantIds = useParticipantIds();
  const [joined, setJoined] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const { screens } = useScreenShare();
  const activeScreen = screens[0] ?? null;
  const [showShareOverlay, setShowShareOverlay] = useState(false);

  // 参加状態の監視
  useDailyEvent(
    "joined-meeting",
    useCallback(() => {
      setJoined(true);
    }, [])
  );

  useDailyEvent(
    "left-meeting",
    useCallback(() => {
      setJoined(false);
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

  // 最初の join
  useEffect(() => {
    if (!daily) return;
    daily.join({ url: GARAGE_ROOM_URL }).catch(() => {
      // エラー時はjoinedフラグを立てないだけにしておく
    });
  }, [daily]);

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
    const isMuted = daily.localAudio();
    daily.setLocalAudio(!isMuted);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[520px] md:h-[480px]">
      {/* チャットメインエリア */}
      <div className="flex-1 flex flex-col bg-[rgba(13,15,18,0.9)] border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between">
          <div className="text-[0.8rem] text-dim">
            {joined ? "接続中 - GARAGE HUNT v2" : "接続準備中"}
          </div>
          <div className="text-[0.7rem] text-[rgba(255,255,255,0.5)]">
            参加者: {participantIds.length}
          </div>
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
      <div className="w-full md:w-64 flex flex-col gap-3">
        <div
          className="flex-1 bg-[rgba(13,15,18,0.9)] border border-[rgba(255,255,255,0.08)] rounded-xl flex items-center justify-center text-[0.8rem] text-[rgba(255,255,255,0.8)] cursor-pointer overflow-hidden"
          onClick={() => {
            if (activeScreen) setShowShareOverlay(true);
          }}
        >
          {!activeScreen && (
            <div className="text-center px-4">
              <p className="mb-1">画面共有プレビュー</p>
              <p className="text-[0.7rem] text-[rgba(255,255,255,0.45)]">
                いまは共有されていません。百面惣が画面共有を始めるとここに映像が出ます。
              </p>
            </div>
          )}
          {activeScreen && (
            <video
              ref={(el) => {
                if (!el || !activeScreen) return;
                // Dailyのトラックをプレビュー用videoにアタッチ
                // @ts-ignore - daily-js型定義への依存を避ける
                const videoState = activeScreen?.video as { persistentTrack?: { mediaStream?: MediaStream } } | undefined;
                const mediaStream = videoState?.persistentTrack?.mediaStream;
                if (mediaStream && el.srcObject !== mediaStream) {
                  el.srcObject = mediaStream;
                  el.play().catch(() => {});
                }
              }}
              muted
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="bg-[rgba(13,15,18,0.9)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 space-y-2 text-[0.8rem] text-dim">
          <div className="flex items-center justify-between">
            <span>マイク</span>
            <button
              type="button"
              onClick={handleToggleMute}
              className="px-3 py-1 rounded-full border border-[rgba(255,255,255,0.25)] hover:bg-[rgba(255,255,255,0.06)]"
            >
              切り替え
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
            <video
              ref={(el) => {
                if (!el || !activeScreen) return;
                // @ts-ignore
                const videoState = activeScreen?.video as { persistentTrack?: { mediaStream?: MediaStream } } | undefined;
                const mediaStream = videoState?.persistentTrack?.mediaStream;
                if (mediaStream && el.srcObject !== mediaStream) {
                  el.srcObject = mediaStream;
                  el.play().catch(() => {});
                }
              }}
              muted
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

