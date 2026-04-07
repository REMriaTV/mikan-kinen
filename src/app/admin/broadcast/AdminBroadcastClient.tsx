"use client";

import React, { useEffect, useMemo, useState } from "react";
import AdminNav from "@/components/AdminNav";
import type {
  BroadcastConfig,
  MinogashiCtaVariant,
  ProgramItem,
} from "@/lib/broadcast-config";
import {
  defaultBroadcastConfig,
  epochMsToJstDateTimeLocal,
  extractYoutubeVideoId,
  formatMinogashiBannerLinkText,
  formatMinogashiHeroBadgeText,
  jstDateTimeLocalToEpochMs,
} from "@/lib/broadcast-config";

type Props = {
  token: string;
};

function toProgramItems(input: ProgramItem[]): ProgramItem[] {
  const items = Array.isArray(input) ? input : [];
  const fixed = new Array(4).fill(null).map((_, idx) => {
    const it = items[idx];
    return {
      title: typeof it?.title === "string" ? it.title : `Program ${idx + 1}`,
      desc: typeof it?.desc === "string" ? it.desc : "",
    };
  });
  return fixed.slice(0, 4);
}

export default function AdminBroadcastClient({ token }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearingChat, setClearingChat] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [config, setConfig] = useState<BroadcastConfig>(defaultBroadcastConfig);

  const [startJst, setStartJst] = useState<string>(
    epochMsToJstDateTimeLocal(defaultBroadcastConfig.countdown.targetEpochMs)
  );
  const [unlockJst, setUnlockJst] = useState<string>(
    epochMsToJstDateTimeLocal(defaultBroadcastConfig.garageV2.unlockEpochMs)
  );
  const [closeJst, setCloseJst] = useState<string>(
    epochMsToJstDateTimeLocal(defaultBroadcastConfig.garageV2.closeEpochMs)
  );

  const [broadcastLabel, setBroadcastLabel] = useState<string>(
    defaultBroadcastConfig.countdown.broadcastLabel
  );
  const [eventDate, setEventDate] = useState<string>(
    defaultBroadcastConfig.countdown.eventDate
  );
  const [eventTagline, setEventTagline] = useState<string>(
    defaultBroadcastConfig.countdown.eventTagline
  );

  const [remChatLabelBefore, setRemChatLabelBefore] = useState<string>(
    defaultBroadcastConfig.countdown.remChatLabelBefore
  );
  const [remChatLabelAfter, setRemChatLabelAfter] = useState<string>(
    defaultBroadcastConfig.countdown.remChatLabelAfter
  );
  const [remChatNoteBefore, setRemChatNoteBefore] = useState<string>(
    defaultBroadcastConfig.countdown.remChatNoteBefore
  );
  const [remChatNoteAfter, setRemChatNoteAfter] = useState<string>(
    defaultBroadcastConfig.countdown.remChatNoteAfter
  );

  const [colorNetworkTitle, setColorNetworkTitle] = useState<string>(
    defaultBroadcastConfig.colorBar.networkTitle
  );
  const [colorSleepingText, setColorSleepingText] = useState<string>(
    defaultBroadcastConfig.colorBar.sleepingText
  );
  const [colorNextText, setColorNextText] = useState<string>(
    defaultBroadcastConfig.colorBar.nextText
  );
  const [wakeText, setWakeText] = useState<string>(
    defaultBroadcastConfig.colorBar.wakeText
  );

  const [heroDateBadge, setHeroDateBadge] = useState<string>(
    defaultBroadcastConfig.topPage.heroDateBadge
  );
  const [heroDateLine, setHeroDateLine] = useState<string>(
    defaultBroadcastConfig.topPage.heroDateLine
  );
  const [joinDateLine, setJoinDateLine] = useState<string>(
    defaultBroadcastConfig.topPage.joinDateLine
  );

  const [minogashiVisible, setMinogashiVisible] = useState<boolean>(
    defaultBroadcastConfig.topPage.minogashiVisible
  );
  const [minogashiLabel, setMinogashiLabel] = useState<string>(
    defaultBroadcastConfig.topPage.minogashiLabel
  );
  const [minogashiTitle, setMinogashiTitle] = useState<string>(
    defaultBroadcastConfig.topPage.minogashiTitle
  );
  const [minogashiDate, setMinogashiDate] = useState<string>(
    defaultBroadcastConfig.topPage.minogashiDate
  );
  const [minogashiYoutubeUrl, setMinogashiYoutubeUrl] = useState<string>(
    defaultBroadcastConfig.topPage.minogashiYoutubeUrl
  );
  const [minogashiYoutubeId, setMinogashiYoutubeId] = useState<string>(
    defaultBroadcastConfig.topPage.minogashiYoutubeId
  );
  const [minogashiDescription, setMinogashiDescription] = useState<string>(
    defaultBroadcastConfig.topPage.minogashiDescription
  );
  const [minogashiHeroBadgeLead, setMinogashiHeroBadgeLead] = useState<string>(
    defaultBroadcastConfig.topPage.minogashiHeroBadgeLead
  );
  const [minogashiCtaVariant, setMinogashiCtaVariant] =
    useState<MinogashiCtaVariant>(
      defaultBroadcastConfig.topPage.minogashiCtaVariant
    );

  const [nemumiVisible, setNemumiVisible] = useState<boolean>(
    defaultBroadcastConfig.nemumi.visible
  );
  const [nemumiLabel, setNemumiLabel] = useState<string>(
    defaultBroadcastConfig.nemumi.label
  );
  const [nemumiDate, setNemumiDate] = useState<string>(
    defaultBroadcastConfig.nemumi.date
  );
  const [nemumiNoteBefore, setNemumiNoteBefore] = useState<string>(
    defaultBroadcastConfig.nemumi.noteBefore
  );
  const [nemumiNoteAfter, setNemumiNoteAfter] = useState<string>(
    defaultBroadcastConfig.nemumi.noteAfter
  );
  const [nemumiUnlockJst, setNemumiUnlockJst] = useState<string>(
    epochMsToJstDateTimeLocal(defaultBroadcastConfig.nemumi.unlockEpochMs)
  );
  const [nemumiCloseJst, setNemumiCloseJst] = useState<string>(
    epochMsToJstDateTimeLocal(defaultBroadcastConfig.nemumi.closeEpochMs)
  );

  const [programItems, setProgramItems] = useState<ProgramItem[]>(
    defaultBroadcastConfig.programItems
  );

  const derivedCountdownConfig = useMemo(() => {
    return {
      ...config.countdown,
      broadcastLabel,
      eventDate,
      eventTagline,
      remChatLabelBefore,
      remChatLabelAfter,
      remChatNoteBefore,
      remChatNoteAfter,
      targetEpochMs: jstDateTimeLocalToEpochMs(startJst),
    };
  }, [
    config.countdown,
    broadcastLabel,
    eventDate,
    eventTagline,
    remChatLabelBefore,
    remChatLabelAfter,
    remChatNoteBefore,
    remChatNoteAfter,
    startJst,
  ]);

  const derivedColorBarConfig = useMemo(() => {
    return {
      ...config.colorBar,
      networkTitle: colorNetworkTitle,
      sleepingText: colorSleepingText,
      nextText: colorNextText,
      wakeText,
    };
  }, [
    config.colorBar,
    colorNetworkTitle,
    colorSleepingText,
    colorNextText,
    wakeText,
  ]);

  const derivedGarageV2Config = useMemo(() => {
    return {
      ...config.garageV2,
      unlockEpochMs: jstDateTimeLocalToEpochMs(unlockJst),
      closeEpochMs: jstDateTimeLocalToEpochMs(closeJst),
    };
  }, [config.garageV2, unlockJst, closeJst]);

  const derivedNemumiConfig = useMemo(() => {
    return {
      ...config.nemumi,
      visible: nemumiVisible,
      label: nemumiLabel,
      date: nemumiDate,
      noteBefore: nemumiNoteBefore,
      noteAfter: nemumiNoteAfter,
      unlockEpochMs: jstDateTimeLocalToEpochMs(nemumiUnlockJst),
      closeEpochMs: jstDateTimeLocalToEpochMs(nemumiCloseJst),
    };
  }, [
    config.nemumi,
    nemumiVisible,
    nemumiLabel,
    nemumiDate,
    nemumiNoteBefore,
    nemumiNoteAfter,
    nemumiUnlockJst,
    nemumiCloseJst,
  ]);

  const derivedTopPageConfig = useMemo(() => {
    return {
      ...config.topPage,
      heroDateBadge,
      heroDateLine,
      joinDateLine,
      minogashiVisible,
      minogashiLabel,
      minogashiTitle,
      minogashiDate,
      minogashiYoutubeUrl,
      minogashiYoutubeId,
      minogashiDescription,
      minogashiHeroBadgeLead,
      minogashiCtaVariant,
    };
  }, [
    config.topPage,
    heroDateBadge,
    heroDateLine,
    joinDateLine,
    minogashiVisible,
    minogashiLabel,
    minogashiTitle,
    minogashiDate,
    minogashiYoutubeUrl,
    minogashiYoutubeId,
    minogashiDescription,
    minogashiHeroBadgeLead,
    minogashiCtaVariant,
  ]);

  const minogashiHeroBadgePreview = useMemo(
    () => formatMinogashiHeroBadgeText(minogashiHeroBadgeLead, minogashiTitle),
    [minogashiHeroBadgeLead, minogashiTitle]
  );
  const minogashiBannerLinkPreview = useMemo(
    () => formatMinogashiBannerLinkText(minogashiHeroBadgeLead),
    [minogashiHeroBadgeLead]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const res = await fetch("/api/broadcast-config", {
          method: "GET",
          headers: { Accept: "application/json" },
        });
        const json = (await res.json()) as { config?: BroadcastConfig };
        const loaded = json.config ?? defaultBroadcastConfig;
        if (cancelled) return;
        setConfig(loaded);

        setStartJst(epochMsToJstDateTimeLocal(loaded.countdown.targetEpochMs));
        setUnlockJst(epochMsToJstDateTimeLocal(loaded.garageV2.unlockEpochMs));
        setCloseJst(epochMsToJstDateTimeLocal(loaded.garageV2.closeEpochMs));

        setNemumiVisible(loaded.nemumi.visible);
        setNemumiLabel(loaded.nemumi.label);
        setNemumiDate(loaded.nemumi.date);
        setNemumiNoteBefore(loaded.nemumi.noteBefore);
        setNemumiNoteAfter(loaded.nemumi.noteAfter);
        setNemumiUnlockJst(epochMsToJstDateTimeLocal(loaded.nemumi.unlockEpochMs));
        setNemumiCloseJst(epochMsToJstDateTimeLocal(loaded.nemumi.closeEpochMs));

        setBroadcastLabel(loaded.countdown.broadcastLabel);
        setEventDate(loaded.countdown.eventDate);
        setEventTagline(loaded.countdown.eventTagline);

        setRemChatLabelBefore(loaded.countdown.remChatLabelBefore);
        setRemChatLabelAfter(loaded.countdown.remChatLabelAfter);
        setRemChatNoteBefore(loaded.countdown.remChatNoteBefore);
        setRemChatNoteAfter(loaded.countdown.remChatNoteAfter);

        setColorNetworkTitle(loaded.colorBar.networkTitle);
        setColorSleepingText(loaded.colorBar.sleepingText);
        setColorNextText(loaded.colorBar.nextText);
        setWakeText(loaded.colorBar.wakeText);

        setHeroDateBadge(loaded.topPage.heroDateBadge);
        setHeroDateLine(loaded.topPage.heroDateLine);
        setJoinDateLine(loaded.topPage.joinDateLine);

        setMinogashiVisible(loaded.topPage.minogashiVisible);
        setMinogashiLabel(loaded.topPage.minogashiLabel);
        setMinogashiTitle(loaded.topPage.minogashiTitle);
        setMinogashiDate(loaded.topPage.minogashiDate);
        setMinogashiYoutubeUrl(loaded.topPage.minogashiYoutubeUrl);
        setMinogashiYoutubeId(loaded.topPage.minogashiYoutubeId);
        setMinogashiDescription(loaded.topPage.minogashiDescription);
        setMinogashiHeroBadgeLead(loaded.topPage.minogashiHeroBadgeLead);
        setMinogashiCtaVariant(loaded.topPage.minogashiCtaVariant);

        setProgramItems(toProgramItems(loaded.programItems));
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const nextConfig: BroadcastConfig = {
        version: config.version ?? defaultBroadcastConfig.version,
        countdown: derivedCountdownConfig,
        colorBar: derivedColorBarConfig,
        garageV2: derivedGarageV2Config,
        nemumi: derivedNemumiConfig,
        topPage: derivedTopPageConfig,
        programItems: toProgramItems(programItems),
      };

      const res = await fetch("/api/admin/broadcast-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, config: nextConfig }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        config?: BroadcastConfig;
      };
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to save");
      }
      setSuccess("保存しました。表示側はリロードで反映されます。");
      const saved = (json.config ?? nextConfig) as BroadcastConfig;
      setConfig(saved);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleClearGarageChat() {
    if (
      !window.confirm(
        "REM Chat（garage-room）のサーバー上のテキストログをすべて削除します。取り消せません。よろしいですか？"
      )
    ) {
      return;
    }
    setClearingChat(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/garage-chat/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "クリアに失敗しました");
      }
      setSuccess(
        "REM Chat のサーバーログをクリアしました。入室中の参加者はページを再読み込みすると空の状態からになります。"
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setClearingChat(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0D0F12] text-[#E8E4DF] px-6 py-10">
      <div className="max-w-[900px] mx-auto">
        <AdminNav token={token} current="broadcast" />
        <h1 className="text-[1.2rem] font-bold mb-6">Broadcast Admin</h1>

        {error && (
          <div className="mb-4 rounded border border-red-500 bg-red-950/30 p-3 text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded border border-green-500 bg-green-950/30 p-3 text-green-200">
            {success}
          </div>
        )}

        {loading ? (
          <div className="opacity-80">loading...</div>
        ) : (
          <>
            <div className="space-y-8">
              <section className="rounded border border-[rgba(255,255,255,0.08)] p-5 bg-[rgba(255,255,255,0.02)]">
                <h2 className="text-[1rem] font-semibold mb-4">Times (JST)</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="block">
                    <div className="text-[0.85rem] opacity-80 mb-1">
                      Countdown target (開局時刻)
                    </div>
                    <input
                      className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                      type="datetime-local"
                      value={startJst}
                      onChange={(e) => setStartJst(e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <div className="text-[0.85rem] opacity-80 mb-1">
                      Color bar unlock (5分前)
                    </div>
                    <input
                      className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                      type="datetime-local"
                      value={unlockJst}
                      onChange={(e) => setUnlockJst(e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <div className="text-[0.85rem] opacity-80 mb-1">
                      Close (終了/強制クローズ)
                    </div>
                    <input
                      className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                      type="datetime-local"
                      value={closeJst}
                      onChange={(e) => setCloseJst(e.target.value)}
                    />
                  </label>
                </div>
              </section>

              <section className="rounded border border-[rgba(224,90,51,0.2)] p-5 bg-[rgba(224,90,51,0.04)]">
                <h2 className="text-[1rem] font-semibold mb-2">ねむみ放送（/nemumi-v2）</h2>
                <p className="text-[0.8rem] opacity-75 mb-4 leading-relaxed">
                  トップの導線表示・ねむみ部屋の解錠/終了時刻。合言葉は環境変数{" "}
                  <code className="text-[0.75rem]">NEMUMI_V2_PASSPHRASE</code> で設定します。
                </p>
                <label className="flex items-center gap-2 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border border-[rgba(255,255,255,0.2)]"
                    checked={nemumiVisible}
                    onChange={(e) => setNemumiVisible(e.target.checked)}
                  />
                  <span className="text-[0.9rem]">トップにねむみボタンを表示（nemumi_visible）</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <div className="text-[0.85rem] opacity-80 mb-1">nemumi_label</div>
                    <input
                      className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                      value={nemumiLabel}
                      onChange={(e) => setNemumiLabel(e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <div className="text-[0.85rem] opacity-80 mb-1">nemumi_date（補助テキスト）</div>
                    <input
                      className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                      value={nemumiDate}
                      onChange={(e) => setNemumiDate(e.target.value)}
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <div className="text-[0.85rem] opacity-80 mb-1">nemumi_note_before（待機）</div>
                    <input
                      className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                      value={nemumiNoteBefore}
                      onChange={(e) => setNemumiNoteBefore(e.target.value)}
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <div className="text-[0.85rem] opacity-80 mb-1">nemumi_note_after（終了後）</div>
                    <input
                      className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                      value={nemumiNoteAfter}
                      onChange={(e) => setNemumiNoteAfter(e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <div className="text-[0.85rem] opacity-80 mb-1">ねむみ 解錠（JST）</div>
                    <input
                      className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                      type="datetime-local"
                      value={nemumiUnlockJst}
                      onChange={(e) => setNemumiUnlockJst(e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <div className="text-[0.85rem] opacity-80 mb-1">ねむみ 終了（JST）</div>
                    <input
                      className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                      type="datetime-local"
                      value={nemumiCloseJst}
                      onChange={(e) => setNemumiCloseJst(e.target.value)}
                    />
                  </label>
                </div>
              </section>

              <section className="rounded border border-[rgba(255,255,255,0.08)] p-5 bg-[rgba(255,255,255,0.02)]">
                <h2 className="text-[1rem] font-semibold mb-4">Top Banner</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <div className="text-[0.85rem] opacity-80 mb-1">BROADCAST_LABEL</div>
                    <input
                      className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                      value={broadcastLabel}
                      onChange={(e) => setBroadcastLabel(e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <div className="text-[0.85rem] opacity-80 mb-1">eventDate</div>
                    <input
                      className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <div className="text-[0.85rem] opacity-80 mb-1">eventTagline</div>
                    <input
                      className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                      value={eventTagline}
                      onChange={(e) => setEventTagline(e.target.value)}
                    />
                  </label>
                  <div />

                  <label className="block">
                    <div className="text-[0.85rem] opacity-80 mb-1">REM Chat (before)</div>
                    <input
                      className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                      value={remChatLabelBefore}
                      onChange={(e) => setRemChatLabelBefore(e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <div className="text-[0.85rem] opacity-80 mb-1">REM Chat (after)</div>
                    <input
                      className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                      value={remChatLabelAfter}
                      onChange={(e) => setRemChatLabelAfter(e.target.value)}
                    />
                  </label>

                  <label className="block">
                    <div className="text-[0.85rem] opacity-80 mb-1">Note (before)</div>
                    <input
                      className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                      value={remChatNoteBefore}
                      onChange={(e) => setRemChatNoteBefore(e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <div className="text-[0.85rem] opacity-80 mb-1">Note (after)</div>
                    <input
                      className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                      value={remChatNoteAfter}
                      onChange={(e) => setRemChatNoteAfter(e.target.value)}
                    />
                  </label>
                </div>
              </section>

              <section className="rounded border border-[rgba(255,255,255,0.08)] p-5 bg-[rgba(255,255,255,0.02)]">
                <h2 className="text-[1rem] font-semibold mb-4">Color Bar Screen</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <div className="text-[0.85rem] opacity-80 mb-1">networkTitle</div>
                    <input
                      className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                      value={colorNetworkTitle}
                      onChange={(e) => setColorNetworkTitle(e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <div className="text-[0.85rem] opacity-80 mb-1">wakeText</div>
                    <input
                      className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                      value={wakeText}
                      onChange={(e) => setWakeText(e.target.value)}
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <div className="text-[0.85rem] opacity-80 mb-1">sleepingText</div>
                    <input
                      className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                      value={colorSleepingText}
                      onChange={(e) => setColorSleepingText(e.target.value)}
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <div className="text-[0.85rem] opacity-80 mb-1">nextText</div>
                    <input
                      className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                      value={colorNextText}
                      onChange={(e) => setColorNextText(e.target.value)}
                    />
                  </label>
                </div>
              </section>

              <section className="rounded border border-[rgba(255,255,255,0.08)] p-5 bg-[rgba(255,255,255,0.02)]">
                <h2 className="text-[1rem] font-semibold mb-4">Top Page Dates</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <div className="text-[0.85rem] opacity-80 mb-1">heroDateBadge</div>
                    <input
                      className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                      value={heroDateBadge}
                      onChange={(e) => setHeroDateBadge(e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <div className="text-[0.85rem] opacity-80 mb-1">heroDateLine</div>
                    <input
                      className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                      value={heroDateLine}
                      onChange={(e) => setHeroDateLine(e.target.value)}
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <div className="text-[0.85rem] opacity-80 mb-1">joinDateLine</div>
                    <input
                      className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                      value={joinDateLine}
                      onChange={(e) => setJoinDateLine(e.target.value)}
                    />
                  </label>
                </div>
              </section>

              <section className="rounded border border-[rgba(255,255,255,0.08)] p-5 bg-[rgba(255,255,255,0.02)]">
                <h2 className="text-[1rem] font-semibold mb-4">
                  見逃し配信（トップ・ヒーロー直下）
                </h2>
                <p className="text-[0.85rem] opacity-75 mb-4 leading-relaxed">
                  表示を切るときは「セクションを表示する」のチェックを外します。YouTube
                  の URL または動画 ID のどちらかが分かれば表示できます（保存時に正規化されます）。
                </p>
                <label className="flex items-center gap-2 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border border-[rgba(255,255,255,0.2)]"
                    checked={minogashiVisible}
                    onChange={(e) => setMinogashiVisible(e.target.checked)}
                  />
                  <span className="text-[0.9rem]">セクションを表示する（minogashi_visible）</span>
                </label>
                <fieldset className="mb-4 rounded border border-[rgba(255,255,255,0.08)] p-4 space-y-2">
                  <legend className="text-[0.85rem] opacity-90 px-1 mb-1">
                    ファーストビュー導線（minogashi_cta_variant）
                  </legend>
                  <p className="text-[0.75rem] opacity-65 leading-relaxed mb-2">
                    コード変更なしで A / B を切り替えられます。左の文は下記「導線の左文」で共通編集。
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="minogashiCtaVariant"
                      className="h-4 w-4"
                      checked={minogashiCtaVariant === "A"}
                      onChange={() => setMinogashiCtaVariant("A")}
                    />
                    <span className="text-[0.88rem]">
                      案A — カウントダウンバナー内（REM Chat の下の小リンク）
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="minogashiCtaVariant"
                      className="h-4 w-4"
                      checked={minogashiCtaVariant === "B"}
                      onChange={() => setMinogashiCtaVariant("B")}
                    />
                    <span className="text-[0.88rem]">
                      案B — ヒーロー内ピル（ONLINE/無料の下）
                    </span>
                  </label>
                  <div className="text-[0.72rem] opacity-65 font-mono pt-1 space-y-0.5">
                    <div>バナー（A）: {minogashiBannerLinkPreview}</div>
                    <div>ピル（B）: {minogashiHeroBadgePreview}</div>
                  </div>
                </fieldset>
                <label className="block mb-4">
                  <div className="text-[0.85rem] opacity-80 mb-1">
                    導線の左文（minogashi_hero_badge_lead）
                  </div>
                  <p className="text-[0.75rem] opacity-65 mb-2 leading-relaxed">
                    案A は「▶ 左の文 ↓」、案B は「▶ 左の文 — minogashi_title」。見逃しブロック見出しの
                    minogashi_label とは別です。
                  </p>
                  <input
                    className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                    value={minogashiHeroBadgeLead}
                    onChange={(e) => setMinogashiHeroBadgeLead(e.target.value)}
                  />
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <div className="text-[0.85rem] opacity-80 mb-1">minogashi_label</div>
                    <input
                      className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                      value={minogashiLabel}
                      onChange={(e) => setMinogashiLabel(e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <div className="text-[0.85rem] opacity-80 mb-1">minogashi_title</div>
                    <input
                      className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                      value={minogashiTitle}
                      onChange={(e) => setMinogashiTitle(e.target.value)}
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <div className="text-[0.85rem] opacity-80 mb-1">minogashi_date</div>
                    <input
                      className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                      value={minogashiDate}
                      onChange={(e) => setMinogashiDate(e.target.value)}
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <div className="text-[0.85rem] opacity-80 mb-1">
                      minogashi_youtube_url
                    </div>
                    <input
                      className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                      value={minogashiYoutubeUrl}
                      onChange={(e) => {
                        const v = e.target.value;
                        setMinogashiYoutubeUrl(v);
                        const id = extractYoutubeVideoId(v);
                        if (id) setMinogashiYoutubeId(id);
                      }}
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <div className="text-[0.85rem] opacity-80 mb-1">
                      minogashi_youtube_id（自動でも可）
                    </div>
                    <input
                      className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2 font-mono text-[0.9rem]"
                      value={minogashiYoutubeId}
                      onChange={(e) => setMinogashiYoutubeId(e.target.value)}
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <div className="text-[0.85rem] opacity-80 mb-1">
                      minogashi_description（任意）
                    </div>
                    <textarea
                      className="w-full min-h-[72px] rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                      value={minogashiDescription}
                      onChange={(e) => setMinogashiDescription(e.target.value)}
                    />
                  </label>
                </div>
              </section>

              <section className="rounded border border-[rgba(255,255,255,0.08)] p-5 bg-[rgba(255,255,255,0.02)]">
                <h2 className="text-[1rem] font-semibold mb-4">Program (4 items)</h2>
                <div className="space-y-6">
                  {programItems.map((it, idx) => (
                    <div
                      key={idx}
                      className="rounded border border-[rgba(255,255,255,0.08)] p-4 bg-[rgba(0,0,0,0.15)]"
                    >
                      <div className="text-[0.9rem] opacity-80 mb-3">
                        Item {String(idx + 1).padStart(2, "0")}
                      </div>
                      <label className="block mb-3">
                        <div className="text-[0.85rem] opacity-80 mb-1">
                          title
                        </div>
                        <input
                          className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                          value={it.title}
                          onChange={(e) => {
                            const next = [...programItems];
                            next[idx] = { ...next[idx], title: e.target.value };
                            setProgramItems(next);
                          }}
                        />
                      </label>
                      <label className="block">
                        <div className="text-[0.85rem] opacity-80 mb-1">
                          desc
                        </div>
                        <textarea
                          className="w-full min-h-[84px] rounded bg-[#151820] border border-[rgba(255,255,255,0.10)] px-3 py-2"
                          value={it.desc}
                          onChange={(e) => {
                            const next = [...programItems];
                            next[idx] = { ...next[idx], desc: e.target.value };
                            setProgramItems(next);
                          }}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded border border-amber-900/50 p-5 bg-[rgba(180,80,40,0.06)]">
                <h2 className="text-[1rem] font-semibold mb-2">REM Chat テキストログ</h2>
                <p className="text-[0.85rem] opacity-80 mb-4 leading-relaxed">
                  定期放送の前など、テスト投稿を残したくないときに、サーバーに保存されているチャット履歴をまとめて削除します（Supabase
                  の garage-room のみ）。削除後は、新しく入室した人から空の履歴で始まります。
                </p>
                <button
                  type="button"
                  disabled={clearingChat}
                  onClick={handleClearGarageChat}
                  className="px-4 py-2 rounded border border-amber-600/80 text-amber-100 hover:bg-amber-950/40 disabled:opacity-50"
                >
                  {clearingChat ? "削除中…" : "サーバー上の REM Chat ログをすべて削除"}
                </button>
              </section>

              <div className="flex items-center gap-3">
                <button
                  disabled={saving}
                  onClick={handleSave}
                  className="px-5 py-3 rounded bg-gold text-deep font-semibold disabled:opacity-60"
                >
                  {saving ? "saving..." : "Save"}
                </button>
                <div className="text-[0.85rem] opacity-70">
                  保存後はリロードで反映されます。
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

