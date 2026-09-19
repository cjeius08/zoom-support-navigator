import { supabase } from './supabaseClient'
import { derivePresenceState } from '../features/analytics/usageSummary'
import { loadReadinessAdminReport } from './readinessApi'
import { READINESS_QUESTION_SETS } from './readinessQuestionSets'

const PAGE_SIZE = 1000

async function loadPaged(buildQuery) {
  const rows = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await buildQuery().range(from, from + PAGE_SIZE - 1)
    if (error) throw error
    rows.push(...(data || []))
    if (!data || data.length < PAGE_SIZE) return rows
  }
}

export async function runAdminAction(payload) {
  const { data, error } = await supabase.functions.invoke('admin-account', { body: payload })
  if (error) throw error
  return data
}

export async function loadTeam() {
  const [{ data: profiles, error: profileError }, { data: presence, error: presenceError }, { data: slots, error: slotError }] = await Promise.all([
    supabase.from('zoom_profiles').select('id,username,initials,role,status,avatar_id,workspace_role,created_at').order('created_at'),
    supabase.from('zoom_presence').select('user_id,state,last_heartbeat,last_interaction'),
    supabase.from('zoom_agent_slots').select('id,initials,status,claimed_by,workspace_role,created_at').order('created_at'),
  ])
  if (profileError) throw profileError
  if (presenceError) throw presenceError
  if (slotError) throw slotError

  const states = new Map((presence || []).map(item => [item.user_id, derivePresenceState(item)]))
  const claimed = new Set((slots || []).filter(slot => slot.claimed_by).map(slot => slot.claimed_by))

  return [
    ...(profiles || []).map(person => ({ ...person, presence: states.get(person.id) || 'offline' })),
    ...(slots || [])
      .filter(slot => slot.status === 'pending' && !claimed.has(slot.claimed_by))
      .map(slot => ({ id: `pending-${slot.id}`, initials: slot.initials, status: 'pending', pending: true, presence: 'offline', role: 'agent' })),
  ]
}

export async function loadUsage({ start, end } = {}) {
  const profileRows = loadPaged(() => supabase
    .from('zoom_profiles')
    .select('id,username,initials,role,status,avatar_id,workspace_role,created_at')
    .order('created_at'))

  const eventRows = loadPaged(() => {
    let query = supabase
      .from('zoom_usage_events')
      .select('event_type,route_id,process_id,category_id,tool_id,created_at,user_id,session_id')
      .order('created_at', { ascending: false })
    if (start) query = query.gte('created_at', start)
    if (end) query = query.lt('created_at', end)
    return query
  })

  const sessionRows = loadPaged(() => {
    let query = supabase
      .from('zoom_usage_sessions')
      .select('session_id,user_id,started_at,ended_at,active_seconds,last_interaction')
      .order('started_at', { ascending: false })
    if (end) query = query.lt('started_at', end)
    return query
  })

  const presenceRows = loadPaged(() => supabase
    .from('zoom_presence')
    .select('user_id,state,last_heartbeat,last_interaction'))

  const [profiles, events, sessions, presence] = await Promise.all([
    profileRows,
    eventRows,
    sessionRows,
    presenceRows,
  ])

  return { profiles, events, sessions, presence }
}

export async function loadFeedback() {
  const reportsPromise = loadPaged(() => supabase
    .from('zoom_feedback_reports')
    .select('id,type,status,route_id,page_label,process_id,category_id,selected_tab,current_section,active_device,active_caller_role,active_common_issue,page_path,page_hash,viewport_width,viewport_height,browser_user_agent,client_reported_at,what_noticed,suggested_change,created_at,updated_at,resolved_at,reporter_user_id')
    .order('created_at', { ascending: false }))

  const historyPromise = loadPaged(() => supabase
    .from('zoom_feedback_status_history')
    .select('feedback_id,previous_status,new_status,changed_by,created_at')
    .order('created_at', { ascending: true }))

  const [reports, history] = await Promise.all([reportsPromise, historyPromise])
  const byFeedback = new Map()

  history.forEach(item => {
    const items = byFeedback.get(item.feedback_id) || []
    items.push(item)
    byFeedback.set(item.feedback_id, items)
  })

  return reports.map(item => ({ ...item, history: byFeedback.get(item.id) || [] }))
}

export async function updateFeedbackStatus(feedbackId, status) {
  const { data, error } = await supabase.rpc('zoom_update_feedback_status', {
    p_feedback_id: feedbackId,
    p_status: status,
  })
  if (error) throw error
  return data
}

export async function loadReadinessReport() {
  const parts = await Promise.all([
    loadReadinessAdminReport(READINESS_QUESTION_SETS.generalScenarios),
    loadReadinessAdminReport(READINESS_QUESTION_SETS.deviceNavigation),
    loadReadinessAdminReport(READINESS_QUESTION_SETS.troubleshootingJudgment),
    loadReadinessAdminReport(READINESS_QUESTION_SETS.scopeReferralJudgment),
    loadReadinessAdminReport(READINESS_QUESTION_SETS.liveCallReadiness),
  ])

  return {
    parts: [
      { id: 'foundation-call-flow', number: 1, title: 'General Zoom Scenarios', ...parts[0] },
      { id: 'device-navigation', number: 2, title: 'Device & Navigation Awareness', ...parts[1] },
      { id: 'troubleshooting-judgment', number: 3, title: 'Troubleshooting Judgment', ...parts[2] },
      { id: 'scope-referral', number: 4, title: 'Scope & Referral Judgment', ...parts[3] },
      { id: 'live-call-readiness', number: 5, title: 'Live Call Readiness', ...parts[4] },
    ],
  }
}
