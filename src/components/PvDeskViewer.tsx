"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  PV_BOARD_DEFAULT_SLUG,
  defaultPvBoardData,
  type PvBoardCut,
  type PvBoardData,
} from "@/lib/pv-board";
import { parseYoutubeId } from "@/lib/pv-youtube";

function formatSecLabel(n?: number): string | null {
  if (n == null || !Number.isFinite(n)) return null;
  if (Number.isInteger(n)) return `${n}秒`;
  return `${n.toFixed(1)}秒`;
}

function CutAudioPublic({ cut }: { cut: PvBoardCut }) {
  const url = cut.audioUrl?.trim();
  if (!url) return null;
  const start = formatSecLabel(cut.audioStartSec);
  const end = formatSecLabel(cut.audioEndSec);
  const rangeHint =
    start && end ? `${start}〜${end} 付近` : start ? `${start}から` : end ? `${end}まで` : null;

  return (
    <div className="mt-4 rounded border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.25)] p-3">
      <p className="mb-2 text-[0.65rem] tracking-[0.2em] text-[rgba(232,228,223,0.45)]">音源</p>
      <audio controls className="w-full max-w-md" src={url} preload="metadata">
        お使いのブラウザは audio 要素に対応していません。
      </audio>
      {rangeHint ? (
        <p className="mt-2 text-xs text-dim">参照位置の目安: {rangeHint}（プレーヤーで該当箇所まで移動してください）</p>
      ) : null}
    </div>
  );
}

