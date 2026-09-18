create index if not exists zoom_readiness_answers_user_id_idx
  on private.zoom_readiness_answers(user_id);

create index if not exists zoom_readiness_answers_question_idx
  on private.zoom_readiness_answers(question_set_version, question_id);
