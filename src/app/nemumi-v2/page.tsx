"use client";

import React, { useEffect, useRef, useState } from "react";
import NemumiV2Client from "@/components/NemumiV2Client";
import NemumiColorBarScreen from "@/components/NemumiColorBarScreen";
import {
  defaultBroadcastConfig,
  type BroadcastConfig,
} from "@/lib/broadcast-config";

export default function NemumiV2Page() {
  const [cfg, setCfg] = useState<BroadcastConfig>(defaultBroadcastConfig);
  const cfgRef = useRef<BroadcastConfig>(cfg);
  const [viewMode, setViewMode] = useState<"pre" | "live" | "closed">("pre");

  useEffect(() => {
    cfgRef.current = cfg;
  }, [cfg]);

  useEffect(() => {
    let cancelled = false;

    const compute = (nowMs: number, c: BroadcastConfig) => {
      if (nowMs < c.nemumi.unlockEpochMs) return "pre" as const;
      if (nowMs >= c.nemumi.closeEpochMs) return "closed" as const;
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
        <NemumiColorBarScreen
          networkTitle={cfg.colorBar.networkTitle}
          sleepingText={cfg.nemumi.noteBefore}
          nextText={cfg.nemumi.date || cfg.colorBar.nextText}
          wakeText={cfg.colorBar.wakeText}
        />
      )}
      {viewMode === "live" && <NemumiV2Client />}
      {viewMode === "closed" && (
        <NemumiColorBarScreen
          networkTitle={cfg.colorBar.networkTitle}
          sleepingText="ねむみの波はしずかになりました"
          nextText={cfg.nemumi.noteAfter}
          wakeText={cfg.colorBar.wakeText}
        />
      )}
    </main>
  );
}
