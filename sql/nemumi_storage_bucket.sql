-- Supabase Dashboard → Storage でバケットを作成してもよい。SQL で作る場合の例:
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'nemumi-audio',
  'nemumi-audio',
  true,
  52428800,
  array['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/mp4']::text[]
)
on conflict (id) do nothing;

-- 公開読み取り（匿名でもオブジェクトURLにアクセス可）
create policy "Public read nemumi-audio objects"
  on storage.objects
  for select
  using (bucket_id = 'nemumi-audio');

-- アップロードは API（service role）のみ想定。anon の直接 upload は許可しない。
