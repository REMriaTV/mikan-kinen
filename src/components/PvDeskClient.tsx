"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  PV_BOARD_DEFAULT_SLUG,
  defaultPvBoardData,
  type PvBoardCut,
  type PvBoardData,
  type PvTimeOfDay,
} from "@/lib/pv-board";

const STORAGE_TOKEN_KEY = "pv-board-token";

function parseYoutubeId(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace(/^\//, "").slice(0, 11);
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    const v = u.searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
  } catch {
    /* ignore */
  }
  const m = s.match(/(?:v=|\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m?.[1] ?? null;
}

function timeOfDayLabel(t?: PvTimeOfDay): string {
  switch (t) {
    case "day":
      return "昼";
    case "night":
      return "夜";
    case "evening":
      return "夕方";
    case "flex":
      return "昼/夜";
    default:
      return "—";
  }
}

function Field({
  label,
  value,
  onChange,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[0.65rem] tracking-[0.2em] text-[rgba(232,228,223,0.45)]">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full resize-y rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.35)] px-3 py-2 text-[0.88rem] leading-relaxed text-[#E8E4DF] placeholder:text-dim focus:border-[#E05A33] focus:outline-none"
      />
    </label>
  );
}

export default function PvDeskClient() {
  const [board, setBoard] = useState<PvBoardData | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [ytPlaying, setYtPlaying] = useState(false);
  const [ytThumbFail, setYtThumbFail] = useState(false);
  const [processDraft, setProcessDraft] = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const t = sessionStorage.getItem(STORAGE_TOKEN_KEY);
      if (t) setToken(t);
    } catch {
      /* private mode */
    }
  }, []);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch(`/api/pv-board?slug=${encodeURIComponent(PV_BOARD_DEFAULT_SLUG)}`);
      const json = (await res.json()) as { ok?: boolean; data?: PvBoardData; error?: string; updatedAt?: string };
      if (!res.ok || !json.ok || !json.data) {
        setLoadError(json.error || "読み込みに失敗しました");
        setBoard(defaultPvBoardData());
        return;
      }
      setBoard(json.data);
      setUpdatedAt(typeof json.updatedAt === "string" ? json.updatedAt : null);
    } catch {
      setLoadError("通信エラー");
      setBoard(defaultPvBoardData());
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const youtubeId = useMemo(() => {
    if (!board?.youtubeVideoId) return null;
    return parseYoutubeId(board.youtubeVideoId) || parseYoutubeId(`https://youtu.be/${board.youtubeVideoId}`);
  }, [board?.youtubeVideoId]);

  const persistToken = (t: string) => {
    setToken(t);
    try {
      if (t) sessionStorage.setItem(STORAGE_TOKEN_KEY, t);
      else sessionStorage.removeItem(STORAGE_TOKEN_KEY);
    } catch {
      /* ignore */
    }
  };

  const save = async () => {
    if (!board) return;
    setSaveMessage(null);
    if (!token.trim()) {
      setSaveMessage(
        "編集用トークンを入力してください（/admin/broadcast の URL の token= と同じ値）。"
      );
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/pv-board", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.trim()}`,
        },
        body: JSON.stringify({
          slug: PV_BOARD_DEFAULT_SLUG,
          data: board,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setSaveMessage(json.error || "保存に失敗しました");
        return;
      }
      setSaveMessage("保存しました");
      await load();
    } catch {
      setSaveMessage("通信エラー");
    } finally {
      setSaving(false);
    }
  };

  const updateCut = (id: string, patch: Partial<PvBoardCut>) => {
    setBoard((b) => {
      if (!b) return b;
      return {
        ...b,
        cuts: b.cuts.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      };
    });
  };

  const addCut = () => {
    setBoard((b) => {
      if (!b) return b;
      const nextOrder = b.cuts.length === 0 ? 0 : Math.max(...b.cuts.map((c) => c.sortOrder)) + 1;
      const cut: PvBoardCut = {
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `cut-${Date.now()}`,
        sortOrder: nextOrder,
        sceneTitle: `シーン ${b.cuts.length + 1}`,
      };
      return { ...b, cuts: [...b.cuts, cut] };
    });
  };

  const removeCut = (id: string) => {
    if (!confirm("このカットを削除しますか？")) return;
    setBoard((b) => {
      if (!b) return b;
      return { ...b, cuts: b.cuts.filter((c) => c.id !== id) };
    });
  };

  const moveCut = (id: string, dir: -1 | 1) => {
    setBoard((b) => {
      if (!b) return b;
      const idx = b.cuts.findIndex((c) => c.id === id);
      const j = idx + dir;
      if (idx < 0 || j < 0 || j >= b.cuts.length) return b;
      const next = [...b.cuts];
      const tmp = next[idx];
      next[idx] = next[j];
      next[j] = tmp;
      return {
        ...b,
        cuts: next.map((c, i) => ({ ...c, sortOrder: i })),
      };
    });
  };

  const appendProcess = () => {
    const msg = processDraft.trim();
    if (!msg) return;
    const at = new Date().toISOString();
    setBoard((b) => {
      if (!b) return b;
      return { ...b, processLog: [{ at, message: msg }, ...b.processLog] };
    });
    setProcessDraft("");
  };

  const uploadImage = async (cutId: string, file: File) => {
    if (!token.trim()) {
      setSaveMessage("画像アップロードにはトークンが必要です。");
      return;
    }
    setUploadingId(cutId);
    setSaveMessage(null);
    try {
      const fd = new FormData();
      fd.set("token", token.trim());
      fd.set("file", file);
      const res = await fetch("/api/pv-board/upload", { method: "POST", body: fd });
      const json = (await res.json()) as { ok?: boolean; publicUrl?: string; error?: string };
      if (!res.ok || !json.ok || !json.publicUrl) {
        setSaveMessage(json.error || "アップロードに失敗しました");
        return;
      }
      updateCut(cutId, { thumbnailUrl: json.publicUrl });
    } catch {
      setSaveMessage("アップロード通信エラー");
    } finally {
      setUploadingId(null);
    }
  };

  if (!board) {
    return (
      <div className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.25)] px-6 py-16 text-center text-secondary">
        読み込み中…
      </div>
    );
  }

  const thumbSrc = youtubeId
    ? ytThumbFail
      ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
      : `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
    : "";

  const embedSrc = youtubeId
    ? (() => {
        const q = new URLSearchParams({
          autoplay: "1",
          rel: "0",
          modestbranding: "1",
          playlist: youtubeId,
        });
        return `https://www.youtube.com/embed/${encodeURIComponent(youtubeId)}?${q.toString()}`;
      })()
    : "";

  return (
    <div className="space-y-10 text-[#E8E4DF]">
      {loadError ? (
        <p className="rounded border border-[#6b3410] bg-[rgba(107,52,16,0.2)] px-4 py-3 text-sm text-[#f4a261]">
          {loadError}（オフライン用にサンプルを表示しています）
        </p>
      ) : null}

      <section className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0D0F12] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        <p className="mb-2 text-[0.6rem] tracking-[0.45em] text-[rgba(232,228,223,0.55)]">LEMURIA TV / 制作進行</p>
        <h1 className="font-shippori text-xl font-bold tracking-tight md:text-2xl">{board.title}</h1>
        <div className="mt-4 max-w-xl">
          <Field label="制作タイトル" rows={1} value={board.title} onChange={(v) => setBoard({ ...board, title: v })} />
        </div>
        <p className="mt-2 text-sm text-[rgba(232,228,223,0.62)]">
          ブラウザで直接編集し、保存で Supabase に反映します。閲覧は誰でも、保存と画像アップロードは
          <strong className="font-normal text-[#E8E4DF]">管理者ページと同じトークン</strong>
          （環境変数 <code className="text-[0.8em] text-gold">ADMIN_BROADCAST_TOKEN</code>
          ）が必要です。
        </p>
        {updatedAt ? (
          <p className="mt-2 text-xs text-dim">最終更新（サーバー）: {new Date(updatedAt).toLocaleString("ja-JP")}</p>
        ) : (
          <p className="mt-2 text-xs text-dim">まだサーバーに保存されていません（初回保存で作成されます）。</p>
        )}
      </section>

      <section className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0D0F12] p-6">
        <h2 className="mb-4 text-xs tracking-[0.35em] text-dim">参照動画（YouTube）</h2>
        <Field
          label="動画 ID または URL"
          rows={1}
          value={board.youtubeVideoId || ""}
          onChange={(v) => setBoard({ ...board, youtubeVideoId: v })}
        />
        {youtubeId ? (
          <div
            className="relative mt-4 w-full overflow-hidden rounded border border-[rgba(255,255,255,0.08)] bg-black/40"
            style={{ aspectRatio: "16 / 9" }}
          >
            {!ytPlaying ? (
              <button
                type="button"
                onClick={() => setYtPlaying(true)}
                className="group relative block h-full w-full cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E05A33] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0F12]"
                aria-label="参照動画を再生"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbSrc}
                  alt=""
                  className="h-full w-full object-cover transition-opacity group-hover:opacity-85"
                  loading="lazy"
                  onError={() => {
                    if (!ytThumbFail) setYtThumbFail(true);
                  }}
                />
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/15">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(232,228,223,0.35)] bg-[rgba(13,15,18,0.55)] pl-1 text-2xl text-[#E8E4DF]">
                    ▶
                  </span>
                </span>
              </button>
            ) : (
              <iframe title="参照動画" src={embedSrc} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm text-dim">有効な YouTube ID または URL を入力すると埋め込みが表示されます。</p>
        )}
      </section>

      <section className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0D0F12] p-6">
        <h2 className="mb-4 text-xs tracking-[0.35em] text-dim">編集用トークン</h2>
        <input
          type="password"
          autoComplete="off"
          value={token}
          onChange={(e) => persistToken(e.target.value)}
          placeholder="ADMIN_BROADCAST_TOKEN（管理者ページの ?token= と同じ）"
          className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.35)] px-3 py-2 text-sm text-[#E8E4DF] focus:border-[#E05A33] focus:outline-none"
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="rounded bg-[#E05A33] px-5 py-2 text-sm font-medium text-[#0D0F12] disabled:opacity-50"
          >
            {saving ? "保存中…" : "Supabase に保存"}
          </button>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded border border-[rgba(255,255,255,0.2)] px-4 py-2 text-sm text-secondary hover:bg-[rgba(255,255,255,0.04)]"
          >
            再読込
          </button>
          <button
            type="button"
            onClick={addCut}
            className="rounded border border-[rgba(201,168,76,0.45)] px-4 py-2 text-sm text-gold hover:bg-[rgba(201,168,76,0.08)]"
          >
            カットを追加
          </button>
        </div>
        {saveMessage ? <p className="mt-3 text-sm text-secondary">{saveMessage}</p> : null}
      </section>

      <section className="space-y-6">
        <h2 className="text-xs tracking-[0.35em] text-dim">シーン構成（カット）</h2>
        {board.cuts.map((cut, index) => (
          <article
            key={cut.id}
            className="grid gap-5 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#111116] p-5 md:grid-cols-[minmax(0,200px)_1fr]"
          >
            <div className="space-y-3">
              <div className="relative aspect-video w-full max-w-[240px] overflow-hidden rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)]">
                {cut.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cut.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center text-[0.7rem] text-dim">
                    <span>絵コンテ・参考画像</span>
                    <span>未設定</span>
                  </div>
                )}
              </div>
              <label className="block text-xs text-dim">
                <span className="mb-1 block tracking-wider">画像アップロード</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  disabled={uploadingId === cut.id}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (f) void uploadImage(cut.id, f);
                  }}
                  className="w-full text-xs text-secondary file:mr-2 file:rounded file:border-0 file:bg-[rgba(224,90,51,0.25)] file:px-2 file:py-1 file:text-[#E8E4DF]"
                />
              </label>
              {cut.thumbnailUrl ? (
                <button
                  type="button"
                  onClick={() => updateCut(cut.id, { thumbnailUrl: undefined })}
                  className="text-xs text-dim underline hover:text-secondary"
                >
                  画像を外す
                </button>
              ) : null}
            </div>
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-shippori text-lg text-[#E8E4DF]">
                  #{index + 1} {cut.sceneTitle || "無題"}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => moveCut(cut.id, -1)}
                    disabled={index === 0}
                    className="rounded border border-[rgba(255,255,255,0.12)] px-2 py-1 text-xs disabled:opacity-30"
                  >
                    上へ
                  </button>
                  <button
                    type="button"
                    onClick={() => moveCut(cut.id, 1)}
                    disabled={index >= board.cuts.length - 1}
                    className="rounded border border-[rgba(255,255,255,0.12)] px-2 py-1 text-xs disabled:opacity-30"
                  >
                    下へ
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCut(cut.id)}
                    className="rounded border border-[rgba(180,60,60,0.5)] px-2 py-1 text-xs text-[#f4a8a8]"
                  >
                    削除
                  </button>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-secondary">
                <input
                  type="checkbox"
                  checked={!!cut.shootDone}
                  onChange={(e) => updateCut(cut.id, { shootDone: e.target.checked })}
                />
                撮影済み（完了）
              </label>
              <div className="flex flex-wrap gap-2">
                <span className="w-full text-[0.65rem] tracking-[0.2em] text-[rgba(232,228,223,0.45)]">時間帯</span>
                {(
                  [
                    ["day", "昼"],
                    ["night", "夜"],
                    ["evening", "夕方"],
                    ["flex", "昼/夜"],
                  ] as const
                ).map(([val, lab]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => updateCut(cut.id, { timeOfDay: cut.timeOfDay === val ? undefined : val })}
                    className={`rounded-full px-3 py-1 text-xs ${
                      cut.timeOfDay === val
                        ? "bg-[rgba(224,90,51,0.35)] text-[#E8E4DF]"
                        : "bg-[rgba(255,255,255,0.06)] text-dim hover:bg-[rgba(255,255,255,0.1)]"
                    }`}
                  >
                    {lab}
                  </button>
                ))}
                <span className="self-center text-xs text-dim">現在: {timeOfDayLabel(cut.timeOfDay)}</span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="シーン名" value={cut.sceneTitle} onChange={(v) => updateCut(cut.id, { sceneTitle: v })} rows={1} />
                <Field label="セクション" value={cut.section || ""} onChange={(v) => updateCut(cut.id, { section: v })} rows={1} />
                <Field label="開始タイムコード" value={cut.timecodeStart || ""} onChange={(v) => updateCut(cut.id, { timecodeStart: v })} rows={1} />
                <Field label="終了タイムコード" value={cut.timecodeEnd || ""} onChange={(v) => updateCut(cut.id, { timecodeEnd: v })} rows={1} />
              </div>
              <Field label="歌詞・曲の場面" value={cut.lyricsPart || ""} onChange={(v) => updateCut(cut.id, { lyricsPart: v })} />
              <Field label="内容・演出" value={cut.direction || ""} onChange={(v) => updateCut(cut.id, { direction: v })} rows={3} />
              <Field label="映像イメージ" value={cut.visual || ""} onChange={(v) => updateCut(cut.id, { visual: v })} rows={2} />
              <Field label="カメラワーク" value={cut.camera || ""} onChange={(v) => updateCut(cut.id, { camera: v })} rows={2} />
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="カット名" value={cut.cutName || ""} onChange={(v) => updateCut(cut.id, { cutName: v })} rows={1} />
                <Field label="手法（実写 / AI 等）" value={cut.method || ""} onChange={(v) => updateCut(cut.id, { method: v })} rows={1} />
                <Field label="撮影日" value={cut.shootDate || ""} onChange={(v) => updateCut(cut.id, { shootDate: v })} rows={1} />
              </div>
              <Field label="内容（撮影メモ）" value={cut.contentAction || ""} onChange={(v) => updateCut(cut.id, { contentAction: v })} rows={2} />
              <Field label="備考" value={cut.notes || ""} onChange={(v) => updateCut(cut.id, { notes: v })} rows={2} />
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0D0F12] p-6">
        <h2 className="mb-3 text-xs tracking-[0.35em] text-dim">公開プロセスログ</h2>
        <p className="mb-3 text-sm text-secondary">制作の一言を積み重ねます（新しいものが上に来ます）。</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <textarea
            value={processDraft}
            onChange={(e) => setProcessDraft(e.target.value)}
            rows={2}
            placeholder="例: イントロの夜撮、仮編集まで完了"
            className="min-w-0 flex-1 rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.35)] px-3 py-2 text-sm text-[#E8E4DF] focus:border-[#E05A33] focus:outline-none"
          />
          <button
            type="button"
            onClick={appendProcess}
            className="shrink-0 rounded border border-[rgba(201,168,76,0.45)] px-4 py-2 text-sm text-gold hover:bg-[rgba(201,168,76,0.08)]"
          >
            ログに追加
          </button>
        </div>
        <ul className="mt-6 space-y-3 border-t border-[rgba(255,255,255,0.06)] pt-4">
          {board.processLog.length === 0 ? (
            <li className="text-sm text-dim">まだログがありません。</li>
          ) : (
            board.processLog.map((e, i) => (
              <li key={`${e.at}-${i}`} className="text-sm">
                <time className="mr-2 text-dim">{new Date(e.at).toLocaleString("ja-JP")}</time>
                <span className="text-secondary">{e.message}</span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
