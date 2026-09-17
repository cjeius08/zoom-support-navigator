do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'zoom_usage_sessions'
      and policyname = 'own session update'
  ) then
    create policy "own session update"
      on public.zoom_usage_sessions
      for update
      to authenticated
      using ((select auth.uid()) = user_id and private.zoom_has_valid_access())
      with check ((select auth.uid()) = user_id and private.zoom_has_valid_access());
  end if;
end
$$;

create index if not exists zoom_events_process_time_idx
  on public.zoom_usage_events(process_id, created_at)
  where process_id is not null;

create index if not exists zoom_events_category_time_idx
  on public.zoom_usage_events(category_id, created_at)
  where category_id is not null;

create index if not exists zoom_events_tool_time_idx
  on public.zoom_usage_events(tool_id, created_at)
  where tool_id is not null;

create index if not exists zoom_sessions_user_started_idx
  on public.zoom_usage_sessions(user_id, started_at);

create index if not exists zoom_feedback_reporter_created_idx
  on public.zoom_feedback_reports(reporter_user_id, created_at);

create index if not exists zoom_feedback_history_feedback_created_idx
  on public.zoom_feedback_status_history(feedback_id, created_at);

create or replace function public.zoom_update_feedback_status(
  p_feedback_id uuid,
  p_status text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_previous text;
  v_row public.zoom_feedback_reports%rowtype;
begin
  if not private.zoom_is_creator_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  if p_status not in ('new','reviewing','planned','resolved','closed','dismissed') then
    raise exception 'Invalid feedback status' using errcode = '22023';
  end if;

  select status
    into v_previous
    from public.zoom_feedback_reports
   where id = p_feedback_id
   for update;

  if v_previous is null then
    raise exception 'Feedback report not found' using errcode = 'P0002';
  end if;

  if v_previous = p_status then
    select *
      into v_row
      from public.zoom_feedback_reports
     where id = p_feedback_id;

    return to_jsonb(v_row);
  end if;

  update public.zoom_feedback_reports
     set status = p_status,
         updated_at = now(),
         resolved_at = case
           when p_status in ('resolved','closed') then now()
           else null
         end
   where id = p_feedback_id
   returning * into v_row;

  insert into public.zoom_feedback_status_history (
    feedback_id,
    previous_status,
    new_status,
    changed_by
  )
  values (
    p_feedback_id,
    v_previous,
    p_status,
    (select auth.uid())
  );

  return to_jsonb(v_row);
end
$$;

revoke all on function public.zoom_update_feedback_status(uuid, text) from public;
revoke all on function public.zoom_update_feedback_status(uuid, text) from anon;
grant execute on function public.zoom_update_feedback_status(uuid, text) to authenticated;

grant update on public.zoom_usage_sessions to authenticated;
