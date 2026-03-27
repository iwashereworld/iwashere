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

drop trigger if exists sync_capsule_delivery_on_marks on public.marks;
create trigger sync_capsule_delivery_on_marks
after insert or update of capsule_days, capsule_date, capsule_for, recipient_email, message, country_name, name
on public.marks
for each row
execute function public.sync_capsule_delivery();
