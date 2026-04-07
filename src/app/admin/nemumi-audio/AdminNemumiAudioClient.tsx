"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminNav from "@/components/AdminNav";
import type { NemumiRegistryCategory } from "@/lib/nemumi-audio-registry";

type Props = {
  token: string;
};

type AdminRegistryRow = {
  trackId: string;
  category: NemumiRegistryCategory;
  label: string;
  defaultPath: string;
  sortOrder: number;
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

const CATEGORIES: NemumiRegistryCategory[] = ["bgm", "se", "interactive", "extra"];

export default function AdminNemumiAudioClient({ token }: Props) {
  const [tab, setTab] = useState<NemumiRegistryCategory>("se");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registry, setRegistry] = useState<AdminRegistryRow[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [newTrackId, setNewTrackId] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newCategory, setNewCategory] = useState<NemumiRegistryCategory>("se");
  const [newSort, setNewSort] = useState(0);

  const [editLabel, setEditLabel] = useState<Record<string, string>>({});
  const [editCategory, setEditCategory] = useState<Record<string, NemumiRegistryCategory>>({});
  const [editSort, setEditSort] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const r = await fetch(
        `/api/admin/nemumi-audio?token=${encodeURIComponent(token)}`,
        { cache: "no-store" }
      );
      const j = (await r.json()) as {
        ok?: boolean;
        registry?: AdminRegistryRow[];
        error?: string;
      };
      if (!r.ok || !j.ok) {
        setError(j.error ?? "読み込みに失敗しました");
        return;
      }
      setRegistry(j.registry ?? []);
      const el: Record<string, string> = {};
      const ec: Record<string, NemumiRegistryCategory> = {};
      const es: Record<string, number> = {};
      for (const row of j.registry ?? []) {
        el[row.trackId] = row.label;
        ec[row.trackId] = row.category;
        es[row.trackId] = row.sortOrder;
      }
      setEditLabel(el);
      setEditCategory(ec);
      setEditSort(es);
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

  const addTrack = async () => {
    setMessage(null);
    setError(null);
    setUploading("new");
    try {
      const r = await fetch("/api/admin/nemumi-audio/tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          trackId: newTrackId.trim(),
          category: newCategory,
          label: newLabel.trim(),
          sort_order: newSort,
        }),
      });
      const j = (await r.json()) as { ok?: boolean; error?: string };
      if (!r.ok || !j.ok) {
        setError(j.error ?? "追加に失敗しました");
        return;
      }
      setMessage(`素材「${newTrackId.trim()}」を追加しました`);
      setNewTrackId("");
      setNewLabel("");
      setNewSort(0);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(null);
    }
  };

  const saveTrack = async (trackId: string) => {
    setMessage(null);
    setError(null);
    setUploading(trackId);
    try {
      const r = await fetch(`/api/admin/nemumi-audio/tracks/${encodeURIComponent(trackId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          label: editLabel[trackId],
          category: editCategory[trackId],
          sort_order: editSort[trackId],
        }),
      });
      const j = (await r.json()) as { ok?: boolean; error?: string };
      if (!r.ok || !j.ok) {
        setError(j.error ?? "保存に失敗しました");
        return;
      }
      setMessage(`「${trackId}」を更新しました`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(null);
    }
  };

  const deleteTrack = async (trackId: string) => {
    if (
      !window.confirm(
        `「${trackId}」を削除しますか？（アップロード済みファイルも削除されます。チャルメラなど既定素材も削除できます）`
      )
    )
      return;
    setMessage(null);
    setError(null);
    setUploading(trackId);
    try {
      const r = await fetch(
        `/api/admin/nemumi-audio/tracks/${encodeURIComponent(trackId)}?token=${encodeURIComponent(token)}`,
        { method: "DELETE" }
      );
      const j = (await r.json()) as { ok?: boolean; error?: string };
      if (!r.ok || !j.ok) {
        setError(j.error ?? "削除に失敗しました");
        return;
      }
      setMessage(`「${trackId}」を削除しました`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(null);
    }
  };

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
      setMessage(`「${trackId}」の音源を登録しました`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(null);
    }
  };

  const clear = async (trackId: string) => {
    if (!window.confirm(`${trackId} の Supabase 上の音源URLを削除し、既定パスに戻しますか？`)) return;
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
      setMessage(`${trackId} の音源URLをクリアしました`);
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
          素材マスタは <code className="text-[0.75rem]">nemumi_audio_tracks</code> です。初回アクセス時にコード既定（チャルメラ等）が自動で入ります。ここで
          <strong className="text-[rgba(232,228,223,0.85)]"> 追加・表示名・種類・並びの編集・削除 </strong>
          ができます。音ファイルは Storage（
          <code className="text-[0.75rem]">nemumi-audio</code>
          ）＋ <code className="text-[0.75rem]">nemumi_audio_assets</code> です。公開は{" "}
          <code className="text-[0.75rem]">/api/nemumi-audio</code> です。
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

        <section className="mb-8 rounded border border-[rgba(255,255,255,0.08)] p-4 bg-[rgba(255,255,255,0.02)]">
          <h2 className="text-[0.95rem] font-semibold mb-3">素材を追加</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[0.82rem]">
            <label className="block">
              <span className="text-[0.72rem] text-dim block mb-1">
                track_id（英小文字始まり、例: night_bus）
              </span>
              <input
                className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.1)] px-3 py-2"
                value={newTrackId}
                onChange={(e) => setNewTrackId(e.target.value)}
                placeholder="night_bus"
              />
            </label>
            <label className="block">
              <span className="text-[0.72rem] text-dim block mb-1">表示名</span>
              <input
                className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.1)] px-3 py-2"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-[0.72rem] text-dim block mb-1">種類</span>
              <select
                className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.1)] px-3 py-2"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as NemumiRegistryCategory)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {TAB_LABELS[c]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[0.72rem] text-dim block mb-1">並び（小さいほど上）</span>
              <input
                type="number"
                className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.1)] px-3 py-2"
                value={newSort}
                onChange={(e) => setNewSort(parseInt(e.target.value, 10) || 0)}
              />
            </label>
          </div>
          <button
            type="button"
            disabled={uploading === "new"}
            onClick={() => void addTrack()}
            className="mt-3 px-4 py-2 rounded-md text-[0.85rem] border border-[rgba(224,90,51,0.45)] hover:bg-[rgba(224,90,51,0.1)] disabled:opacity-40"
          >
            追加
          </button>
        </section>

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
                    <span className="text-[0.72rem] text-[rgba(232,228,223,0.4)]">id: {row.trackId}</span>
                    {row.publicUrl ? (
                      <span className="text-[0.68rem] text-green-200/90">音源URL登録済み</span>
                    ) : (
                      <span className="text-[0.68rem] text-[rgba(232,228,223,0.4)]">音源未登録</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 text-[0.82rem]">
                    <label className="block">
                      <span className="text-[0.7rem] text-dim">表示名</span>
                      <input
                        className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.1)] px-2 py-1.5 mt-0.5"
                        value={editLabel[row.trackId] ?? row.label}
                        onChange={(e) =>
                          setEditLabel((prev) => ({ ...prev, [row.trackId]: e.target.value }))
                        }
                      />
                    </label>
                    <label className="block">
                      <span className="text-[0.7rem] text-dim">種類</span>
                      <select
                        className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.1)] px-2 py-1.5 mt-0.5"
                        value={editCategory[row.trackId] ?? row.category}
                        onChange={(e) =>
                          setEditCategory((prev) => ({
                            ...prev,
                            [row.trackId]: e.target.value as NemumiRegistryCategory,
                          }))
                        }
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {TAB_LABELS[c]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block md:col-span-2">
                      <span className="text-[0.7rem] text-dim">並び</span>
                      <input
                        type="number"
                        className="w-32 rounded bg-[#151820] border border-[rgba(255,255,255,0.1)] px-2 py-1.5 mt-0.5"
                        value={editSort[row.trackId] ?? row.sortOrder}
                        onChange={(e) =>
                          setEditSort((prev) => ({
                            ...prev,
                            [row.trackId]: parseInt(e.target.value, 10) || 0,
                          }))
                        }
                      />
                    </label>
                    <div className="md:col-span-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={uploading === row.trackId}
                        onClick={() => void saveTrack(row.trackId)}
                        className="text-[0.78rem] px-3 py-1.5 rounded border border-[rgba(224,90,51,0.45)]"
                      >
                        保存
                      </button>
                      <button
                        type="button"
                        disabled={uploading === row.trackId}
                        onClick={() => void deleteTrack(row.trackId)}
                        className="text-[0.78rem] px-3 py-1.5 rounded border border-red-500/35 text-red-200/90"
                      >
                        削除
                      </button>
                    </div>
                  </div>

                  <p className="text-[0.72rem] text-[rgba(232,228,223,0.45)] mb-2 break-all">
                    ローカル既定パス（未アップロード時）: {row.defaultPath || "（なし・要アップロード）"}
                  </p>
                  {row.publicUrl ? (
                    <p className="text-[0.7rem] text-[rgba(232,228,223,0.55)] mb-3 break-all">
                      URL: {row.publicUrl}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="text-[0.78rem] cursor-pointer">
                      <span className="inline-block px-3 py-1.5 rounded border border-[rgba(224,90,51,0.4)] hover:bg-[rgba(224,90,51,0.1)]">
                        音ファイルを選ぶ
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
                        音源URLだけ削除
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
