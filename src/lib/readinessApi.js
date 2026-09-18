import { supabase } from './supabaseClient'

export const READINESS_QUESTION_SET_VERSION = 'zoom_general_scenarios_v1'

async function callReadinessRpc(name, args = {}) {
  if (!supabase) throw new Error('Readiness Lab is unavailable because Supabase is not configured.')
  const { data, error } = await supabase.rpc(name, args)
  if (error) throw error
  return data
}

export function getReadinessState() {
  return callReadinessRpc('zoom_readiness_get_state', {
    p_question_set_version: READINESS_QUESTION_SET_VERSION,
  })
}

export function startOrResumeReadiness() {
  return callReadinessRpc('zoom_readiness_start_or_resume', {
    p_question_set_version: READINESS_QUESTION_SET_VERSION,
  })
}

export function checkReadinessAnswer({ attemptId, questionId, selectedOptionId }) {
  return callReadinessRpc('zoom_readiness_check_answer', {
    p_attempt_id: attemptId,
    p_question_id: questionId,
    p_selected_option_id: selectedOptionId,
  })
}

export function submitReadinessAttempt(attemptId) {
  return callReadinessRpc('zoom_readiness_submit_attempt', {
    p_attempt_id: attemptId,
  })
}

export function loadReadinessAdminReport() {
  return callReadinessRpc('zoom_readiness_admin_report', {
    p_question_set_version: READINESS_QUESTION_SET_VERSION,
  })
}
