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
    or (capsule_days > 0)
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
