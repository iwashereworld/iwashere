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
  capsule_date timestamptz,
  capsule_for text not null default 'myself' check (capsule_for in ('myself', 'other')),
  recipient_email text,
  is_public boolean not null default true,
  capsule_status text not null default 'public' check (capsule_status in ('public', 'locked', 'opened')),
  capsule_release_at timestamptz,
  capsule_opened_at timestamptz,
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

create index if not exists marks_created_at_idx on public.marks (created_at desc);
create index if not exists marks_user_id_idx on public.marks (user_id);
create index if not exists marks_public_created_at_idx on public.marks (is_public, created_at desc);
create index if not exists marks_capsule_release_at_idx on public.marks (capsule_release_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.resolve_capsule_release_at(
  capsule_date_input timestamptz,
  capsule_days_input integer,
  created_at_input timestamptz
)
returns timestamptz
language sql
immutable
as $$
  select case
    when capsule_date_input is not null then capsule_date_input
    when coalesce(capsule_days_input, 0) > 0 then created_at_input + make_interval(days => capsule_days_input)
    else null
  end;
$$;

create or replace function public.sync_mark_capsule_state()
returns trigger
language plpgsql
as $$
declare
  now_utc timestamptz := timezone('utc', now());
  release_at timestamptz;
begin
  new.recipient_email := nullif(lower(trim(coalesce(new.recipient_email, ''))), '');
  release_at := public.resolve_capsule_release_at(new.capsule_date, new.capsule_days, coalesce(new.created_at, now_utc));
  new.capsule_release_at := release_at;

  if coalesce(new.capsule_days, 0) <= 0 then
    new.capsule_date := null;
    new.recipient_email := null;
    new.capsule_for := 'myself';
    new.capsule_status := 'public';
    new.capsule_release_at := null;
    new.capsule_opened_at := null;
    new.is_public := true;
    return new;
  end if;

  if release_at is null then
    raise exception 'Capsule release date is required when capsule_days > 0';
  end if;

  if release_at <= now_utc then
    new.capsule_status := 'opened';
    new.capsule_opened_at := coalesce(new.capsule_opened_at, now_utc);
    new.is_public := true;
  else
    new.capsule_status := 'locked';
    new.capsule_opened_at := null;
    new.is_public := false;
  end if;

  return new;
end;
$$;

drop trigger if exists set_marks_updated_at on public.marks;
create trigger set_marks_updated_at
before update on public.marks
for each row
execute function public.set_updated_at();

drop trigger if exists sync_mark_capsule_state_before_write on public.marks;
create trigger sync_mark_capsule_state_before_write
before insert or update of capsule_days, capsule_date, capsule_for, recipient_email, is_public
on public.marks
for each row
execute function public.sync_mark_capsule_state();

comment on table public.marks is 'User-created globe marks and optional capsule metadata.';
comment on column public.marks.recipient_email is 'Sensitive field. Never expose in public read policies.';
comment on column public.marks.capsule_release_at is 'Exact UTC timestamp when the capsule should open.';
comment on column public.marks.capsule_opened_at is 'UTC timestamp when the capsule became visible.';

alter table public.marks add column if not exists is_public boolean not null default true;
alter table public.marks add column if not exists updated_at timestamptz not null default timezone('utc', now());
alter table public.marks add column if not exists capsule_status text not null default 'public';
alter table public.marks add column if not exists capsule_release_at timestamptz;
alter table public.marks add column if not exists capsule_opened_at timestamptz;
alter table public.marks
  alter column capsule_date type timestamptz
  using case
    when capsule_date is null then null
    else capsule_date::timestamp at time zone 'UTC'
  end;
update public.marks
set capsule_for = case
  when capsule_for = 'o' then 'other'
  when capsule_for = 's' then 'myself'
  else capsule_for
end
where capsule_for in ('o', 's');
update public.marks
set recipient_email = nullif(lower(trim(coalesce(recipient_email, ''))), '');
update public.marks
set capsule_release_at = public.resolve_capsule_release_at(capsule_date, capsule_days, created_at),
    capsule_status = case
      when coalesce(capsule_days, 0) <= 0 then 'public'
      when public.resolve_capsule_release_at(capsule_date, capsule_days, created_at) <= timezone('utc', now()) then 'opened'
      else 'locked'
    end,
    capsule_opened_at = case
      when coalesce(capsule_days, 0) > 0 and public.resolve_capsule_release_at(capsule_date, capsule_days, created_at) <= timezone('utc', now())
        then coalesce(capsule_opened_at, timezone('utc', now()))
      else null
    end,
    is_public = case
      when coalesce(capsule_days, 0) <= 0 then true
      when public.resolve_capsule_release_at(capsule_date, capsule_days, created_at) <= timezone('utc', now()) then true
      else false
    end;
