import { adminClient } from '../_shared/clients.ts'
import { normalizeUsername } from '../_shared/identity.ts'
import { json, options } from '../_shared/responses.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0'

const generic = (request: Request) => json({ error: 'Username or password is incorrect.' }, 401, request)

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return options(request)
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, request)
  try {
    const { username, password } = await request.json()
    if (typeof username !== 'string' || typeof password !== 'string') return generic(request)
    const admin = adminClient()
    const normalized = normalizeUsername(username)
    const { data: matches } = await admin.rpc('zoom_service_login_lookup', { requested_username: normalized })
    const profile = matches?.[0]
    if (!profile) return generic(request)
    if (profile.locked_until && new Date(profile.locked_until) > new Date()) return json({ error: 'Account temporarily locked. Contact JA or try again later.' }, 423, request)
    if (profile.status !== 'active') return json({ error: 'Account is deactivated. Contact JA.' }, 403, request)
    if (!profile.internal_email) return generic(request)
    const auth = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!)
    const { data: signedIn, error } = await auth.auth.signInWithPassword({ email: profile.internal_email, password })
    if (error || !signedIn.session) {
      const failures = (profile.failed_attempts ?? 0) + 1
      const locked = failures >= 5
      await admin.rpc('zoom_service_set_login_security', { account: profile.user_id, failures: locked ? 0 : failures, window_started: profile.failure_window_started_at ?? new Date().toISOString(), locked: locked ? new Date(Date.now() + 15 * 60_000).toISOString() : null, session: null })
      if (locked) await admin.schema('private').from('zoom_admin_notifications').insert({ type: 'temporary_lockout', subject_user_id: profile.id })
      return generic(request)
    }
    const sessionId = JSON.parse(atob(signedIn.session.access_token.split('.')[1])).session_id
    await admin.rpc('zoom_service_set_login_security', { account: profile.user_id, failures: 0, window_started: null, locked: null, session: sessionId })
    return json({ access_token: signedIn.session.access_token, refresh_token: signedIn.session.refresh_token, expires_in: signedIn.session.expires_in, user: { id: profile.user_id, username: profile.username, initials: profile.initials, role: profile.role, must_change_password: profile.must_change_password } }, 200, request)
  } catch { return generic(request) }
})
