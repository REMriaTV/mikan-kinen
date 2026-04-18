-- 播州サバイブ「町内環境PV」等の制作ボード（絵コンテ・歌詞・撮影メモを JSON で保持）
-- Supabase SQL Editor で実行してください。
--
-- 【重要】必ずこのファイルを 1 行目から最後までまとめて実行してください。
-- 「Storage:」以降だけを流すとバケットだけ作られ、pv_production_boards テーブルは
-- 作成されません（その場合、制作デスクの保存はずっと失敗します）。

CREATE TABLE IF NOT EXISTS pv_production_boards (
  slug TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pv_production_boards_updated_at_idx
  ON pv_production_boards (updated_at DESC);

COMMENT ON TABLE pv_production_boards IS 'PV制作ボード（Next API が service role で読み書き）';

-- Storage: 手書き絵コンテ・参考画像（公開読み取り、アップロードは API のみ想定）
INSERT INTO storage.buckets (id, name, public)
VALUES ('pv-storyboard', 'pv-storyboard', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "pv_storyboard_public_read" ON storage.objects;
CREATE POLICY "pv_storyboard_public_read"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'pv-storyboard');
