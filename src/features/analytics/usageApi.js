import { supabase } from '../../lib/supabaseClient'
import { createSafeEvent } from './usageTracker'

function ensureSupabase() {
  if (!supabase) throw new Error('Supabase is not configured.')
}

export async function startUsageSession({ userId, sessionId, startedAt, lastInteraction }) {
  ensureSupabase()
  const { error } = await supabase.from('zoom_usage_sessions').insert({
    session_id: sessionId,
    user_id: userId,
    started_at: startedAt,
    last_interaction: lastInteraction,
  })
  if (error) throw error
}

export async function updateUsageSession({ sessionId, activeSeconds, lastInteraction, endedAt }) {
  ensureSupabase()
  const payload = {
    active_seconds: Math.max(0, Math.floor(activeSeconds || 0)),
    last_interaction: lastInteraction,
  }
  if (endedAt) payload.ended_at = endedAt

  const { error } = await supabase
    .from('zoom_usage_sessions')
    .update(payload)
    .eq('session_id', sessionId)
  if (error) throw error
}

export async function writePresence({ userId, sessionId, state, lastHeartbeat, lastInteraction }) {
  ensureSupabase()
  const { error } = await supabase.from('zoom_presence').upsert({
    user_id: userId,
    session_id: sessionId,
    state,
    last_heartbeat: lastHeartbeat,
    last_interaction: lastInteraction,
  }, { onConflict: 'user_id' })
  if (error) throw error
}

export async function insertUsageEvent({ userId, sessionId, input }) {
  ensureSupabase()
  const event = createSafeEvent(input)
  if (!event.event_type) return

  const { error } = await supabase.from('zoom_usage_events').insert({
    user_id: userId,
    session_id: sessionId,
    ...event,
  })
  if (error) throw error
}
