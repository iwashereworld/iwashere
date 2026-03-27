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

alter table public.capsules enable row level security;

drop policy if exists "capsules_public_read" on public.capsules;
create policy "capsules_public_read"
on public.capsules
for select
to anon, authenticated
using (visibility = 'public' and status = 'opened');

drop policy if exists "capsules_owner_read" on public.capsules;
create policy "capsules_owner_read"
on public.capsules
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "capsules_owner_insert" on public.capsules;
create policy "capsules_owner_insert"
on public.capsules
for insert
to authenticated
with check (
  auth.uid() = user_id
  and open_at > timezone('utc', now())
  and (
    (recipient_type = 'self' and recipient_email is null)
    or (recipient_type = 'other' and recipient_email is not null)
  )
  and (
    visibility <> 'public'
    or (has_location = true and lat is not null and lon is not null and country_name is not null)
  )
);

drop policy if exists "capsules_owner_update" on public.capsules;
create policy "capsules_owner_update"
on public.capsules
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "capsules_owner_delete" on public.capsules;
create policy "capsules_owner_delete"
on public.capsules
for delete
to authenticated
using (auth.uid() = user_id);

revoke all on public.capsules from anon;
grant select on public.capsules to anon;
grant select, insert, update, delete on public.capsules to authenticated;

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
