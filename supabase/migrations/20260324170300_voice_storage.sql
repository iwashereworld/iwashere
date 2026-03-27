insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'voice-messages',
  'voice-messages',
  false,
  10485760,
  array['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.voice_messages (
  id uuid primary key default gen_random_uuid(),
  mark_id text,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique,
  mime_type text not null,
  bytes integer not null check (bytes > 0 and bytes <= 10485760),
  duration_seconds integer check (duration_seconds is null or duration_seconds between 1 and 600),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists voice_messages_user_id_idx on public.voice_messages (user_id);
create index if not exists voice_messages_mark_id_idx on public.voice_messages (mark_id);

alter table public.voice_messages enable row level security;

drop policy if exists "voice_messages_owner_read" on public.voice_messages;
create policy "voice_messages_owner_read"
on public.voice_messages
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "voice_messages_owner_insert" on public.voice_messages;
create policy "voice_messages_owner_insert"
on public.voice_messages
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "voice_messages_owner_delete" on public.voice_messages;
create policy "voice_messages_owner_delete"
on public.voice_messages
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "voice_messages_owner_update" on public.voice_messages;
create policy "voice_messages_owner_update"
on public.voice_messages
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "voice_bucket_owner_read" on storage.objects;
create policy "voice_bucket_owner_read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'voice-messages'
  and owner = auth.uid()
);

drop policy if exists "voice_bucket_owner_insert" on storage.objects;
create policy "voice_bucket_owner_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'voice-messages'
  and owner = auth.uid()
);

drop policy if exists "voice_bucket_owner_delete" on storage.objects;
create policy "voice_bucket_owner_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'voice-messages'
  and owner = auth.uid()
);

comment on table public.voice_messages is 'Private voice uploads associated with user marks.';
