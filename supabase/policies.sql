alter table public.marks enable row level security;

drop policy if exists "marks_public_read" on public.marks;
create policy "marks_public_read"
on public.marks
for select
to anon, authenticated
using (is_public = true);

drop policy if exists "marks_owner_read" on public.marks;
create policy "marks_owner_read"
on public.marks
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "marks_owner_insert" on public.marks;
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

drop policy if exists "marks_owner_update" on public.marks;
create policy "marks_owner_update"
on public.marks
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "marks_owner_delete" on public.marks;
create policy "marks_owner_delete"
on public.marks
for delete
to authenticated
using (auth.uid() = user_id);

revoke all on public.marks from anon;
grant select on public.marks to anon;
grant select, insert, update, delete on public.marks to authenticated;

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
