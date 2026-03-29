"use client";

import React, { useCallback, useEffect, useState } from "react";
import { NEGOTO_AUTHORS, type NegotoEntryRow } from "@/lib/negoto";

type Props = { token: string };

function formatDate(d: string) {
  return d.replace(/-/g, ".");
}

export default function AdminNegotoClient({ token }: Props) {
  const [entries, setEntries] = useState<NegotoEntryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("新しい寝言");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fDate, setFDate] = useState("");
  const [fAuthor, setFAuthor] = useState<string>(NEGOTO_AUTHORS[0]);
  const [fTitle, setFTitle] = useState("");
  const [fTopic, setFTopic] = useState("");
  const [fBody, setFBody] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadErr(null);
    try {
      const res = await fetch(
        `/api/admin/negoto-entries?token=${encodeURIComponent(token)}`,
        { cache: "no-store" }
      );
      const json = (await res.json()) as {
        ok?: boolean;
        entries?: NegotoEntryRow[];
        error?: string;
      };
      if (!res.ok || !json.ok) {
        setLoadErr(json.error ?? "読み込みに失敗しました");
        setEntries([]);
        return;
      }
      setEntries(json.entries ?? []);
    } catch {
      setLoadErr("読み込みに失敗しました");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setModalTitle("新しい寝言");
    setFDate(new Date().toISOString().slice(0, 10));
    setFAuthor(NEGOTO_AUTHORS[0]);
    setFTitle("");
    setFTopic("");
    setFBody("");
    setIsPublished(false);
    setModalOpen(true);
  }

  function openEdit(e: NegotoEntryRow) {
    setEditingId(e.id);
    setModalTitle("寝言を編集");
    setFDate(e.date);
    setFAuthor(e.author);
    setFTitle(e.title);
    setFTopic(e.topic ?? "");
    setFBody(e.body);
    setIsPublished(e.published);
    setModalOpen(true);
  }

  async function saveEntry() {
    const title = fTitle.trim();
    const topic = fTopic.trim();
    if (!title) {
      window.alert("タイトルを入力してください");
      return;
    }
    if (!fDate) {
      window.alert("日付を入力してください");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/admin/negoto-entries/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            date: fDate,
            author: fAuthor,
            title,
            topic,
            body: fBody,
            published: isPublished,
          }),
        });
        const json = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || !json.ok) {
          window.alert(json.error ?? "保存に失敗しました");
          return;
        }
      } else {
        const res = await fetch("/api/admin/negoto-entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            date: fDate,
            author: fAuthor,
            title,
            topic,
            body: fBody,
            published: isPublished,
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
      const res = await fetch(`/api/admin/negoto-entries/${deletingId}`, {
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

  const sorted = [...entries].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  return (
    <>
      <div className="negoto-admin-wrap">
        <div className="negoto-admin-header">
          <div className="negoto-admin-title">
            寝言帳 管理<span>/ negoto admin</span>
          </div>
          <button
            type="button"
            className="negoto-btn negoto-btn-accent"
            onClick={openCreate}
          >
            + 新しい寝言
          </button>
        </div>

        {loadErr ? (
          <p style={{ color: "rgba(200,120,120,0.8)", marginBottom: "1rem" }}>
            {loadErr}
          </p>
        ) : null}

        {loading ? (
          <p style={{ color: "rgba(232,228,223,0.3)" }}>読み込み中…</p>
        ) : (
          <div className="negoto-entry-list">
            {sorted.length === 0 ? (
              <div className="negoto-empty-state">まだ寝言がありません</div>
            ) : (
              sorted.map((e) => (
                <div key={e.id} className="negoto-entry-row">
                  <div className="negoto-entry-row-date">{formatDate(e.date)}</div>
                  <div className="negoto-entry-row-info">
                    <div className="negoto-entry-row-title">{e.title}</div>
                    <div className="negoto-entry-row-who">{e.author}</div>
                  </div>
                  <div className="negoto-entry-row-status">
                    <span
                      className={
                        e.published
                          ? "negoto-status-badge negoto-status-public"
                          : "negoto-status-badge negoto-status-draft"
                      }
                    >
                      {e.published ? "公開中" : "下書き"}
                    </span>
                  </div>
                  <div className="negoto-entry-row-actions">
                    <button
                      type="button"
                      className="negoto-btn negoto-btn-sm"
                      onClick={() => openEdit(e)}
                    >
                      編集
                    </button>
                  </div>
                  <div className="negoto-entry-row-actions">
                    <button
                      type="button"
                      className="negoto-btn negoto-btn-sm negoto-btn-danger"
                      onClick={() => {
                        setDeletingId(e.id);
                        setConfirmOpen(true);
                      }}
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div
        className={
          modalOpen ? "negoto-modal-overlay negoto-modal-active" : "negoto-modal-overlay"
        }
      >
        <div className="negoto-modal">
          <div className="negoto-modal-title">{modalTitle}</div>

          <div className="negoto-form-row">
            <div className="negoto-form-group">
              <label className="negoto-form-label">日付</label>
              <input
                type="date"
                className="negoto-form-input"
                value={fDate}
                onChange={(ev) => setFDate(ev.target.value)}
              />
            </div>
            <div className="negoto-form-group">
              <label className="negoto-form-label">書き手</label>
              <select
                className="negoto-form-select"
                value={fAuthor}
                onChange={(ev) => setFAuthor(ev.target.value)}
              >
                {NEGOTO_AUTHORS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="negoto-form-group">
            <label className="negoto-form-label">エントリタイトル</label>
            <input
              type="text"
              className="negoto-form-input"
              value={fTitle}
              onChange={(ev) => setFTitle(ev.target.value)}
              placeholder="例: レムテレの存在意義"
            />
          </div>

          <div className="negoto-form-group">
            <label className="negoto-form-label">トピックタイトル</label>
            <input
              type="text"
              className="negoto-form-input"
              value={fTopic}
              onChange={(ev) => setFTopic(ev.target.value)}
              placeholder="例: お笑い的なポジションのレムテレ"
            />
            <div className="negoto-form-help">
              セクション見出し的に使うサブタイトル（任意）
            </div>
          </div>

          <div className="negoto-form-group">
            <label className="negoto-form-label">本文</label>
            <textarea
              className="negoto-form-textarea"
              value={fBody}
              onChange={(ev) => setFBody(ev.target.value)}
              placeholder="砂浜に枝で書くように..."
            />
            <div className="negoto-form-help">
              チャプター区切りには --- を使用。見出しには ## を使用。
            </div>
          </div>

          <div className="negoto-form-group">
            <label className="negoto-form-label">公開設定</label>
            <button
              type="button"
              className="negoto-form-toggle"
              onClick={() => setIsPublished((v) => !v)}
            >
              <div
                className={
                  isPublished
                    ? "negoto-toggle-track negoto-toggle-on"
                    : "negoto-toggle-track"
                }
              >
                <div className="negoto-toggle-thumb" />
              </div>
              <span>
                {isPublished ? "公開" : "非公開（下書き）"}
              </span>
            </button>
          </div>

          <div className="negoto-modal-actions">
            <button
              type="button"
              className="negoto-btn"
              onClick={() => setModalOpen(false)}
            >
              キャンセル
            </button>
            <button
              type="button"
              className="negoto-btn negoto-btn-accent"
              disabled={saving}
              onClick={() => void saveEntry()}
            >
              {saving ? "保存中…" : "保存"}
            </button>
          </div>
        </div>
      </div>

      <div
        className={
          confirmOpen
            ? "negoto-confirm-overlay negoto-modal-active"
            : "negoto-confirm-overlay"
        }
      >
        <div className="negoto-confirm-box">
          <p>
            この寝言を削除しますか？
            <br />
            この操作は取り消せません。
          </p>
          <button
            type="button"
            className="negoto-btn"
            onClick={() => {
              setConfirmOpen(false);
              setDeletingId(null);
            }}
          >
            やめる
          </button>
          <button
            type="button"
            className="negoto-btn negoto-btn-danger"
            onClick={() => void confirmDelete()}
          >
            削除する
          </button>
        </div>
      </div>

      {/* eslint-disable-next-line react/no-danger */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
.negoto-admin-wrap { max-width: 860px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
.negoto-admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(232,228,223,0.08); }
.negoto-admin-title { font-size: 20px; font-weight: 400; }
.negoto-admin-title span { font-size: 11px; font-family: "Courier New", monospace; color: rgba(232,228,223,0.3); margin-left: 0.75rem; letter-spacing: 0.05em; }
.negoto-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; font-size: 13px; font-family: inherit; color: #E8E4DF; background: transparent; border: 1px solid rgba(232,228,223,0.15); border-radius: 4px; cursor: pointer; transition: all 0.3s; }
.negoto-btn:hover { border-color: rgba(232,228,223,0.35); background: rgba(232,228,223,0.04); }
.negoto-btn-accent { border-color: rgba(224,90,51,0.4); color: #E05A33; }
.negoto-btn-accent:hover { border-color: #E05A33; background: rgba(224,90,51,0.08); }
.negoto-btn-danger { border-color: rgba(200,60,60,0.3); color: rgba(200,60,60,0.7); }
.negoto-btn-danger:hover { border-color: rgba(200,60,60,0.6); background: rgba(200,60,60,0.06); }
.negoto-btn-sm { padding: 5px 10px; font-size: 11px; }
.negoto-entry-row { display: grid; grid-template-columns: 80px 1fr 100px 80px 100px; gap: 12px; align-items: center; padding: 1rem 0; border-bottom: 1px solid rgba(232,228,223,0.05); transition: background 0.3s; }
.negoto-entry-row:hover { background: rgba(232,228,223,0.02); }
.negoto-entry-row-date { font-size: 11px; font-family: "Courier New", monospace; color: rgba(232,228,223,0.3); }
.negoto-entry-row-info { min-width: 0; }
.negoto-entry-row-title { font-size: 14px; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.negoto-entry-row-who { font-size: 11px; color: #E05A33; opacity: 0.5; }
.negoto-entry-row-status { text-align: center; }
.negoto-status-badge { display: inline-block; padding: 3px 10px; font-size: 10px; font-family: "Courier New", monospace; border-radius: 3px; letter-spacing: 0.05em; }
.negoto-status-public { color: rgba(100,200,150,0.8); background: rgba(100,200,150,0.08); border: 1px solid rgba(100,200,150,0.15); }
.negoto-status-draft { color: rgba(232,228,223,0.35); background: rgba(232,228,223,0.03); border: 1px solid rgba(232,228,223,0.08); }
.negoto-entry-row-actions { display: flex; gap: 6px; justify-content: flex-end; }
.negoto-modal-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 100; justify-content: center; align-items: flex-start; padding: 4rem 1.5rem; overflow-y: auto; }
.negoto-modal-overlay.negoto-modal-active { display: flex; }
.negoto-modal { background: #13151A; border: 1px solid rgba(232,228,223,0.08); border-radius: 6px; width: 100%; max-width: 640px; padding: 2rem; }
.negoto-modal-title { font-size: 18px; font-weight: 400; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(232,228,223,0.06); }
.negoto-form-group { margin-bottom: 1.25rem; }
.negoto-form-label { display: block; font-size: 12px; color: rgba(232,228,223,0.4); margin-bottom: 0.4rem; font-family: "Courier New", monospace; letter-spacing: 0.03em; }
.negoto-form-input, .negoto-form-select, .negoto-form-textarea { width: 100%; padding: 10px 12px; font-size: 14px; font-family: inherit; color: #E8E4DF; background: rgba(232,228,223,0.03); border: 1px solid rgba(232,228,223,0.1); border-radius: 4px; outline: none; transition: border-color 0.3s; }
.negoto-form-input:focus, .negoto-form-select:focus, .negoto-form-textarea:focus { border-color: rgba(232,228,223,0.25); }
.negoto-form-select { appearance: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(232,228,223,0.3)' fill='none' stroke-width='1.5'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
.negoto-form-select option { background: #13151A; color: #E8E4DF; }
.negoto-form-textarea { min-height: 300px; line-height: 2.2; resize: vertical; }
.negoto-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.negoto-form-toggle { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 13px; background: none; border: none; color: inherit; }
.negoto-toggle-track { width: 36px; height: 20px; background: rgba(232,228,223,0.08); border-radius: 10px; position: relative; transition: background 0.3s; }
.negoto-toggle-track.negoto-toggle-on { background: rgba(100,200,150,0.25); }
.negoto-toggle-thumb { width: 16px; height: 16px; background: rgba(232,228,223,0.5); border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: all 0.3s; }
.negoto-toggle-track.negoto-toggle-on .negoto-toggle-thumb { left: 18px; background: rgba(100,200,150,0.9); }
.negoto-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(232,228,223,0.06); }
.negoto-form-help { font-size: 11px; color: rgba(232,228,223,0.2); margin-top: 4px; font-family: "Courier New", monospace; }
.negoto-empty-state { text-align: center; padding: 4rem 0; color: rgba(232,228,223,0.2); font-size: 14px; }
.negoto-confirm-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); z-index: 200; justify-content: center; align-items: center; }
.negoto-confirm-overlay.negoto-modal-active { display: flex; }
.negoto-confirm-box { background: #13151A; border: 1px solid rgba(232,228,223,0.1); border-radius: 6px; padding: 2rem; max-width: 380px; text-align: center; }
.negoto-confirm-box p { margin-bottom: 1.5rem; font-size: 14px; line-height: 1.8; color: rgba(232,228,223,0.7); }
.negoto-confirm-box .negoto-btn { margin: 0 4px; }
@media (max-width: 720px) {
  .negoto-entry-row { grid-template-columns: 1fr; gap: 8px; }
  .negoto-entry-row-status, .negoto-entry-row-actions { justify-content: flex-start; }
}
`,
        }}
      />
    </>
  );
}
