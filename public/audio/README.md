# 音声アセット（ねむみ / その他）

## Supabase 管理（推奨）

本番では **`/admin/nemumi-audio?token=…`** からブラウザアップロードし、Storage `nemumi-audio` + テーブル `nemumi_audio_assets` に登録します。ねむみ放送は `/api/nemumi-audio` で公開 URL を取得します。

## ローカル `public/audio`（フォールバック）

DB に未登録のときは `nemumi-audio-registry.ts` の既定パス（例: `/audio/bgm/clock.mp3`）を参照します。

- `bgm/` … BGM 用 MP3
- `se/` … 効果音・寝息・柱時計など

空の Git 追跡用に各フォルダに `.gitkeep` があります。
