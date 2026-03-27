create table if not exists public.capsule_deliveries (
  id uuid primary key default gen_random_uuid(),
  mark_id uuid not null references public.marks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  delivery_kind text not null check (delivery_kind in ('self_reveal', 'gift_delivery')),
  recipient_email text check (recipient_email is null or char_length(recipient_email) <= 254),
  scheduled_for timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'revealed', 'failed', 'cancelled')),
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  sent_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (mark_id)
);

create index if not exists capsule_deliveries_status_scheduled_idx
  on public.capsule_deliveries (status, scheduled_for);

create index if not exists capsule_deliveries_user_id_idx
  on public.capsule_deliveries (user_id);

drop trigger if exists set_capsule_deliveries_updated_at on public.capsule_deliveries;
create trigger set_capsule_deliveries_updated_at
before update on public.capsule_deliveries
for each row
execute function public.set_updated_at();

create or replace function public.sync_capsule_delivery()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  scheduled_at timestamptz;
  queue_kind text;
begin
  if coalesce(new.capsule_days, 0) > 0 then
    scheduled_at := public.resolve_capsule_release_at(new.capsule_date, new.capsule_days, new.created_at);
    queue_kind := case
      when new.capsule_for = 'other' and new.recipient_email is not null then 'gift_delivery'
      else 'self_reveal'
    end;

    insert into public.capsule_deliveries (
      mark_id,
      user_id,
      delivery_kind,
      recipient_email,
      scheduled_for,
      payload
    )
    values (
      new.id,
      new.user_id,
      queue_kind,
      case when queue_kind = 'gift_delivery' then lower(trim(new.recipient_email)) else null end,
      scheduled_at,
      jsonb_build_object(
        'mark_id', new.id::text,
        'country_name', new.country_name,
        'message', new.message,
        'owner_name', new.name,
        'capsule_for', new.capsule_for
      )
    )
    on conflict (mark_id)
    do update set
      delivery_kind = excluded.delivery_kind,
      recipient_email = excluded.recipient_email,
      scheduled_for = excluded.scheduled_for,
      payload = excluded.payload,
      status = case
        when public.capsule_deliveries.status in ('sent', 'revealed') then public.capsule_deliveries.status
        else 'pending'
      end,
      last_error = null;
  else
    update public.capsule_deliveries
    set status = 'cancelled',
        last_error = null
    where mark_id = new.id and status not in ('sent', 'revealed');
  end if;

  return new;
end;
$$;

create or replace function public.claim_due_capsule_deliveries(batch_size integer default 20)
returns setof public.capsule_deliveries
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with picked as (
    select id
    from public.capsule_deliveries
    where status = 'pending'
      and scheduled_for <= timezone('utc', now())
    order by scheduled_for asc
    for update skip locked
    limit batch_size
  ),
  updated as (
    update public.capsule_deliveries d
    set status = 'processing',
        last_error = null
    from picked
    where d.id = picked.id
    returning d.*
  )
  select * from updated;
end;
$$;

drop trigger if exists sync_capsule_delivery_on_marks on public.marks;
create trigger sync_capsule_delivery_on_marks
after insert or update of capsule_days, capsule_date, capsule_for, recipient_email, message, country_name, name
on public.marks
for each row
execute function public.sync_capsule_delivery();

update public.capsule_deliveries
set delivery_kind = case
      when recipient_email is not null then 'gift_delivery'
      else 'self_reveal'
    end,
    mark_id = mark_id::uuid,
    status = case
      when status = 'sent' and recipient_email is null then 'revealed'
      when status = 'sent' then 'sent'
      when status = 'failed' then 'failed'
      when status = 'cancelled' then 'cancelled'
      else 'pending'
    end;

comment on table public.capsule_deliveries is 'Queue table for capsule reveals and recipient deliveries.';

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
