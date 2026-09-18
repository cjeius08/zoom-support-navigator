import { supabase } from './supabaseClient'

export const READINESS_QUESTION_SETS = {
  generalScenarios: 'zoom_general_scenarios_v1',
  deviceNavigation: 'zoom_device_navigation_v1',
}

export const READINESS_QUESTION_SET_VERSION = READINESS_QUESTION_SETS.generalScenarios

async function callReadinessRpc(name, args = {}) {
  if (!supabase) throw new Error('Readiness Lab is unavailable because Supabase is not configured.')
  const { data, error } = await supabase.rpc(name, args)
  if (error) throw error
  return data
}

export function getReadinessState(questionSetVersion = READINESS_QUESTION_SET_VERSION) {
  return callReadinessRpc('zoom_readiness_get_state', {
    p_question_set_version: questionSetVersion,
  })
}

export function startOrResumeReadiness(questionSetVersion = READINESS_QUESTION_SET_VERSION) {
  return callReadinessRpc('zoom_readiness_start_or_resume', {
    p_question_set_version: questionSetVersion,
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

export function loadReadinessAdminReport(questionSetVersion = READINESS_QUESTION_SET_VERSION) {
  return callReadinessRpc('zoom_readiness_admin_report', {
    p_question_set_version: questionSetVersion,
  })
}
