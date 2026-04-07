# 音声アセット（ねむみ / その他）

## Supabase 管理（推奨）

素材マスタは **`nemumi_audio_tracks`**（初回 `/api/nemumi-audio` 等でコード既定が自動投入）。**`/admin/nemumi-audio?token=…`** で素材の追加・編集・削除と、Storage `nemumi-audio` + **`nemumi_audio_assets`** への音源アップロードができます。公開は **`/api/nemumi-audio`** です。

## ローカル `public/audio`（フォールバック）

DB に未登録のときは `nemumi-audio-registry.ts` の既定パス（例: `/audio/bgm/clock.mp3`）を参照します。

- `bgm/` … BGM 用 MP3
- `se/` … 効果音・寝息・柱時計など

空の Git 追跡用に各フォルダに `.gitkeep` があります。
