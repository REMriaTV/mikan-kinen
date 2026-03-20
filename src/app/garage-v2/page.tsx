"use client";

import React, { useEffect, useState } from "react";
import GarageV2Client from "@/components/GarageV2Client";
import ColorBarScreen from "@/components/ColorBarScreen";

// 2026年3月20日 19:18:00 JST（開局5分前）= 2026-03-20T10:18:00Z
const UNLOCK_TIME_MS = Date.parse("2026-03-20T10:18:00Z");
// 2026年3月20日 20:53:00 JST（終了）= 2026-03-20T11:53:00Z
const CLOSE_TIME_MS = Date.parse("2026-03-20T11:53:00Z");

export default function GarageV2Page() {
  const [viewMode, setViewMode] = useState<"pre" | "live" | "closed">(() => {
    const now = Date.now();
    if (now < UNLOCK_TIME_MS) return "pre";
    if (now >= CLOSE_TIME_MS) return "closed";
    return "live";
  });

  useEffect(() => {
    const checkTime = () => {
      const now = Date.now();
      if (now < UNLOCK_TIME_MS) setViewMode("pre");
      else if (now >= CLOSE_TIME_MS) setViewMode("closed");
      else setViewMode("live");
    };
    checkTime();
    const interval = window.setInterval(checkTime, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className="relative min-h-[100dvh]">
      {viewMode === "pre" && <ColorBarScreen />}
      {viewMode === "live" && <GarageV2Client />}
      {viewMode === "closed" && (
        <>
          {/* 休止画面を即表示しつつ、裏側でDailyを強制クローズ */}
          <div className="absolute inset-0 opacity-0 pointer-events-none">
            <GarageV2Client shouldForceClose />
          </div>
          <ColorBarScreen />
        </>
      )}
    </main>
  );
}
