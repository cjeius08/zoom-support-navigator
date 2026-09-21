-- Consolidate owner and creator-admin DELETE access into one permissive
-- policy so Postgres evaluates a single DELETE policy for authenticated users.

drop policy if exists "creator admin call notes delete" on public.zoom_call_notes;
drop policy if exists "own call notes delete" on public.zoom_call_notes;
drop policy if exists "own or admin call notes delete" on public.zoom_call_notes;

create policy "own or admin call notes delete"
on public.zoom_call_notes
for delete
to authenticated
using (
  (
    (select auth.uid()) = user_id
    and private.zoom_has_valid_access()
  )
  or private.zoom_is_creator_admin()
);
