alter table public.marks add column if not exists capsule_status text not null default 'public';
alter table public.marks add column if not exists capsule_release_at timestamptz;
alter table public.marks add column if not exists capsule_opened_at timestamptz;

alter table public.marks
  drop constraint if exists marks_capsule_consistency;

alter table public.marks
  drop constraint if exists marks_capsule_recipient_consistency;

update public.marks
set capsule_for = case
  when capsule_for = 'o' then 'other'
  when capsule_for = 's' then 'myself'
  when capsule_for = 'other' and nullif(lower(trim(coalesce(recipient_email, ''))), '') is null then 'myself'
  else coalesce(capsule_for, 'myself')
end;

update public.marks
set recipient_email = nullif(lower(trim(coalesce(recipient_email, ''))), '');

update public.marks
set recipient_email = null,
    capsule_for = 'myself'
where coalesce(capsule_days, 0) <= 0
   or capsule_for = 'myself';

alter table public.marks
  add constraint marks_capsule_consistency check (
    (capsule_days = 0 and capsule_date is null)
    or (capsule_days > 0)
  );

alter table public.marks
  add constraint marks_capsule_recipient_consistency check (
    (capsule_for = 'myself' and recipient_email is null)
    or (capsule_for = 'other' and recipient_email is not null)
    or (capsule_days = 0 and recipient_email is null)
  );

drop policy if exists "marks_owner_insert" on public.marks;
drop trigger if exists sync_capsule_delivery_on_marks on public.marks;

alter table public.marks
  alter column capsule_date type timestamptz
  using case
    when capsule_date is null then null
    else capsule_date::timestamp at time zone 'UTC'
  end;

create index if not exists marks_capsule_release_at_idx on public.marks (capsule_release_at);

create or replace function public.resolve_capsule_release_at(
  capsule_date_input timestamptz,
  capsule_days_input integer,
  created_at_input timestamptz
)
returns timestamptz
language sql
stable
as $$
  select case
    when capsule_date_input is not null then capsule_date_input
    when coalesce(capsule_days_input, 0) > 0 then created_at_input + make_interval(days => capsule_days_input)
    else null
  end
$$;

create or replace function public.sync_mark_capsule_state()
returns trigger
language plpgsql
as $$
declare
  now_utc timestamptz := timezone('utc', now());
  release_at timestamptz;
begin
  new.capsule_for := case
    when new.capsule_for in ('o', 'other') then 'other'
    else 'myself'
  end;
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
    new.is_public := true;
    new.capsule_status := 'opened';
    new.capsule_opened_at := coalesce(new.capsule_opened_at, now_utc);
  else
    new.is_public := false;
    new.capsule_status := 'locked';
    new.capsule_opened_at := null;
  end if;

  return new;
end
$$;

drop trigger if exists sync_mark_capsule_state_before_write on public.marks;
create trigger sync_mark_capsule_state_before_write
before insert or update of capsule_days, capsule_date, capsule_for, recipient_email, is_public
on public.marks
for each row
execute function public.sync_mark_capsule_state();

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

alter table public.capsule_deliveries add column if not exists delivery_kind text;
alter table public.capsule_deliveries alter column recipient_email drop not null;

alter table public.capsule_deliveries
  drop constraint if exists capsule_deliveries_delivery_kind_check;

alter table public.capsule_deliveries
  add constraint capsule_deliveries_delivery_kind_check
  check (delivery_kind in ('self_reveal', 'gift_delivery'));

alter table public.capsule_deliveries
  drop constraint if exists capsule_deliveries_status_check;

alter table public.capsule_deliveries
  add constraint capsule_deliveries_status_check
  check (status in ('pending', 'processing', 'sent', 'revealed', 'failed', 'cancelled'));

create or replace function public.sync_capsule_delivery()
returns trigger
language plpgsql
as $$
declare
  scheduled_at timestamptz;
  queue_kind text;
begin
  if tg_op = 'DELETE' then
    update public.capsule_deliveries
    set status = 'cancelled'
    where mark_id = old.id and status in ('pending', 'processing');
    return old;
  end if;

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
      country_name,
      scheduled_for,
      status,
      payload
    ) values (
      new.id,
      new.user_id,
      queue_kind,
      case when queue_kind = 'gift_delivery' then lower(trim(new.recipient_email)) else null end,
      new.country_name,
      scheduled_at,
      'pending',
      jsonb_build_object(
        'mark_name', new.name,
        'message', new.message,
        'country_name', new.country_name,
        'capsule_for', new.capsule_for
      )
    )
    on conflict (mark_id) do update
    set delivery_kind = excluded.delivery_kind,
        recipient_email = excluded.recipient_email,
        country_name = excluded.country_name,
        scheduled_for = excluded.scheduled_for,
        payload = excluded.payload,
        status = case
          when public.capsule_deliveries.status in ('sent', 'revealed') then public.capsule_deliveries.status
          else 'pending'
        end,
        last_error = null;
  else
    update public.capsule_deliveries
    set status = 'cancelled'
    where mark_id = new.id and status in ('pending', 'processing');
  end if;

  return new;
end
$$;

create or replace function public.claim_due_capsule_deliveries(batch_size integer default 20)
returns setof public.capsule_deliveries
language plpgsql
as $$
begin
  return query
  with claimed as (
    select id
    from public.capsule_deliveries
    where status = 'pending'
      and scheduled_for <= timezone('utc', now())
    order by scheduled_for asc
    limit greatest(batch_size, 1)
    for update skip locked
  ), updated as (
    update public.capsule_deliveries d
    set status = 'processing',
        attempts = coalesce(d.attempts, 0) + 1,
        last_error = null
    from claimed
    where d.id = claimed.id
    returning d.*
  )
  select * from updated;
end
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
    status = case
      when status = 'sent' and recipient_email is null then 'revealed'
      else status
    end
where delivery_kind is null
   or (status = 'sent' and recipient_email is null);
create policy "marks_owner_insert"
on public.marks
for insert
to authenticated
with check (
  auth.uid() = user_id
  and (
    (capsule_days = 0 and capsule_date is null and recipient_email is null and capsule_for = 'myself')
    or (
      capsule_days > 0
      and capsule_date is not null
      and (
        (capsule_for = 'myself' and recipient_email is null)
        or (capsule_for = 'other' and recipient_email is not null)
      )
    )
  )
);
