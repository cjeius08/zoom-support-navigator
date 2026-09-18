create table private.zoom_readiness_questions (
  question_set_version text not null,
  question_id text not null,
  question_order integer not null check (question_order between 1 and 50),
  prompt text not null,
  options jsonb not null check (jsonb_typeof(options) = 'array'),
  correct_option_id text not null,
  explanation text not null,
  location_label text not null,
  resource_target jsonb not null,
  source_label text not null,
  primary key (question_set_version, question_id),
  unique (question_set_version, question_order)
);

create table private.zoom_readiness_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.zoom_profiles(id) on delete cascade,
  question_set_version text not null,
  attempt_number integer not null check (attempt_number between 1 and 3),
  status text not null default 'active' check (status in ('active','submitted')),
  score integer,
  total_questions integer not null check (total_questions > 0),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  constraint zoom_readiness_attempt_score_check check (
    (status = 'active' and score is null and submitted_at is null)
    or
    (status = 'submitted' and score between 0 and total_questions and submitted_at is not null)
  ),
  unique (user_id, question_set_version, attempt_number)
);

create unique index zoom_readiness_one_active_attempt_idx
  on private.zoom_readiness_attempts(user_id, question_set_version)
  where status = 'active';

create index zoom_readiness_attempts_user_version_idx
  on private.zoom_readiness_attempts(user_id, question_set_version, attempt_number);

create table private.zoom_readiness_answers (
  id bigint generated always as identity primary key,
  attempt_id uuid not null references private.zoom_readiness_attempts(id) on delete cascade,
  user_id uuid not null references public.zoom_profiles(id) on delete cascade,
  question_set_version text not null,
  question_id text not null,
  selected_option_id text not null,
  is_correct boolean not null,
  checked_at timestamptz not null default now(),
  unique (attempt_id, question_id),
  foreign key (question_set_version, question_id)
    references private.zoom_readiness_questions(question_set_version, question_id)
);

create index zoom_readiness_answers_attempt_idx
  on private.zoom_readiness_answers(attempt_id, checked_at);

revoke all on table private.zoom_readiness_questions from public, anon, authenticated;
revoke all on table private.zoom_readiness_attempts from public, anon, authenticated;
revoke all on table private.zoom_readiness_answers from public, anon, authenticated;
revoke all on sequence private.zoom_readiness_answers_id_seq from public, anon, authenticated;

insert into private.zoom_readiness_questions (
  question_set_version, question_id, question_order, prompt, options,
  correct_option_id, explanation, location_label, resource_target, source_label
) values
(
  'zoom_general_scenarios_v1',
  'join-exact-state',
  1,
  'A Zoom user says, “I can’t get into the meeting.” What is the best first move?',
  '[{"id":"a","text":"Restart the computer immediately before asking anything else."},{"id":"b","text":"Ask what exact Zoom screen or message appears and confirm the meeting link or details before choosing the next route."},{"id":"c","text":"Start checking the microphone and speaker because joining issues are usually audio-related."},{"id":"d","text":"Tell the user to contact the host immediately without checking what Zoom is showing."}]'::jsonb,
  'b',
  '“Can’t join” is too broad by itself. The approved joining route starts by identifying exactly where Zoom stops the user and using the visible message or meeting details to choose the next step.',
  'Training & Resources → Scripts & Communication → Scenario Scripts → Can’t Join',
  '{"view":"training","section":"scripts","mode":"scenarios","scenario":"cant-join"}'::jsonb,
  'Scripts & Communication · Can’t Join'
),
(
  'zoom_general_scenarios_v1',
  'cant-hear-output',
  2,
  'A user is already inside a Zoom meeting but cannot hear anyone. Which direction should the agent investigate first?',
  '[{"id":"a","text":"Treat it as a speaker/output problem: confirm meeting audio is connected, then check the speaker path."},{"id":"b","text":"Treat it as a microphone/input problem and start by unmuting the user."},{"id":"c","text":"Leave the meeting and create a new meeting link."},{"id":"d","text":"Change camera settings because video can affect Zoom audio."}]'::jsonb,
  'a',
  'If the user cannot hear others, the symptom is on the output/speaker side. First confirm the user is connected to meeting audio, then follow the approved speaker/output checks.',
  'Training & Resources → Scripts & Communication → Scenario Scripts → Can’t Hear',
  '{"view":"training","section":"scripts","mode":"scenarios","scenario":"cant-hear"}'::jsonb,
  'Scripts & Communication · Can’t Hear'
),
(
  'zoom_general_scenarios_v1',
  'cant-be-heard-input',
  3,
  'Other participants say they cannot hear the Zoom user. What should the agent focus on first?',
  '[{"id":"a","text":"Speaker volume and output device."},{"id":"b","text":"The microphone/input path: Zoom mute state, any physical mute control, and the microphone Zoom is using."},{"id":"c","text":"The meeting link and passcode."},{"id":"d","text":"Screen-sharing permission."}]'::jsonb,
  'b',
  'When others cannot hear the user, the symptom is on the microphone/input side. The approved route starts by checking mute state and the microphone path rather than speaker output.',
  'Training & Resources → Scripts & Communication → Scenario Scripts → They Can’t Hear Me',
  '{"view":"training","section":"scripts","mode":"scenarios","scenario":"cant-be-heard"}'::jsonb,
  'Scripts & Communication · They Can’t Hear Me'
),
(
  'zoom_general_scenarios_v1',
  'camera-state',
  4,
  'A Zoom user says, “My camera isn’t working.” What should the agent determine before trying unrelated fixes?',
  '[{"id":"a","text":"Whether video is simply turned off or Zoom is actually failing to show an image from the camera."},{"id":"b","text":"Whether the user can hear meeting audio."},{"id":"c","text":"Whether the host has started screen sharing."},{"id":"d","text":"Whether the meeting invitation contains a phone number."}]'::jsonb,
  'a',
  'The camera route first distinguishes a simple video-off state from a camera that is on but black, missing, or not producing an image. That observation determines the next approved check.',
  'Training & Resources → Scripts & Communication → Scenario Scripts → Camera',
  '{"view":"training","section":"scripts","mode":"scenarios","scenario":"camera-not-working"}'::jsonb,
  'Scripts & Communication · Camera'
),
(
  'zoom_general_scenarios_v1',
  'screen-share-control',
  5,
  'A Zoom user says they cannot share their screen. What is the safest first judgment?',
  '[{"id":"a","text":"Assume Zoom is broken and tell the user to reinstall it."},{"id":"b","text":"Determine what happens when they try to share and whether the Share Screen action is available or controlled by the meeting host before changing anything."},{"id":"c","text":"Tell the user to create a new Zoom account."},{"id":"d","text":"Change microphone permissions first."}]'::jsonb,
  'b',
  'Screen sharing can depend on the visible Zoom state and host-controlled permissions. The agent should identify what the user sees and whether the feature is available before assuming a product failure.',
  'Training & Resources → Scripts & Communication → Scenario Scripts → Screen Share',
  '{"view":"training","section":"scripts","mode":"scenarios","scenario":"cant-share"}'::jsonb,
  'Scripts & Communication · Screen Share'
);

