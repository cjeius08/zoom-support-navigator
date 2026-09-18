-- Phase 6 Batch 4B: keep privileged Readiness implementations out of the exposed public schema.
-- Public RPC names stay stable, but are SECURITY INVOKER (Postgres default) wrappers.
-- The private helpers retain the existing per-user / creator-admin authorization checks.

CREATE OR REPLACE FUNCTION private.zoom_readiness_get_state_impl(p_question_set_version text DEFAULT 'zoom_general_scenarios_v1'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_user uuid := auth.uid();
  v_questions jsonb;
  v_attempts jsonb;
  v_active jsonb;
begin
  if v_user is null or not private.zoom_has_valid_access() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', q.question_id,
      'order', q.question_order,
      'type', 'Scenario',
      'prompt', q.prompt,
      'options', q.options,
      'locationLabel', q.location_label,
      'resourceTarget', q.resource_target,
      'source', q.source_label
    ) order by q.question_order
  ), '[]'::jsonb)
  into v_questions
  from private.zoom_readiness_questions q
  where q.question_set_version = p_question_set_version;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', a.id,
      'attemptNumber', a.attempt_number,
      'status', a.status,
      'score', a.score,
      'totalQuestions', a.total_questions,
      'startedAt', a.started_at,
      'submittedAt', a.submitted_at,
      'checkedCount', (
        select count(*) from private.zoom_readiness_answers ra where ra.attempt_id = a.id
      )
    ) order by a.attempt_number
  ), '[]'::jsonb)
  into v_attempts
  from private.zoom_readiness_attempts a
  where a.user_id = v_user
    and a.question_set_version = p_question_set_version;

  select jsonb_build_object(
    'id', a.id,
    'attemptNumber', a.attempt_number,
    'status', a.status,
    'score', a.score,
    'totalQuestions', a.total_questions,
    'startedAt', a.started_at,
    'submittedAt', a.submitted_at,
    'answers', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'questionId', ra.question_id,
          'selectedOptionId', ra.selected_option_id,
          'isCorrect', ra.is_correct,
          'correctOptionId', q.correct_option_id,
          'explanation', q.explanation,
          'checkedAt', ra.checked_at
        ) order by q.question_order
      )
      from private.zoom_readiness_answers ra
      join private.zoom_readiness_questions q
        on q.question_set_version = ra.question_set_version
       and q.question_id = ra.question_id
      where ra.attempt_id = a.id
    ), '[]'::jsonb)
  )
  into v_active
  from private.zoom_readiness_attempts a
  where a.user_id = v_user
    and a.question_set_version = p_question_set_version
    and a.status = 'active'
  limit 1;

  return jsonb_build_object(
    'questionSetVersion', p_question_set_version,
    'maxAttempts', 3,
    'questions', v_questions,
    'attempts', v_attempts,
    'activeAttempt', v_active
  );
end
$function$;

CREATE OR REPLACE FUNCTION private.zoom_readiness_start_or_resume_impl(p_question_set_version text DEFAULT 'zoom_general_scenarios_v1'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_user uuid := auth.uid();
  v_existing uuid;
  v_attempt_count integer;
  v_question_count integer;
begin
  if v_user is null or not private.zoom_has_valid_access() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtext(v_user::text || ':' || p_question_set_version));

  select id into v_existing
  from private.zoom_readiness_attempts
  where user_id = v_user
    and question_set_version = p_question_set_version
    and status = 'active'
  order by attempt_number
  limit 1;

  if v_existing is not null then
    return private.zoom_readiness_get_state_impl(p_question_set_version);
  end if;

  select count(*) into v_attempt_count
  from private.zoom_readiness_attempts
  where user_id = v_user
    and question_set_version = p_question_set_version;

  if v_attempt_count >= 3 then
    return private.zoom_readiness_get_state_impl(p_question_set_version);
  end if;

  select count(*) into v_question_count
  from private.zoom_readiness_questions
  where question_set_version = p_question_set_version;

  if v_question_count = 0 then
    raise exception 'Question set unavailable' using errcode = 'P0002';
  end if;

  insert into private.zoom_readiness_attempts (
    user_id, question_set_version, attempt_number, total_questions
  )
  values (
    v_user, p_question_set_version, v_attempt_count + 1, v_question_count
  );

  return private.zoom_readiness_get_state_impl(p_question_set_version);
end
$function$;

