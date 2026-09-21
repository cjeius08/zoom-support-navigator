-- Allow only the creator admin to delete another user's protected saved call note.
-- Agents keep the existing owner-only delete policy.

drop policy if exists "creator admin call notes delete" on public.zoom_call_notes;
create policy "creator admin call notes delete"
on public.zoom_call_notes
for delete
to authenticated
using (private.zoom_is_creator_admin());
