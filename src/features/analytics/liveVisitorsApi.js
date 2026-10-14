import { supabase } from '../../lib/supabaseClient'
import { buildLiveVisitorSnapshot } from './liveVisitorsData'
import { PRESENCE_STALE_MS } from './usageSummary'

// This endpoint must only be invoked by the creator admin. Supabase RLS independently
// prevents regular agents and leads from selecting other people's presence/profiles.
export async function loadLiveVisitors() {
  if (!supabase) throw new Error('Workspace connection unavailable.')
  const threshold = new Date(Date.now() - PRESENCE_STALE_MS).toISOString()
  const { data: presence, error: presenceError } = await supabase
    .from('zoom_presence')
    .select('user_id,session_id,state,last_heartbeat,last_interaction')
    .gte('last_heartbeat', threshold)
    .neq('state', 'offline')
  if (presenceError) throw presenceError
  if (!presence?.length) return { active: [], idle: [], activeCount: 0 }

  const userIds = [...new Set(presence.map(row => row.user_id).filter(Boolean))]
  if (!userIds.length) return { active: [], idle: [], activeCount: 0 }
  const { data: profiles, error: profilesError } = await supabase
    .from('zoom_profiles')
    .select('id,username,initials,role,workspace_role')
    .in('id', userIds)
  if (profilesError) throw profilesError

  // Page labels are optional context; page-event query failures must not mask the count.
  let events = []
  const sessions = [...new Set(presence.map(row => row.session_id).filter(Boolean))]
  if (sessions.length) {
    try {
      const { data, error } = await supabase
        .from('zoom_usage_events')
        .select('user_id,session_id,route_id,created_at')
        .eq('event_type', 'route_view')
        .in('session_id', sessions)
        .order('created_at', { ascending: false })
        .limit(300)
      if (!error) events = data || []
    } catch { /* The online count still works without page labels. */ }
  }
  return buildLiveVisitorSnapshot({ profiles: profiles || [], presence, events })
}
