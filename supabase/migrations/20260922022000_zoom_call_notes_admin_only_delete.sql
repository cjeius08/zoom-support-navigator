-- Saved call notes may be created and updated by their owner, but deletion is
-- reserved for the creator admin so retention and follow-up history cannot be
-- removed by an agent from the personal Call Documentation panel.

drop policy if exists "own or admin call notes delete" on public.zoom_call_notes;
drop policy if exists "own call notes delete" on public.zoom_call_notes;
drop policy if exists "creator admin call notes delete" on public.zoom_call_notes;
drop policy if exists "creator admin only call notes delete" on public.zoom_call_notes;

create policy "creator admin only call notes delete"
on public.zoom_call_notes
for delete
to authenticated
using (private.zoom_is_creator_admin());
