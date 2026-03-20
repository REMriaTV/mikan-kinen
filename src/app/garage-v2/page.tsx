"use client";

import React, { useEffect, useState } from "react";
import GarageV2Client from "@/components/GarageV2Client";
import ColorBarScreen from "@/components/ColorBarScreen";

// 2026年3月20日 19:18:00 JST（開局5分前）= 2026-03-20T10:18:00Z
const UNLOCK_TIME_MS = Date.parse("2026-03-20T10:18:00Z");

export default function GarageV2Page() {
  const [isBroadcastReady, setIsBroadcastReady] = useState(() => Date.now() >= UNLOCK_TIME_MS);

  useEffect(() => {
    const checkTime = () => {
      setIsBroadcastReady(Date.now() >= UNLOCK_TIME_MS);
    };
    checkTime();
    const interval = window.setInterval(checkTime, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className="min-h-[100dvh]">
      {!isBroadcastReady ? <ColorBarScreen /> : <GarageV2Client />}
    </main>
  );
}
