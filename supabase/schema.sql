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

create table if not exists public.capsules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  owner_email text not null check (char_length(owner_email) <= 254),
  message text not null default '' check (char_length(message) <= 500),
  occasion text not null default 'future_self' check (occasion in ('future_self', 'birthday', 'anniversary', 'gift', 'custom')),
  recipient_type text not null default 'self' check (recipient_type in ('self', 'other')),
  recipient_email text,
  visibility text not null default 'private' check (visibility in ('private', 'public', 'email')),
  open_at timestamptz not null,
  has_location boolean not null default false,
  country_code text check (country_code is null or char_length(country_code) <= 8),
  country_name text check (country_name is null or char_length(country_name) <= 120),
  lat double precision check (lat is null or lat between -90 and 90),
  lon double precision check (lon is null or lon between -180 and 180),
  photo text,
  status text not null default 'scheduled' check (status in ('scheduled', 'opened', 'cancelled')),
  delivery_status text not null default 'pending' check (delivery_status in ('pending', 'recipient_sent', 'owner_sent', 'completed', 'failed')),
  opened_at timestamptz,
  recipient_notified_at timestamptz,
  owner_notified_at timestamptz,
  published_mark_id uuid references public.marks(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint capsules_recipient_consistency check (
    (recipient_type = 'self' and recipient_email is null)
    or (recipient_type = 'other' and recipient_email is not null)
  ),
  constraint capsules_public_location_consistency check (
    (visibility <> 'public')
    or (has_location = true and lat is not null and lon is not null and country_name is not null)
  ),
  constraint capsules_location_consistency check (
    (has_location = false and lat is null and lon is null and country_code is null and country_name is null)
    or (has_location = true and lat is not null and lon is not null and country_name is not null)
  )
);

create index if not exists capsules_user_id_idx on public.capsules (user_id);
create index if not exists capsules_status_open_at_idx on public.capsules (status, open_at);
create index if not exists capsules_visibility_status_idx on public.capsules (visibility, status, open_at desc);

create table if not exists public.capsule_dispatch_queue (
  id uuid primary key default gen_random_uuid(),
  capsule_id uuid not null unique references public.capsules(id) on delete cascade,
  scheduled_for timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  processed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists capsule_dispatch_queue_status_scheduled_idx
  on public.capsule_dispatch_queue (status, scheduled_for);

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

drop trigger if exists set_capsules_updated_at on public.capsules;
create trigger set_capsules_updated_at
before update on public.capsules
for each row
execute function public.set_updated_at();

drop trigger if exists set_capsule_dispatch_queue_updated_at on public.capsule_dispatch_queue;
create trigger set_capsule_dispatch_queue_updated_at
before update on public.capsule_dispatch_queue
for each row
execute function public.set_updated_at();

drop trigger if exists sync_mark_capsule_state_before_write on public.marks;
create trigger sync_mark_capsule_state_before_write
before insert or update of capsule_days, capsule_date, capsule_for, recipient_email, is_public
on public.marks
for each row
execute function public.sync_mark_capsule_state();

create or replace function public.sync_capsule_dispatch_queue()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.owner_email := lower(trim(new.owner_email));
  new.recipient_email := nullif(lower(trim(coalesce(new.recipient_email, ''))), '');

  if new.status = 'scheduled' then
    insert into public.capsule_dispatch_queue (
      capsule_id,
      scheduled_for,
      status,
      attempts,
      last_error,
      processed_at
    )
    values (
      new.id,
      new.open_at,
      'pending',
      0,
      null,
      null
    )
    on conflict (capsule_id)
    do update set
      scheduled_for = excluded.scheduled_for,
      status = case
        when public.capsule_dispatch_queue.status = 'completed' then public.capsule_dispatch_queue.status
        else 'pending'
      end,
      attempts = case
        when public.capsule_dispatch_queue.status = 'completed' then public.capsule_dispatch_queue.attempts
        else 0
      end,
      last_error = null,
      processed_at = null;
  else
    update public.capsule_dispatch_queue
    set status = 'cancelled',
        last_error = null
    where capsule_id = new.id and status <> 'completed';
  end if;

  return new;
end;
$$;

create or replace function public.claim_due_capsule_dispatches(batch_size integer default 20)
returns setof public.capsule_dispatch_queue
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with picked as (
    select id
    from public.capsule_dispatch_queue
    where status = 'pending'
      and scheduled_for <= timezone('utc', now())
    order by scheduled_for asc
    for update skip locked
    limit batch_size
  ),
  updated as (
    update public.capsule_dispatch_queue q
    set status = 'processing',
        last_error = null
    from picked
    where q.id = picked.id
    returning q.*
  )
  select * from updated;
end;
$$;

drop trigger if exists sync_capsule_dispatch_queue_after_write on public.capsules;
create trigger sync_capsule_dispatch_queue_after_write
after insert or update of open_at, status, recipient_type, recipient_email, visibility, has_location, lat, lon, country_code, country_name, name, owner_email, message, occasion
on public.capsules
for each row
execute function public.sync_capsule_dispatch_queue();

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
