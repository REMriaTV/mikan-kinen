-- ねむみ BGM / 効果音などの「枠」（track_id・表示名・並び）。空のときはコードのレジストリにフォールバック。
create table if not exists public.nemumi_audio_tracks (
  track_id text primary key,
  category text not null check (category in ('bgm', 'se', 'interactive', 'extra')),
  label text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists nemumi_audio_tracks_category_sort_idx
  on public.nemumi_audio_tracks (category, sort_order, track_id);

comment on table public.nemumi_audio_tracks is 'ねむみ音素材マスタ（表示名・種類・並び）。空のときは API がコード既定を自動投入。追加・編集・削除は管理画面から。';

alter table public.nemumi_audio_tracks enable row level security;

create policy "Service role full access nemumi_audio_tracks"
  on public.nemumi_audio_tracks
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