create or replace function public.zoom_readiness_get_state(
  p_question_set_version text default 'zoom_general_scenarios_v1'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
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
$$;

create or replace function public.zoom_readiness_start_or_resume(
  p_question_set_version text default 'zoom_general_scenarios_v1'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
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
    return public.zoom_readiness_get_state(p_question_set_version);
  end if;

  select count(*) into v_attempt_count
  from private.zoom_readiness_attempts
  where user_id = v_user
    and question_set_version = p_question_set_version;

  if v_attempt_count >= 3 then
    return public.zoom_readiness_get_state(p_question_set_version);
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

  return public.zoom_readiness_get_state(p_question_set_version);
end
$$;

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
  v_existing private.zoom_readiness_answers%rowtype;
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

  select * into v_existing
  from private.zoom_readiness_answers
  where attempt_id = p_attempt_id
    and question_id = p_question_id;

  if v_existing.id is not null then
    select count(*) into v_checked_count
    from private.zoom_readiness_answers
    where attempt_id = p_attempt_id;

    return jsonb_build_object(
      'questionId', v_existing.question_id,
      'selectedOptionId', v_existing.selected_option_id,
      'isCorrect', v_existing.is_correct,
      'correctOptionId', v_correct_option,
      'explanation', v_explanation,
      'checkedAt', v_existing.checked_at,
      'checkedCount', v_checked_count,
      'locked', true
    );
  end if;

  insert into private.zoom_readiness_answers (
    attempt_id, user_id, question_set_version, question_id,
    selected_option_id, is_correct
  )
  values (
    p_attempt_id, v_user, v_version, p_question_id,
    p_selected_option_id, p_selected_option_id = v_correct_option
  )
  returning * into v_answer;

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

create or replace function public.zoom_readiness_submit_attempt(
  p_attempt_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
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
$$;

create or replace function public.zoom_readiness_admin_report(
  p_question_set_version text default 'zoom_general_scenarios_v1'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
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

revoke all on function public.zoom_readiness_get_state(text) from public, anon;
revoke all on function public.zoom_readiness_start_or_resume(text) from public, anon;
revoke all on function public.zoom_readiness_check_answer(uuid, text, text) from public, anon;
revoke all on function public.zoom_readiness_submit_attempt(uuid) from public, anon;
revoke all on function public.zoom_readiness_admin_report(text) from public, anon;

grant execute on function public.zoom_readiness_get_state(text) to authenticated;
grant execute on function public.zoom_readiness_start_or_resume(text) to authenticated;
grant execute on function public.zoom_readiness_check_answer(uuid, text, text) to authenticated;
grant execute on function public.zoom_readiness_submit_attempt(uuid) to authenticated;
grant execute on function public.zoom_readiness_admin_report(text) to authenticated;
