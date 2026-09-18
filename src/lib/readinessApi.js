import { supabase } from './supabaseClient'

export const READINESS_QUESTION_SET_VERSION = 'zoom_general_scenarios_v1'

function requireSupabase() {
  if (!supabase) throw new Error('Readiness Lab is unavailable because Supabase is not configured.')
  return supabase
}

export async function loadReadinessState() {
  const { data, error } = await requireSupabase().rpc('zoom_readiness_get_state', {
    p_question_set_version: READINESS_QUESTION_SET_VERSION,
  })
  if (error) throw error
  return data
}

export async function startOrResumeReadinessAttempt() {
  const { data, error } = await requireSupabase().rpc('zoom_readiness_start_or_resume', {
    p_question_set_version: READINESS_QUESTION_SET_VERSION,
  })
  if (error) throw error
  return data
}

export async function checkReadinessAnswer({ attemptId, questionId, selectedOptionId }) {
  const { data, error } = await requireSupabase().rpc('zoom_readiness_check_answer', {
    p_attempt_id: attemptId,
    p_question_id: questionId,
    p_selected_option_id: selectedOptionId,
  })
  if (error) throw error
  return data
}

export async function submitReadinessAttempt(attemptId) {
  const { data, error } = await requireSupabase().rpc('zoom_readiness_submit_attempt', {
    p_attempt_id: attemptId,
  })
  if (error) throw error
  return data
}
