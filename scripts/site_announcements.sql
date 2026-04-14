-- Supabase SQL Editor で実行
-- トップヘッダー「お知らせ」折りたたみ用

CREATE TABLE IF NOT EXISTS site_announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  link_url TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS site_announcements_published_at
  ON site_announcements (published, published_at DESC);

-- サンプル行の例（必要なら1回だけ実行）
-- INSERT INTO site_announcements (title, summary, link_url, published, published_at)
-- VALUES (
--   'コラムページを更新しました',
--   'レムの波打ち際より、画像を載せられるようになりました。',
--   '/negoto',
--   true,
--   NOW()
-- );
