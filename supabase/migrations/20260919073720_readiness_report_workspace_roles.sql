create or replace function private.zoom_readiness_admin_report_impl(
  p_question_set_version text default 'zoom_general_scenarios_v1'::text
)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
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
        'workspace_role', p.workspace_role,
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
$$;