CREATE OR REPLACE FUNCTION private.zoom_readiness_check_answer_impl(p_attempt_id uuid, p_question_id text, p_selected_option_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_user uuid := auth.uid();
  v_version text;
  v_status text;
  v_correct_option text;
  v_explanation text;
  v_options jsonb;
  v_answer private.zoom_readiness_answers%rowtype;
  v_checked_count integer;
begin
  if v_user is null or not private.zoom_has_valid_access() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  select question_set_version, status
    into v_version, v_status
  from private.zoom_readiness_attempts
  where id = p_attempt_id
    and user_id = v_user
  for update;

  if v_version is null then
    raise exception 'Attempt not found' using errcode = 'P0002';
  end if;

  if v_status <> 'active' then
    raise exception 'Attempt already submitted' using errcode = '22023';
  end if;

  select correct_option_id, explanation, options
    into v_correct_option, v_explanation, v_options
  from private.zoom_readiness_questions
  where question_set_version = v_version
    and question_id = p_question_id;

  if v_correct_option is null then
    raise exception 'Question not found' using errcode = 'P0002';
  end if;

  if not exists (
    select 1
    from jsonb_array_elements(v_options) as option_row(value)
    where option_row.value->>'id' = p_selected_option_id
  ) then
    raise exception 'Invalid answer option' using errcode = '22023';
  end if;

  insert into private.zoom_readiness_answers (
    attempt_id, user_id, question_set_version, question_id,
    selected_option_id, is_correct
  )
  values (
    p_attempt_id, v_user, v_version, p_question_id,
    p_selected_option_id, p_selected_option_id = v_correct_option
  )
  on conflict (attempt_id, question_id) do nothing;

  select * into v_answer
  from private.zoom_readiness_answers
  where attempt_id = p_attempt_id
    and question_id = p_question_id;

  select count(*) into v_checked_count
  from private.zoom_readiness_answers
  where attempt_id = p_attempt_id;

  return jsonb_build_object(
    'questionId', v_answer.question_id,
    'selectedOptionId', v_answer.selected_option_id,
    'isCorrect', v_answer.is_correct,
    'correctOptionId', v_correct_option,
    'explanation', v_explanation,
    'checkedAt', v_answer.checked_at,
    'checkedCount', v_checked_count,
    'locked', true
  );
end
$function$;

CREATE OR REPLACE FUNCTION private.zoom_readiness_submit_attempt_impl(p_attempt_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_user uuid := auth.uid();
  v_status text;
  v_total integer;
  v_checked integer;
  v_score integer;
  v_row private.zoom_readiness_attempts%rowtype;
begin
  if v_user is null or not private.zoom_has_valid_access() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  select status, total_questions
    into v_status, v_total
  from private.zoom_readiness_attempts
  where id = p_attempt_id
    and user_id = v_user
  for update;

  if v_status is null then
    raise exception 'Attempt not found' using errcode = 'P0002';
  end if;

  if v_status = 'submitted' then
    select * into v_row
    from private.zoom_readiness_attempts
    where id = p_attempt_id;

    return jsonb_build_object(
      'id', v_row.id,
      'attemptNumber', v_row.attempt_number,
      'status', v_row.status,
      'score', v_row.score,
      'totalQuestions', v_row.total_questions,
      'submittedAt', v_row.submitted_at
    );
  end if;

  select count(*), count(*) filter (where is_correct)
    into v_checked, v_score
  from private.zoom_readiness_answers
  where attempt_id = p_attempt_id;

  if v_checked <> v_total then
    raise exception 'Attempt incomplete' using errcode = '22023';
  end if;

  update private.zoom_readiness_attempts
  set status = 'submitted',
      score = v_score,
      submitted_at = now()
  where id = p_attempt_id
  returning * into v_row;

  return jsonb_build_object(
    'id', v_row.id,
    'attemptNumber', v_row.attempt_number,
    'status', v_row.status,
    'score', v_row.score,
    'totalQuestions', v_row.total_questions,
    'submittedAt', v_row.submitted_at
  );
end
$function$;

CREATE OR REPLACE FUNCTION private.zoom_readiness_admin_report_impl(p_question_set_version text DEFAULT 'zoom_general_scenarios_v1'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_users jsonb;
begin
  if not private.zoom_is_creator_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  select coalesce(jsonb_agg(u.user_json order by u.created_at), '[]'::jsonb)
    into v_users
  from (
    select
      p.created_at,
      jsonb_build_object(
        'id', p.id,
        'username', p.username::text,
        'initials', p.initials,
        'role', p.role,
        'status', p.status,
        'attempts', coalesce((
          select jsonb_agg(a.attempt_json order by a.attempt_number)
          from (
            select
              ra_attempt.attempt_number,
              jsonb_build_object(
                'id', ra_attempt.id,
                'attemptNumber', ra_attempt.attempt_number,
                'status', ra_attempt.status,
                'score', ra_attempt.score,
                'totalQuestions', ra_attempt.total_questions,
                'checkedCount', (
                  select count(*)
                  from private.zoom_readiness_answers ca
                  where ca.attempt_id = ra_attempt.id
                ),
                'startedAt', ra_attempt.started_at,
                'submittedAt', ra_attempt.submitted_at,
                'incorrectAnswers', coalesce((
                  select jsonb_agg(
                    jsonb_build_object(
                      'questionId', ans.question_id,
                      'questionOrder', q.question_order,
                      'prompt', q.prompt,
                      'selectedOptionId', ans.selected_option_id,
                      'selectedAnswer', (
                        select option_row.value->>'text'
                        from jsonb_array_elements(q.options) as option_row(value)
                        where option_row.value->>'id' = ans.selected_option_id
                        limit 1
                      ),
                      'correctOptionId', q.correct_option_id,
                      'correctAnswer', (
                        select option_row.value->>'text'
                        from jsonb_array_elements(q.options) as option_row(value)
                        where option_row.value->>'id' = q.correct_option_id
                        limit 1
                      ),
                      'checkedAt', ans.checked_at
                    ) order by q.question_order
                  )
                  from private.zoom_readiness_answers ans
                  join private.zoom_readiness_questions q
                    on q.question_set_version = ans.question_set_version
                   and q.question_id = ans.question_id
                  where ans.attempt_id = ra_attempt.id
                    and ans.is_correct = false
                ), '[]'::jsonb)
              ) as attempt_json
            from private.zoom_readiness_attempts ra_attempt
            where ra_attempt.user_id = p.id
              and ra_attempt.question_set_version = p_question_set_version
          ) a
        ), '[]'::jsonb)
      ) as user_json
    from public.zoom_profiles p
  ) u;

  return jsonb_build_object(
    'questionSetVersion', p_question_set_version,
    'maxAttempts', 3,
    'users', v_users
  );
end
$function$;

CREATE OR REPLACE FUNCTION public.zoom_readiness_get_state(p_question_set_version text DEFAULT 'zoom_general_scenarios_v1'::text)
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO ''
AS $function$
  select private.zoom_readiness_get_state_impl(p_question_set_version);
$function$;

CREATE OR REPLACE FUNCTION public.zoom_readiness_start_or_resume(p_question_set_version text DEFAULT 'zoom_general_scenarios_v1'::text)
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO ''
AS $function$
  select private.zoom_readiness_start_or_resume_impl(p_question_set_version);
$function$;

CREATE OR REPLACE FUNCTION public.zoom_readiness_check_answer(p_attempt_id uuid, p_question_id text, p_selected_option_id text)
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO ''
AS $function$
  select private.zoom_readiness_check_answer_impl(
    p_attempt_id,
    p_question_id,
    p_selected_option_id
  );
$function$;

CREATE OR REPLACE FUNCTION public.zoom_readiness_submit_attempt(p_attempt_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO ''
AS $function$
  select private.zoom_readiness_submit_attempt_impl(p_attempt_id);
$function$;

CREATE OR REPLACE FUNCTION public.zoom_readiness_admin_report(p_question_set_version text DEFAULT 'zoom_general_scenarios_v1'::text)
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO ''
AS $function$
  select private.zoom_readiness_admin_report_impl(p_question_set_version);
$function$;

revoke all on function private.zoom_readiness_get_state_impl(text) from public, anon;
revoke all on function private.zoom_readiness_start_or_resume_impl(text) from public, anon;
revoke all on function private.zoom_readiness_check_answer_impl(uuid, text, text) from public, anon;
revoke all on function private.zoom_readiness_submit_attempt_impl(uuid) from public, anon;
revoke all on function private.zoom_readiness_admin_report_impl(text) from public, anon;

grant execute on function private.zoom_readiness_get_state_impl(text) to authenticated, service_role;
grant execute on function private.zoom_readiness_start_or_resume_impl(text) to authenticated, service_role;
grant execute on function private.zoom_readiness_check_answer_impl(uuid, text, text) to authenticated, service_role;
grant execute on function private.zoom_readiness_submit_attempt_impl(uuid) to authenticated, service_role;
grant execute on function private.zoom_readiness_admin_report_impl(text) to authenticated, service_role;

revoke all on function public.zoom_readiness_get_state(text) from public, anon;
revoke all on function public.zoom_readiness_start_or_resume(text) from public, anon;
revoke all on function public.zoom_readiness_check_answer(uuid, text, text) from public, anon;
revoke all on function public.zoom_readiness_submit_attempt(uuid) from public, anon;
revoke all on function public.zoom_readiness_admin_report(text) from public, anon;

grant execute on function public.zoom_readiness_get_state(text) to authenticated, service_role;
grant execute on function public.zoom_readiness_start_or_resume(text) to authenticated, service_role;
grant execute on function public.zoom_readiness_check_answer(uuid, text, text) to authenticated, service_role;
grant execute on function public.zoom_readiness_submit_attempt(uuid) to authenticated, service_role;
grant execute on function public.zoom_readiness_admin_report(text) to authenticated, service_role;
