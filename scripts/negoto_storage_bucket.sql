-- Supabase SQL Editor で実行（Storage 用）
-- 寝言帳コラム画像: ブラウザから API 経由でアップロード → 公開 URL を本文に埋め込む
--
-- 手順: Dashboard → Storage → New bucket でも可（名前: negoto-images, Public bucket: ON）
-- こちらは SQL で同等のことをする例です。

INSERT INTO storage.buckets (id, name, public)
VALUES ('negoto-images', 'negoto-images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 匿名でも画像を読める（公開バケットのオブジェクト GET）
-- 既に同名ポリシーがある場合はスキップまたは名前を変えてください。
DROP POLICY IF EXISTS "negoto_images_public_read" ON storage.objects;
CREATE POLICY "negoto_images_public_read"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'negoto-images');

-- アップロードは Next.js の service role（サーバー API）のみ想定。
-- anon / authenticated への INSERT は付けない（勝手に直アップロードされないようにする）。
