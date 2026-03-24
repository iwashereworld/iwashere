create table if not exists public.capsule_deliveries (
  id uuid primary key default gen_random_uuid(),
  mark_id uuid not null references public.marks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  recipient_email text not null check (char_length(recipient_email) <= 254),
  scheduled_for timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'cancelled')),
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
begin
  if new.capsule_days > 0 and new.capsule_for = 'other' and new.recipient_email is not null then
    scheduled_at := coalesce(new.capsule_date::timestamptz, timezone('utc', now()) + make_interval(days => new.capsule_days));

    insert into public.capsule_deliveries (
      mark_id,
      user_id,
      recipient_email,
      scheduled_for,
      payload
    )
    values (
      new.id,
      new.user_id,
      lower(trim(new.recipient_email)),
      scheduled_at,
      jsonb_build_object(
        'mark_id', new.id,
        'country_name', new.country_name,
        'message', new.message
      )
    )
    on conflict (mark_id)
    do update set
      recipient_email = excluded.recipient_email,
      scheduled_for = excluded.scheduled_for,
      payload = excluded.payload,
      status = case
        when public.capsule_deliveries.status = 'sent' then public.capsule_deliveries.status
        else 'pending'
      end,
      last_error = null;
  else
    update public.capsule_deliveries
    set status = 'cancelled'
    where mark_id = new.id and status <> 'sent';
  end if;

  return new;
end;
$$;

drop trigger if exists sync_capsule_delivery_on_marks on public.marks;
create trigger sync_capsule_delivery_on_marks
after insert or update of capsule_days, capsule_date, capsule_for, recipient_email, message, country_name
on public.marks
for each row
execute function public.sync_capsule_delivery();

comment on table public.capsule_deliveries is 'Queue table for future capsule delivery jobs.';
