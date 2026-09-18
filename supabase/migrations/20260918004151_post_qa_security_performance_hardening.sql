-- Remove client access to the internal event-trigger helper.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- Keep extensions out of the exposed public schema.
alter extension citext set schema extensions;

-- Foreign-key indexes flagged by the performance advisor.
create index if not exists zoom_admin_events_actor_user_id_idx
  on private.zoom_admin_events(actor_user_id);
create index if not exists zoom_admin_events_target_user_id_idx
  on private.zoom_admin_events(target_user_id);
create index if not exists zoom_admin_notifications_subject_user_id_idx
  on private.zoom_admin_notifications(subject_user_id);
create index if not exists zoom_invites_created_by_idx
  on private.zoom_invites(created_by);
create index if not exists zoom_invites_used_by_idx
  on private.zoom_invites(used_by);
create index if not exists zoom_agent_slots_claimed_by_idx
  on public.zoom_agent_slots(claimed_by);
create index if not exists zoom_agent_slots_created_by_idx
  on public.zoom_agent_slots(created_by);
create index if not exists zoom_feedback_status_history_changed_by_idx
  on public.zoom_feedback_status_history(changed_by);

-- Preserve authorization semantics while avoiding per-row auth.uid() re-evaluation.
drop policy if exists "self or JA reads profiles" on public.zoom_profiles;
create policy "self or JA reads profiles"
  on public.zoom_profiles for select to authenticated
  using ((((select auth.uid()) = id) and private.zoom_has_valid_access()) or private.zoom_is_creator_admin());

drop policy if exists "users update own avatar" on public.zoom_profiles;
create policy "users update own avatar"
  on public.zoom_profiles for update to authenticated
  using (((select auth.uid()) = id) and private.zoom_has_valid_access())
  with check (((select auth.uid()) = id) and private.zoom_has_valid_access());

drop policy if exists "own event insert" on public.zoom_usage_events;
create policy "own event insert"
  on public.zoom_usage_events for insert to authenticated
  with check (((select auth.uid()) = user_id) and private.zoom_has_valid_access());

drop policy if exists "own or JA events" on public.zoom_usage_events;
create policy "own or JA events"
  on public.zoom_usage_events for select to authenticated
  using ((((select auth.uid()) = user_id) and private.zoom_has_valid_access()) or private.zoom_is_creator_admin());

drop policy if exists "own session insert" on public.zoom_usage_sessions;
create policy "own session insert"
  on public.zoom_usage_sessions for insert to authenticated
  with check (((select auth.uid()) = user_id) and private.zoom_has_valid_access());

drop policy if exists "own or JA sessions" on public.zoom_usage_sessions;
create policy "own or JA sessions"
  on public.zoom_usage_sessions for select to authenticated
  using ((((select auth.uid()) = user_id) and private.zoom_has_valid_access()) or private.zoom_is_creator_admin());

drop policy if exists "own presence insert" on public.zoom_presence;
create policy "own presence insert"
  on public.zoom_presence for insert to authenticated
  with check (((select auth.uid()) = user_id) and private.zoom_has_valid_access());

drop policy if exists "own presence update" on public.zoom_presence;
create policy "own presence update"
  on public.zoom_presence for update to authenticated
  using (((select auth.uid()) = user_id) and private.zoom_has_valid_access())
  with check (((select auth.uid()) = user_id) and private.zoom_has_valid_access());

drop policy if exists "own or JA presence" on public.zoom_presence;
create policy "own or JA presence"
  on public.zoom_presence for select to authenticated
  using ((((select auth.uid()) = user_id) and private.zoom_has_valid_access()) or private.zoom_is_creator_admin());

drop policy if exists "own feedback insert" on public.zoom_feedback_reports;
create policy "own feedback insert"
  on public.zoom_feedback_reports for insert to authenticated
  with check (((select auth.uid()) = reporter_user_id) and private.zoom_has_valid_access());

drop policy if exists "own or JA feedback read" on public.zoom_feedback_reports;
create policy "own or JA feedback read"
  on public.zoom_feedback_reports for select to authenticated
  using ((((select auth.uid()) = reporter_user_id) and private.zoom_has_valid_access()) or private.zoom_is_creator_admin());

drop policy if exists "feedback history insert" on public.zoom_feedback_status_history;
create policy "feedback history insert"
  on public.zoom_feedback_status_history for insert to authenticated
  with check (private.zoom_is_creator_admin() and changed_by = (select auth.uid()));
