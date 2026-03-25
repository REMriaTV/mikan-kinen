"use client";

import React, { useEffect, useRef, useState } from "react";
import GarageV2Client from "@/components/GarageV2Client";
import ColorBarScreen from "@/components/ColorBarScreen";
import {
  defaultBroadcastConfig,
  type BroadcastConfig,
} from "@/lib/broadcast-config";

export default function GarageV2Page() {
  const [cfg, setCfg] = useState<BroadcastConfig>(defaultBroadcastConfig);
  const cfgRef = useRef<BroadcastConfig>(cfg);
  const [viewMode, setViewMode] = useState<"pre" | "live" | "closed">("pre");

  useEffect(() => {
    cfgRef.current = cfg;
  }, [cfg]);

  useEffect(() => {
    let cancelled = false;

    const compute = (nowMs: number, c: BroadcastConfig) => {
      if (nowMs < c.garageV2.unlockEpochMs) return "pre" as const;
      if (nowMs >= c.garageV2.closeEpochMs) return "closed" as const;
      return "live" as const;
    };

    (async () => {
      try {
        const res = await fetch("/api/broadcast-config", {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const json = (await res.json()) as { config?: BroadcastConfig };
        const loaded = json.config ?? defaultBroadcastConfig;
        if (cancelled) return;
        setCfg(loaded);
        cfgRef.current = loaded;
        setViewMode(compute(Date.now(), loaded));
      } catch {
        // フォールバック値のまま
        setViewMode(compute(Date.now(), cfgRef.current));
      }
    })();

    const interval = window.setInterval(() => {
      setViewMode(() => compute(Date.now(), cfgRef.current));
    }, 1000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <main className="relative min-h-[100dvh]">
      {viewMode === "pre" && (
        <ColorBarScreen
          networkTitle={cfg.colorBar.networkTitle}
          sleepingText={cfg.colorBar.sleepingText}
          nextText={cfg.colorBar.nextText}
          wakeText={cfg.colorBar.wakeText}
        />
      )}
      {viewMode === "live" && <GarageV2Client />}
      {viewMode === "closed" && (
        <>
          {/* 休止画面を即表示しつつ、裏側でDailyを強制クローズ */}
          <div className="absolute inset-0 opacity-0 pointer-events-none">
            <GarageV2Client shouldForceClose />
          </div>
          <ColorBarScreen
            networkTitle={cfg.colorBar.networkTitle}
            sleepingText={cfg.colorBar.sleepingText}
            nextText={cfg.colorBar.nextText}
            wakeText={cfg.colorBar.wakeText}
          />
        </>
      )}
    </main>
  );
}
