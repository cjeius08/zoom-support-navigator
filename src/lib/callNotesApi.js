import { supabase } from './supabaseClient'

async function currentUserId() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data?.user?.id) throw new Error('Your secure session is unavailable. Sign in again and retry.')
  return data.user.id
}

function callStartedAt(dateTime) {
  if (!dateTime) return null
  const parsed = new Date(dateTime)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

function notePayload(draft) {
  return {
    caller_ref: draft.callerRef?.trim() || null,
    device: draft.device || null,
    outcome: draft.outcome || null,
    call_started_at: callStartedAt(draft.dateTime),
    draft,
  }
}

export async function loadOwnCallNotes(limit = 20) {
  const userId = await currentUserId()
  const { data, error } = await supabase
    .from('zoom_call_notes')
    .select('id,user_id,caller_ref,device,outcome,call_started_at,draft,created_at,updated_at,expires_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

export async function saveOwnCallNote({ id = null, draft }) {
  const userId = await currentUserId()
  const payload = notePayload(draft)

  if (id) {
    const { data, error } = await supabase
      .from('zoom_call_notes')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId)
      .select('id,user_id,caller_ref,device,outcome,call_started_at,draft,created_at,updated_at,expires_at')
      .single()

    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('zoom_call_notes')
    .insert({ ...payload, user_id: userId })
    .select('id,user_id,caller_ref,device,outcome,call_started_at,draft,created_at,updated_at,expires_at')
    .single()

  if (error) throw error
  return data
}

