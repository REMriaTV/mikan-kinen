-- ねむみ音素材メタデータ（実ファイルは Storage バケット nemumi-audio）
create table if not exists public.nemumi_audio_assets (
  track_id text primary key,
  storage_path text not null,
  public_url text not null,
  updated_at timestamptz not null default now()
);

comment on table public.nemumi_audio_assets is 'ねむみ放送の音源URL（Supabase Storage 公開URL）。track_id はアプリのレジストリと一致。';

alter table public.nemumi_audio_assets enable row level security;

-- 匿名は読めない（公開URLは Next の API 経由で配る想定）。サービスロールはバイパス。
create policy "Service role full access nemumi_audio_assets"
  on public.nemumi_audio_assets
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
