create extension if not exists pgcrypto;

create table if not exists public.marks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  country_code text not null default '' check (char_length(country_code) <= 8),
  country_name text not null default '' check (char_length(country_name) <= 120),
  lat double precision not null check (lat between -90 and 90),
  lon double precision not null check (lon between -180 and 180),
  message text not null default '' check (char_length(message) <= 500),
  photo text,
  capsule_days integer not null default 0 check (capsule_days between 0 and 9125),
  capsule_date date,
  capsule_for text not null default 'myself' check (capsule_for in ('myself', 'other')),
  recipient_email text,
  is_public boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint marks_capsule_consistency check (
    (capsule_days = 0 and capsule_date is null)
    or (capsule_days > 0)
  ),
  constraint marks_recipient_consistency check (
    (capsule_for = 'myself' and recipient_email is null)
    or (capsule_for = 'other' and recipient_email is not null)
    or (capsule_days = 0 and recipient_email is null)
  )
);

alter table public.marks add column if not exists is_public boolean not null default true;
alter table public.marks add column if not exists updated_at timestamptz not null default timezone('utc', now());
update public.marks
set capsule_for = case
  when capsule_for = 'o' then 'other'
  when capsule_for = 's' then 'myself'
  else capsule_for
end
where capsule_for in ('o', 's');

create index if not exists marks_created_at_idx on public.marks (created_at desc);
create index if not exists marks_user_id_idx on public.marks (user_id);
create index if not exists marks_public_created_at_idx on public.marks (is_public, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_marks_updated_at on public.marks;
create trigger set_marks_updated_at
before update on public.marks
for each row
execute function public.set_updated_at();

comment on table public.marks is 'User-created globe marks and optional capsule metadata.';
comment on column public.marks.recipient_email is 'Sensitive field. Never expose in public read policies.';
