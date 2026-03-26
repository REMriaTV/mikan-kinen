"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { allWorks } from "@/data/works";
import type { Manuscript, ManuscriptInput } from "@/lib/manuscripts";

type Props = { token: string };

const EMPTY_FORM: ManuscriptInput = {
  work_id: "",
  title: "",
  author: "百面惣",
  status: "執筆中",
  position: "",
  body: "",
};

export default function MakuraMotoClient({ token }: Props) {
  const [items, setItems] = useState<Manuscript[]>([]);
  const [selectedWorkId, setSelectedWorkId] = useState<string>("");
  const [form, setForm] = useState<ManuscriptInput>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [dirty, setDirty] = useState(false);

  const knownWorks = useMemo(
    () => allWorks.map((w) => ({ slug: w.slug, title: w.title, pos: `${w.timeSlot ?? ""} × ${w.lunarPhase ?? ""}`.trim() })),
    []
  );

  async function load() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/manuscripts", { cache: "no-store" });
      const json = (await res.json()) as { ok?: boolean; manuscripts?: Manuscript[]; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || "load failed");
      const list = json.manuscripts ?? [];
      setItems(list);
      if (!selectedWorkId && list.length > 0) {
        selectByWorkId(list[0].work_id, list);
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  function selectByWorkId(workId: string, source?: Manuscript[]) {
    const src = source ?? items;
    const found = src.find((m) => m.work_id === workId);
    setSelectedWorkId(workId);
    if (found) {
      setForm({
        work_id: found.work_id,
        title: found.title,
        author: found.author,
        status: found.status,
        position: found.position,
        body: found.body,
      });
    } else {
      const matched = knownWorks.find((w) => w.slug === workId);
      setForm({
        work_id: workId,
        title: matched?.title || "",
        author: "百面惣",
        status: "執筆中",
        position: matched?.pos || "",
        body: "",
      });
    }
    setDirty(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    if (!form.work_id || !form.title) {
      setMessage("work_id とタイトルは必須です。");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/manuscripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, manuscript: form }),
      });
      const json = (await res.json()) as { ok?: boolean; manuscript?: Manuscript; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || "save failed");
      const saved = json.manuscript;
      if (saved) {
        setItems((prev) => {
          const next = [...prev];
          const idx = next.findIndex((m) => m.work_id === saved.work_id);
          if (idx >= 0) next[idx] = saved;
          else next.unshift(saved);
          return next;
        });
      }
      setDirty(false);
      setMessage("保存済み");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  const saveLabel = saving ? "保存中..." : dirty ? "未保存の変更あり" : "保存済み";

  return (
    <main className="min-h-[100dvh] bg-[#0D0F12] text-[#E8E4DF] p-4 md:p-6">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="font-shippori text-2xl font-bold">制作室</h1>
            <p className="text-sm text-[rgba(232,228,223,0.65)]">
              原稿本文は `---` でページ区切りできます。字下げは公開ページ側で自動処理されます。
            </p>
          </div>
          <Link href="/works" className="text-sm text-gold hover:underline">
            番組表へ戻る
          </Link>
        </div>

        {message && (
          <div className="mb-4 rounded border border-[rgba(232,228,223,0.12)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[320px_1fr]">
          <aside className="rounded border border-[rgba(232,228,223,0.08)] bg-[rgba(255,255,255,0.02)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <select
                className="w-full rounded bg-[#151820] px-3 py-2 text-sm"
                value={selectedWorkId}
                onChange={(e) => selectByWorkId(e.target.value)}
              >
                <option value="">作品を選択</option>
                {knownWorks.map((w) => (
                  <option key={w.slug} value={w.slug}>
                    {w.title} ({w.slug})
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="rounded border border-[rgba(232,228,223,0.2)] px-2 py-2 text-xs"
                onClick={() => {
                  setSelectedWorkId("");
                  setForm(EMPTY_FORM);
                  setDirty(false);
                }}
              >
                新規
              </button>
            </div>
            <div className="max-h-[60dvh] overflow-auto">
              {loading ? (
                <div className="text-sm text-[rgba(232,228,223,0.6)]">loading...</div>
              ) : (
                <ul className="space-y-1">
                  {items.map((m) => (
                    <li key={m.work_id}>
                      <button
                        type="button"
                        className={`w-full rounded px-3 py-2 text-left text-sm ${
                          selectedWorkId === m.work_id
                            ? "bg-[rgba(224,90,51,0.2)]"
                            : "bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)]"
                        }`}
                        onClick={() => selectByWorkId(m.work_id)}
                      >
                        <div className="font-shippori">{m.title}</div>
                        <div className="text-xs text-[rgba(232,228,223,0.5)]">{m.work_id}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>

          <section className="rounded border border-[rgba(232,228,223,0.08)] bg-[rgba(255,255,255,0.02)] p-4">
            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="block">
                <div className="mb-1 text-xs text-[rgba(232,228,223,0.6)]">work_id</div>
                <input
                  className="w-full rounded bg-[#151820] px-3 py-2"
                  value={form.work_id}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, work_id: e.target.value }));
                    setDirty(true);
                  }}
                />
              </label>
              <label className="block">
                <div className="mb-1 text-xs text-[rgba(232,228,223,0.6)]">タイトル</div>
                <input
                  className="w-full rounded bg-[#151820] px-3 py-2"
                  value={form.title}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, title: e.target.value }));
                    setDirty(true);
                  }}
                />
              </label>
              <label className="block">
                <div className="mb-1 text-xs text-[rgba(232,228,223,0.6)]">著者</div>
                <input
                  className="w-full rounded bg-[#151820] px-3 py-2"
                  value={form.author}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, author: e.target.value }));
                    setDirty(true);
                  }}
                />
              </label>
              <label className="block">
                <div className="mb-1 text-xs text-[rgba(232,228,223,0.6)]">ステータス</div>
                <input
                  className="w-full rounded bg-[#151820] px-3 py-2"
                  value={form.status}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, status: e.target.value }));
                    setDirty(true);
                  }}
                />
              </label>
              <label className="block md:col-span-2">
                <div className="mb-1 text-xs text-[rgba(232,228,223,0.6)]">REM RHYTHM配置</div>
                <input
                  className="w-full rounded bg-[#151820] px-3 py-2"
                  value={form.position}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, position: e.target.value }));
                    setDirty(true);
                  }}
                />
              </label>
            </div>

            <div className="mb-2 flex items-center gap-2">
              <button
                type="button"
                className="rounded border border-[rgba(232,228,223,0.2)] px-3 py-1.5 text-xs"
                onClick={() => {
                  const next = `${form.body}\n---\n`;
                  setForm((prev) => ({ ...prev, body: next }));
                  setDirty(true);
                }}
              >
                ページ区切り
              </button>
              <button
                type="button"
                className="rounded border border-[rgba(232,228,223,0.2)] px-3 py-1.5 text-xs"
                onClick={() => {
                  const next = `${form.body}\n`;
                  setForm((prev) => ({ ...prev, body: next }));
                  setDirty(true);
                }}
              >
                改行
              </button>
              <span className="ml-auto text-xs text-[rgba(232,228,223,0.6)]">{saveLabel}</span>
            </div>
            <textarea
              className="h-[45dvh] w-full rounded bg-[#101319] p-3 font-shippori text-[15px] leading-8"
              value={form.body}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, body: e.target.value }));
                setDirty(true);
              }}
            />

            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                className="rounded bg-gold px-4 py-2 text-sm text-[#0D0F12] disabled:opacity-50"
                onClick={save}
                disabled={saving}
              >
                保存
              </button>
              {form.work_id ? (
                <Link
                  className="text-sm text-gold hover:underline"
                  href={`/read/${form.work_id}`}
                  target="_blank"
                >
                  プレビューを開く
                </Link>
              ) : (
                <span className="text-xs text-[rgba(232,228,223,0.5)]">
                  work_id を入力するとプレビューできます
                </span>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