export default function PvDeskViewer() {
  const [board, setBoard] = useState<PvBoardData | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ytPlaying, setYtPlaying] = useState(false);
  const [ytThumbFail, setYtThumbFail] = useState(false);

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
    <div className="space-y-12 text-[#E8E4DF]">
      {loadError ? (
        <div className="space-y-3 rounded border border-[#6b3410] bg-[rgba(107,52,16,0.2)] px-4 py-3 text-sm text-[#f4a261]">
          <p>
            {loadError}
            <span className="text-[rgba(232,228,223,0.75)]">（そのため、いまはサンプルデータを表示しています）</span>
          </p>
          {(loadError.includes("pv_production_boards") || loadError.includes("schema cache")) && (
            <div className="border-t border-[rgba(255,255,255,0.1)] pt-3 text-[0.85rem] leading-relaxed text-[#E8E4DF]">
              <p className="mb-2 font-shippori text-[#f4a261]">Supabase 側のチェックリスト</p>
              <ol className="list-decimal space-y-1 pl-5 text-secondary">
                <li>
                  <span className="text-[#E8E4DF]">Vercel の環境変数</span>
                  <code className="mx-1 text-[0.75rem] text-gold">SUPABASE_URL</code>
                  が指しているプロジェクトを開き、
                  <span className="text-[#E8E4DF]">そのプロジェクト</span>
                  の SQL Editor で<code className="mx-1 text-[0.75rem] text-gold">sql/pv_production_board.sql</code>
                  を実行してください（別プロジェクトに流すとこうなります）。
                </li>
                <li>
                  Table Editor に<code className="mx-1 text-[0.75rem] text-gold">pv_production_boards</code>
                  があるのにこの文句だけ出るときは、作成直後で API のスキーマキャッシュが追いついていないことがあります。数分待ってから再読み込みしてください。
                </li>
              </ol>
            </div>
          )}
        </div>
      ) : null}

      <header className="border-b border-[rgba(255,255,255,0.08)] pb-8">
        <p className="mb-2 text-[0.6rem] tracking-[0.45em] text-[rgba(232,228,223,0.55)]">LEMURIA TV / 制作進行（公開）</p>
        <h1 className="font-shippori text-2xl font-bold tracking-tight md:text-3xl">{board.title}</h1>
        {updatedAt ? (
          <p className="mt-3 text-xs text-dim">更新: {new Date(updatedAt).toLocaleString("ja-JP")}</p>
        ) : (
          <p className="mt-3 text-xs text-dim">データはまだサーバーにありません（編集ページから保存すると反映されます）。</p>
        )}
      </header>

      {youtubeId ? (
        <section>
          <h2 className="mb-4 text-xs tracking-[0.35em] text-dim">参照動画</h2>
          <div
            className="relative w-full overflow-hidden rounded-lg border border-[rgba(255,255,255,0.08)] bg-black/40"
            style={{ aspectRatio: "16 / 9" }}
          >
            {!ytPlaying ? (
              <button
                type="button"
                onClick={() => setYtPlaying(true)}
                className="group relative block h-full w-full cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E05A33] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0c]"
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
              <iframe
                title="参照動画"
                src={embedSrc}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}
          </div>
        </section>
      ) : null}

      <section className="space-y-10">
        <h2 className="text-xs tracking-[0.35em] text-dim">シーン</h2>
        {board.cuts.length === 0 ? (
          <p className="text-sm text-dim">カットがまだありません。</p>
        ) : (
          board.cuts.map((cut, index) => (
            <article
              key={cut.id}
              className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0D0F12] shadow-[0_8px_40px_rgba(0,0,0,0.35)]"
            >
              <div className="grid gap-0 md:grid-cols-[minmax(0,280px)_1fr]">
                <div className="relative aspect-video w-full bg-[rgba(255,255,255,0.03)] md:aspect-auto md:min-h-[200px]">
                  {cut.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cut.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full min-h-[160px] items-center justify-center p-4 text-center text-sm text-dim">
                      画像なし
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-4 p-6">
                  <div>
                    <span className="text-[0.65rem] tracking-[0.25em] text-gold">CUT {index + 1}</span>
                    <h3 className="font-shippori text-xl text-[#E8E4DF]">
                      {cut.sceneTitle || "無題"}
                      {cut.section ? (
                        <span className="ml-2 text-base font-normal text-dim">／ {cut.section}</span>
                      ) : null}
                    </h3>
                    {(cut.timecodeStart || cut.timecodeEnd) && (
                      <p className="mt-1 font-mono text-xs text-dim">
                        {cut.timecodeStart || "—"} … {cut.timecodeEnd || "—"}
                      </p>
                    )}
                  </div>

                  {(cut.direction || cut.visual) && (
                    <div>
                      <h4 className="mb-1 text-[0.65rem] tracking-[0.2em] text-[rgba(232,228,223,0.45)]">説明</h4>
                      {cut.direction ? (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-secondary">{cut.direction}</p>
                      ) : null}
                      {cut.visual ? (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-secondary">
                          <span className="text-dim">映像イメージ: </span>
                          {cut.visual}
                        </p>
                      ) : null}
                    </div>
                  )}

                  {cut.viewerMemo?.trim() ? (
                    <div>
                      <h4 className="mb-1 text-[0.65rem] tracking-[0.2em] text-[rgba(232,228,223,0.45)]">メモ</h4>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-secondary">{cut.viewerMemo}</p>
                    </div>
                  ) : null}

                  {cut.lyricsPart?.trim() ? (
                    <div>
                      <h4 className="mb-1 text-[0.65rem] tracking-[0.2em] text-[rgba(232,228,223,0.45)]">歌詞・曲</h4>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#e8dfd6]">{cut.lyricsPart}</p>
                    </div>
                  ) : null}

                  <CutAudioPublic cut={cut} />
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      {board.processLog.length > 0 ? (
        <section className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#0D0F12] p-6">
          <h2 className="mb-4 text-xs tracking-[0.35em] text-dim">制作の記録</h2>
          <ul className="space-y-4">
            {board.processLog.map((e, i) => (
              <li key={`${e.at}-${i}`} className="border-b border-[rgba(255,255,255,0.06)] pb-4 last:border-0 last:pb-0">
                <time className="block text-xs text-dim">{new Date(e.at).toLocaleString("ja-JP")}</time>
                <p className="mt-1 text-sm leading-relaxed text-secondary">{e.message}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
