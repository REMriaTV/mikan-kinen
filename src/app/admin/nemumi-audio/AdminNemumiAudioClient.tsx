"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminNav from "@/components/AdminNav";
import type { NemumiRegistryCategory } from "@/lib/nemumi-audio-registry";

type Props = {
  token: string;
};

type RegistryRow = {
  trackId: string;
  category: NemumiRegistryCategory;
  label: string;
  defaultPath: string;
  storagePath: string | null;
  publicUrl: string | null;
  updatedAt: string | null;
};

const TAB_LABELS: Record<NemumiRegistryCategory, string> = {
  se: "効果音",
  interactive: "インタラクティブ",
  bgm: "BGM",
  extra: "その他",
};

export default function AdminNemumiAudioClient({ token }: Props) {
  const [tab, setTab] = useState<NemumiRegistryCategory>("se");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registry, setRegistry] = useState<RegistryRow[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const r = await fetch(
        `/api/admin/nemumi-audio?token=${encodeURIComponent(token)}`,
        { cache: "no-store" }
      );
      const j = (await r.json()) as { ok?: boolean; registry?: RegistryRow[]; error?: string };
      if (!r.ok || !j.ok) {
        setError(j.error ?? "読み込みに失敗しました");
        return;
      }
      setRegistry(j.registry ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(
    () => registry.filter((row) => row.category === tab),
    [registry, tab]
  );

  const upload = async (trackId: string, file: File) => {
    setMessage(null);
    setError(null);
    setUploading(trackId);
    try {
      const fd = new FormData();
      fd.set("token", token);
      fd.set("trackId", trackId);
      fd.set("file", file);
      const r = await fetch("/api/admin/nemumi-audio/upload", {
        method: "POST",
        body: fd,
      });
      const j = (await r.json()) as { ok?: boolean; error?: string };
      if (!r.ok || !j.ok) {
        setError(j.error ?? "アップロードに失敗しました");
        return;
      }
      setMessage(`${trackId} を登録しました`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(null);
    }
  };

  const clear = async (trackId: string) => {
    if (!window.confirm(`${trackId} の Supabase 登録を削除し、デフォルトパスに戻しますか？`)) return;
    setMessage(null);
    setError(null);
    setUploading(trackId);
    try {
      const r = await fetch("/api/admin/nemumi-audio/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, trackId }),
      });
      const j = (await r.json()) as { ok?: boolean; error?: string };
      if (!r.ok || !j.ok) {
        setError(j.error ?? "削除に失敗しました");
        return;
      }
      setMessage(`${trackId} をクリアしました`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(null);
    }
  };

  const tabs: NemumiRegistryCategory[] = ["se", "interactive", "bgm", "extra"];

  return (
    <div className="min-h-[100dvh] bg-[#0D0F12] text-[#E8E4DF] px-6 py-10">
      <div className="max-w-[900px] mx-auto">
        <AdminNav token={token} current="nemumi-audio" />

        <h1 className="text-[1.2rem] font-bold mb-2">ねむみ音素材</h1>
        <p className="text-[0.82rem] text-[rgba(232,228,223,0.55)] mb-6 leading-relaxed">
          種類別に MP3 等をアップロードすると、Supabase Storage に保存され
          <code className="text-[0.75rem] mx-1">nemumi_audio_assets</code>
          に公開URLが登録されます。ねむみ放送ページは
          <code className="text-[0.75rem] mx-1">/api/nemumi-audio</code>
          経由で参照します。
        </p>

        {error && (
          <div className="mb-4 rounded border border-red-500 bg-red-950/30 p-3 text-red-200 text-[0.9rem]">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 rounded border border-green-500 bg-green-950/30 p-3 text-green-200 text-[0.9rem]">
            {message}
          </div>
        )}

        {loading ? (
          <div className="opacity-80">loading...</div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
              {tabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={
                    "px-4 py-2 rounded-md text-[0.85rem] border transition-colors " +
                    (tab === t
                      ? "border-[rgba(224,90,51,0.55)] bg-[rgba(224,90,51,0.12)] text-[#E8E4DF]"
                      : "border-[rgba(255,255,255,0.1)] text-[rgba(232,228,223,0.65)] hover:border-[rgba(255,255,255,0.2)]")
                  }
                >
                  {TAB_LABELS[t]}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filtered.map((row) => (
                <div
                  key={row.trackId}
                  className="rounded border border-[rgba(255,255,255,0.08)] p-4 bg-[rgba(255,255,255,0.02)]"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                    <div>
                      <span className="font-semibold">{row.label}</span>
                      <span className="text-[0.72rem] text-[rgba(232,228,223,0.4)] ml-2">
                        id: {row.trackId}
                      </span>
                    </div>
                    {row.publicUrl ? (
                      <span className="text-[0.68rem] text-green-200/90">登録済み</span>
                    ) : (
                      <span className="text-[0.68rem] text-[rgba(232,228,223,0.4)]">未登録（ローカル既定）</span>
                    )}
                  </div>
                  <p className="text-[0.72rem] text-[rgba(232,228,223,0.45)] mb-2 break-all">
                    既定: {row.defaultPath}
                  </p>
                  {row.publicUrl ? (
                    <p className="text-[0.7rem] text-[rgba(232,228,223,0.55)] mb-3 break-all">
                      URL: {row.publicUrl}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="text-[0.78rem] cursor-pointer">
                      <span className="inline-block px-3 py-1.5 rounded border border-[rgba(224,90,51,0.4)] hover:bg-[rgba(224,90,51,0.1)]">
                        ファイルを選ぶ
                      </span>
                      <input
                        type="file"
                        accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,.mp3,.wav,.ogg"
                        className="hidden"
                        disabled={uploading === row.trackId}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (f) void upload(row.trackId, f);
                        }}
                      />
                    </label>
                    {row.publicUrl ? (
                      <button
                        type="button"
                        disabled={uploading === row.trackId}
                        onClick={() => void clear(row.trackId)}
                        className="text-[0.78rem] px-3 py-1.5 rounded border border-[rgba(255,255,255,0.15)] text-[rgba(232,228,223,0.65)] hover:bg-[rgba(255,255,255,0.05)]"
                      >
                        登録を削除
                      </button>
                    ) : null}
                    {uploading === row.trackId ? (
                      <span className="text-[0.72rem] text-[rgba(224,90,51,0.85)]">処理中…</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
