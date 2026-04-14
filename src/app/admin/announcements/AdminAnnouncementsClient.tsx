"use client";

import React, { useCallback, useEffect, useState } from "react";
import AdminNav from "@/components/AdminNav";
import {
  formatAnnouncementDate,
  type SiteAnnouncementAdminRow,
} from "@/lib/site-announcements";

type Props = { token: string };

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminAnnouncementsClient({ token }: Props) {
  const [items, setItems] = useState<SiteAnnouncementAdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fTitle, setFTitle] = useState("");
  const [fSummary, setFSummary] = useState("");
  const [fLinkUrl, setFLinkUrl] = useState("");
  const [fPublished, setFPublished] = useState(true);
  const [fPublishedAt, setFPublishedAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadErr(null);
    try {
      const res = await fetch(
        `/api/admin/site-announcements?token=${encodeURIComponent(token)}`,
        { cache: "no-store" }
      );
      const json = (await res.json()) as {
        ok?: boolean;
        items?: SiteAnnouncementAdminRow[];
        error?: string;
      };
      if (!res.ok || !json.ok) {
        setLoadErr(json.error ?? "読み込みに失敗しました");
        setItems([]);
        return;
      }
      setItems(json.items ?? []);
    } catch {
      setLoadErr("読み込みに失敗しました");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setFTitle("");
    setFSummary("");
    setFLinkUrl("");
    setFPublished(true);
    setFPublishedAt(toDatetimeLocalValue(new Date().toISOString()));
    setModalOpen(true);
  }

  function openEdit(row: SiteAnnouncementAdminRow) {
    setEditingId(row.id);
    setFTitle(row.title);
    setFSummary(row.summary ?? "");
    setFLinkUrl(row.link_url ?? "");
    setFPublished(row.published);
    setFPublishedAt(toDatetimeLocalValue(row.published_at));
    setModalOpen(true);
  }

  async function save() {
    const title = fTitle.trim();
    if (!title) {
      window.alert("タイトルを入力してください");
      return;
    }
    if (!fPublishedAt) {
      window.alert("掲載日時を入力してください");
      return;
    }
    const publishedAtIso = new Date(fPublishedAt).toISOString();

    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/admin/site-announcements/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            title,
            summary: fSummary.trim() || null,
            link_url: fLinkUrl.trim() || null,
            published: fPublished,
            published_at: publishedAtIso,
          }),
        });
        const json = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || !json.ok) {
          window.alert(json.error ?? "保存に失敗しました");
          return;
        }
      } else {
        const res = await fetch("/api/admin/site-announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            title,
            summary: fSummary.trim() || null,
            link_url: fLinkUrl.trim() || null,
            published: fPublished,
            published_at: publishedAtIso,
          }),
        });
        const json = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || !json.ok) {
          window.alert(json.error ?? "保存に失敗しました");
          return;
        }
      }
      setModalOpen(false);
      setEditingId(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/admin/site-announcements/${deletingId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        window.alert(json.error ?? "削除に失敗しました");
        return;
      }
      setConfirmOpen(false);
      setDeletingId(null);
      await load();
    } catch {
      window.alert("削除に失敗しました");
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0D0F12] text-[#E8E4DF] px-6 py-10">
      <div className="max-w-[860px] mx-auto">
        <AdminNav token={token} current="announcements" />

        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-[1.15rem] font-bold font-shippori">お知らせ管理</h1>
            <p className="text-[0.72rem] text-[rgba(232,228,223,0.45)] mt-1 tracking-[0.06em]">
              トップヘッダー右下の「お知らせ」パネルに表示されます（公開のみ）。
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="text-[0.8rem] px-5 py-2.5 border border-[rgba(224,90,51,0.45)] text-[#e8c9bf] rounded-sm hover:bg-[rgba(224,90,51,0.12)]"
          >
            ＋ 新規お知らせ
          </button>
        </div>

        {loadErr ? (
          <p className="text-red-300/90 text-sm mb-4">{loadErr}</p>
        ) : null}

        {loading ? (
          <p className="text-[rgba(232,228,223,0.4)] text-sm">読み込み中…</p>
        ) : items.length === 0 ? (
          <p className="text-[rgba(232,228,223,0.35)] text-sm">
            まだお知らせがありません。新規作成するか、Supabase の{" "}
            <code className="text-[0.7rem]">site_announcements</code>{" "}
            テーブルを確認してください。
          </p>
        ) : (
          <div className="rounded border border-[rgba(255,255,255,0.08)] overflow-hidden">
            <table className="w-full text-left text-[0.82rem]">
              <thead className="bg-[rgba(255,255,255,0.04)] text-[0.65rem] uppercase tracking-[0.12em] text-[rgba(232,228,223,0.45)]">
                <tr>
                  <th className="px-4 py-3 font-normal">日付</th>
                  <th className="px-4 py-3 font-normal">タイトル</th>
                  <th className="px-4 py-3 font-normal w-[100px]">公開</th>
                  <th className="px-4 py-3 font-normal text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.06)]">
                {items.map((row) => (
                  <tr key={row.id} className="hover:bg-[rgba(255,255,255,0.02)]">
                    <td className="px-4 py-3 font-mono text-[0.75rem] text-gold/70 whitespace-nowrap">
                      {formatAnnouncementDate(row.published_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-shippori text-[0.9rem]">{row.title}</div>
                      {row.summary ? (
                        <div className="text-[0.72rem] text-[rgba(232,228,223,0.5)] mt-1 line-clamp-2">
                          {row.summary}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          row.published
                            ? "text-[0.65rem] px-2 py-0.5 rounded border border-green-500/30 text-green-400/90"
                            : "text-[0.65rem] px-2 py-0.5 rounded border border-[rgba(255,255,255,0.12)] text-[rgba(232,228,223,0.35)]"
                        }
                      >
                        {row.published ? "公開" : "下書き"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="text-[0.72rem] mr-3 text-[rgba(224,90,51,0.85)] hover:underline"
                      >
                        編集
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeletingId(row.id);
                          setConfirmOpen(true);
                        }}
                        className="text-[0.72rem] text-red-400/70 hover:underline"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-[100] flex justify-center items-start pt-[8vh] px-4 bg-black/70 overflow-y-auto">
          <div className="bg-[#13151A] border border-[rgba(255,255,255,0.1)] rounded-md w-full max-w-[520px] p-6 my-4">
            <h2 className="text-[1rem] font-bold mb-5 pb-3 border-b border-[rgba(255,255,255,0.06)]">
              {editingId ? "お知らせを編集" : "新しいお知らせ"}
            </h2>

            <label className="block mb-4">
              <span className="block text-[0.72rem] text-[rgba(232,228,223,0.45)] mb-1">
                タイトル
              </span>
              <input
                className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.12)] px-3 py-2 text-[0.9rem]"
                value={fTitle}
                onChange={(e) => setFTitle(e.target.value)}
                placeholder="例: コラムを更新しました"
              />
            </label>

            <label className="block mb-4">
              <span className="block text-[0.72rem] text-[rgba(232,228,223,0.45)] mb-1">
                概要（任意）
              </span>
              <textarea
                className="w-full min-h-[100px] rounded bg-[#151820] border border-[rgba(255,255,255,0.12)] px-3 py-2 text-[0.88rem] leading-relaxed"
                value={fSummary}
                onChange={(e) => setFSummary(e.target.value)}
                placeholder="ヘッダーパネルに表示する短い説明"
              />
            </label>

            <label className="block mb-4">
              <span className="block text-[0.72rem] text-[rgba(232,228,223,0.45)] mb-1">
                リンクURL（任意）
              </span>
              <input
                className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.12)] px-3 py-2 text-[0.85rem] font-mono"
                value={fLinkUrl}
                onChange={(e) => setFLinkUrl(e.target.value)}
                placeholder="/negoto または https://..."
              />
            </label>

            <label className="block mb-4">
              <span className="block text-[0.72rem] text-[rgba(232,228,223,0.45)] mb-1">
                掲載日時（並び順に使用）
              </span>
              <input
                type="datetime-local"
                className="w-full rounded bg-[#151820] border border-[rgba(255,255,255,0.12)] px-3 py-2 text-[0.85rem]"
                value={fPublishedAt}
                onChange={(e) => setFPublishedAt(e.target.value)}
              />
            </label>

            <button
              type="button"
              onClick={() => setFPublished((v) => !v)}
              className="flex items-center gap-2 mb-6 text-[0.85rem]"
            >
              <span
                className={
                  fPublished
                    ? "w-9 h-5 rounded-full bg-green-900/50 relative"
                    : "w-9 h-5 rounded-full bg-[rgba(255,255,255,0.1)] relative"
                }
              >
                <span
                  className={
                    fPublished
                      ? "absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-green-400"
                      : "absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-[rgba(232,228,223,0.4)]"
                  }
                />
              </span>
              {fPublished ? "公開（トップに表示）" : "下書き（非表示）"}
            </button>

            <div className="flex justify-end gap-3 pt-2 border-t border-[rgba(255,255,255,0.06)]">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-[0.8rem] px-4 py-2 border border-[rgba(255,255,255,0.15)] rounded-sm"
              >
                キャンセル
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void save()}
                className="text-[0.8rem] px-5 py-2 border border-[rgba(224,90,51,0.5)] text-[#e8c9bf] rounded-sm hover:bg-[rgba(224,90,51,0.1)] disabled:opacity-50"
              >
                {saving ? "保存中…" : "保存"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmOpen ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 px-4">
          <div className="bg-[#13151A] border border-[rgba(255,255,255,0.1)] rounded-md p-6 max-w-[380px] text-center">
            <p className="text-[0.9rem] mb-5 leading-relaxed">
              このお知らせを削除しますか？
            </p>
            <button
              type="button"
              onClick={() => {
                setConfirmOpen(false);
                setDeletingId(null);
              }}
              className="text-[0.8rem] mr-3 px-4 py-2 border border-[rgba(255,255,255,0.15)] rounded-sm"
            >
              やめる
            </button>
            <button
              type="button"
              onClick={() => void confirmDelete()}
              className="text-[0.8rem] px-4 py-2 border border-red-500/40 text-red-300/90 rounded-sm"
            >
              削除する
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
