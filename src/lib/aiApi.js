import { supabase } from './supabaseClient'

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

export async function askOzzieAi(payload) {
  if (!supabase) throw new Error('Ozzie AI is not configured.')
  const { data, error } = await supabase.functions.invoke('ozzie-ai', { body: payload })
  if (error) throw error
  return data
}

export async function logBlockedAiRequest(reason = 'privacy') {
  if (!supabase) return null
  const { data: authData } = await supabase.auth.getUser()
  const userId = authData?.user?.id
  if (!userId) return null
  const { data, error } = await supabase
    .from('zoom_ai_interactions')
    .insert({
      user_id: userId,
      feature: 'ask_ozzie',
      provider: 'none',
      redacted_question: '[BLOCKED: SENSITIVE DATA]',
      status: 'blocked',
      error_code: `privacy_${String(reason).slice(0, 100)}`,
    })
    .select('id')
    .single()
  if (error) return null
  return data?.id || null
}

export async function reportAiAnswer({ interactionId, reason, details = '' }) {
  if (!supabase) throw new Error('AI reporting is not configured.')
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user?.id) throw authError || new Error('Not signed in.')
  const { data, error } = await supabase
    .from('zoom_ai_answer_reports')
    .insert({
      interaction_id: interactionId,
      reporter_user_id: authData.user.id,
      reason,
      details: details.trim() || null,
    })
    .select('id,status')
    .single()
  if (error) throw error
  return data
}

export async function loadAiAdminReport({ start, end } = {}) {
  if (!supabase) throw new Error('AI reporting is not configured.')

  const interactionsPromise = loadPaged(() => {
    let query = supabase
      .from('zoom_ai_interactions')
      .select('id,user_id,feature,provider,model,redacted_question,ai_answer,status,route_id,source_ids,confidence,input_tokens,output_tokens,total_tokens,fallback_path,fallback_count,latency_ms,error_code,created_at')
      .order('created_at', { ascending: false })
    if (start) query = query.gte('created_at', start)
    if (end) query = query.lt('created_at', end)
    return query
  })

  const reportsPromise = loadPaged(() => {
    let query = supabase
      .from('zoom_ai_answer_reports')
      .select('id,interaction_id,reporter_user_id,reason,details,status,admin_category,admin_notes,reviewed_by,reviewed_at,created_at,updated_at')
      .order('created_at', { ascending: false })
    if (start) query = query.gte('created_at', start)
    if (end) query = query.lt('created_at', end)
    return query
  })

  const profilesPromise = loadPaged(() => supabase
    .from('zoom_profiles')
    .select('id,username,initials,role,workspace_role')
    .order('created_at'))

  const [interactions, reports, profiles] = await Promise.all([
    interactionsPromise,
    reportsPromise,
    profilesPromise,
  ])

  return { interactions, reports, profiles, loadedAt: new Date().toISOString() }
}

export async function updateAiAnswerReport(reportId, patch) {
  if (!supabase) throw new Error('AI reporting is not configured.')
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user?.id) throw authError || new Error('Not signed in.')

  const payload = {
    status: patch.status,
    admin_category: patch.adminCategory || null,
    admin_notes: String(patch.adminNotes || '').trim() || null,
    reviewed_by: authData.user.id,
    reviewed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('zoom_ai_answer_reports')
    .update(payload)
    .eq('id', reportId)
    .select('id,status,admin_category,admin_notes,reviewed_by,reviewed_at,updated_at')
    .single()
  if (error) throw error
  return data
}
