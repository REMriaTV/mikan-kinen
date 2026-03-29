-- REM Chat（garage-v2）テキストチャットの永続化用
-- Supabase SQL Editor で実行してください。

create table if not exists public.garage_chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_key text not null default 'garage-room',
  from_name text not null,
  body text not null,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_garage_chat_room_created
  on public.garage_chat_messages (room_key, created_at desc);

comment on table public.garage_chat_messages is 'REM Chat テキストログ（後から入室した参加者も閲覧可）';

-- サービスロール経由の API のみで読み書きする想定のため RLS は任意です。
-- 公開クライアントから直接触らせない場合は RLS を有効にし、anon を拒否してください。
