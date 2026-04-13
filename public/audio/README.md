# 音声アセット（ねむみ / その他）

## Supabase 管理（推奨）

素材マスタは **`nemumi_audio_tracks`**（初回 `/api/nemumi-audio` 等でコード既定が自動投入）。**`/admin/nemumi-audio?token=…`** で素材の追加・編集・削除と、Storage `nemumi-audio` + **`nemumi_audio_assets`** への音源アップロードができます。公開は **`/api/nemumi-audio`** です。

## ローカル `public/audio`（フォールバック）

DB に未登録のときは `nemumi-audio-registry.ts` の既定パス（例: `/audio/bgm/clock.mp3`）を参照します。

- `bgm/` … BGM 用 MP3
- `se/` … 効果音・寝息・柱時計など
- `opening/` … REM Chat 開局前 BGM（`pre-broadcast.mp3`）・オープニング（`opening.mp3`）
- `ending/` … エンディング（`ending.mp3`）
- `music/` … フル尺楽曲（将来用）

空の Git 追跡用に各フォルダに `.gitkeep` があります。

### REM Chat（garage-v2）音楽パネル

管理者は **`/garage-v2?bat=ADMIN_BROADCAST_TOKEN`** で入室すると音楽パネルが表示されます（URL は履歴から除去されます）。参加者にはパネルは出ません。

音楽パネルで **カスタムトラック** を選ぶと、ミックスを Daily の `remMusic` として送信します（**HTML Audio** に切り替えると従来の `sendAppMessage` 方式に戻ります）。
