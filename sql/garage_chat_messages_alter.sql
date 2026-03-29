-- 手作業でテーブルを先に作った場合の追補用（カラム不足のときだけ実行）
-- アプリは is_system / created_at を前提にしています。

alter table public.garage_chat_messages
  add column if not exists is_system boolean not null default false;

alter table public.garage_chat_messages
  add column if not exists created_at timestamptz not null default now();
