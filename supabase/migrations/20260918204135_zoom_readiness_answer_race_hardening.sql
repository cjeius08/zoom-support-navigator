create or replace function public.zoom_readiness_check_answer(
  p_attempt_id uuid,
  p_question_id text,
  p_selected_option_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
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
$$;
