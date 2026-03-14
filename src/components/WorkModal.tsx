"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import { Work, timeSlotInfo, lunarPhaseInfo, hourSlotInfo } from "@/data/works";

interface WorkModalProps {
  work: Work;
  onClose: () => void;
}

export default function WorkModal({ work, onClose }: WorkModalProps) {
  // ESCキーで閉じる
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  // bodyスクロール無効化
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // 位置タグ用の情報を取得
  const getPositionTag = () => {
    if (!work.timeSlot || !work.hourSlot || !work.lunarPhase) return null;
    const slotInfo = timeSlotInfo[work.timeSlot];
    const hourInfo = hourSlotInfo[work.hourSlot];
    const phaseInfo = lunarPhaseInfo[work.lunarPhase];
    return `${slotInfo.name} — ${hourInfo.displayTime} / ${phaseInfo.name}`;
  };

  const positionTag = getPositionTag();

  return (
    <>
      {/* A. 暗幕オーバーレイ */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
        onClick={onClose}
      >
        {/* B. モーダル本体 */}
        <div
          className="relative w-[420px] max-w-[92%] overflow-hidden"
          style={{
            backgroundColor: "#0d0d1a",
            border: "0.5px solid rgba(255,255,255,0.15)",
            borderRadius: "12px",
            animation: "modalFadeIn 0.2s ease-out",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* C. バナーエリア */}
          <div className="relative h-[160px] overflow-hidden">
            {work.thumbnail ? (
              <img
                src={work.thumbnail}
                alt={work.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #1a1a3a 0%, #0d2a2a 50%, #1a1a2e 100%)",
                }}
              >
                <span
                  className="font-shippori text-center px-4"
                  style={{
                    opacity: 0.1,
                    fontSize: "40px",
                    letterSpacing: "0.2em",
                    color: "#fff",
                  }}
                >
                  {work.title}
                </span>
              </div>
            )}

            {/* 下端グラデーション */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[60px]"
              style={{
                background: "linear-gradient(to top, #0d0d1a, transparent)",
              }}
            />

            {/* 左上: 位置タグ */}
            {positionTag && (
              <div
                className="absolute top-3 left-3"
                style={{
                  background: "rgba(0,0,0,0.35)",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                {positionTag}
              </div>
            )}

            {/* 右上: 閉じるボタン */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{
                background: "rgba(0,0,0,0.4)",
                color: "rgba(255,255,255,0.5)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0,0,0,0.4)";
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 1L13 13M13 1L1 13" />
              </svg>
            </button>
          </div>

          {/* D. タイトルセクション */}
          <div style={{ padding: "1rem 1.5rem 0.5rem" }}>
            <h2
              className="font-shippori"
              style={{
                fontSize: "20px",
                fontWeight: 500,
                color: "#f0e6d3",
              }}
            >
              {work.title}
            </h2>
            <div
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.4)",
                marginTop: "4px",
              }}
            >
              {work.debut} / {work.format}
            </div>
          </div>

          {/* E. コメントセクション */}
          {work.comment && (
            <div style={{ padding: "0.75rem 1.5rem 1rem" }}>
              <p
                style={{
                  fontSize: "14px",
                  lineHeight: 1.8,
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                {work.comment}
              </p>
            </div>
          )}

          {/* F. リンクセクション */}
          <div
            style={{
              padding: "0 1.5rem 1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {/* 制作ノート・プロットを見る */}
            {work.driveUrl && (
              <a
                href={work.driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between transition-colors"
                style={{
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.04)",
                  border: "0.5px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: "14px" }}>&#128194;</span>
                  <span
                    style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}
                  >
                    制作ノート・プロットを見る
                  </span>
                </div>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>&rarr;</span>
              </a>
            )}

            {/* 作品の詳細ページへ */}
            <Link
              href={`/works/${work.slug}`}
              className="flex items-center justify-between transition-colors"
              style={{
                padding: "10px 14px",
                background: "rgba(255,255,255,0.04)",
                border: "0.5px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              }}
            >
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "14px" }}>&#128214;</span>
                <span
                  style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}
                >
                  作品の詳細ページへ
                </span>
              </div>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>&rarr;</span>
            </Link>
          </div>

          {/* G. フッター */}
          <div
            style={{
              borderTop: "0.5px solid rgba(255,255,255,0.06)",
              textAlign: "center",
              padding: "8px 1.5rem 12px",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                color: "rgba(255,255,255,0.2)",
                letterSpacing: "0.1em",
              }}
            >
              レムリアテレビ意識波息株式会社
            </span>
          </div>
        </div>
      </div>

      {/* アニメーション用CSS */}
      <style jsx global>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
