import { supabase, supabaseConfigured } from './supabaseClient'

// Diagnostics contain only elapsed timings and fixed phase names.
// Opt in by adding ?authdebug=1 to the page URL and checking the browser console.
function recordAuthTiming(phase, start) {
  if (typeof performance === 'undefined') return
  const duration = Math.round(performance.now() - start)
  if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('authdebug') === '1') {
    console.info('[Ozzie sign-in timing]', phase, duration + 'ms')
  }
}

export async function loginWithUsername(username, password, onProgress = () => {}) {
  if (!supabaseConfigured) throw new Error('Supabase is not configured.')
  let started = performance.now()
  onProgress('Verifying credentials…')
  // The function performs account lookup, password verification and security
  // updates. Never retry automatically: duplicate attempts can lock an account.
  const { data, error } = await supabase.functions.invoke('login', { body: { username, password } })
  recordAuthTiming('login service', started)
  if (error) throw new Error(data?.error ?? 'Unable to sign in. Please wait and try again.')
  if (!data || data.error) throw new Error(data?.error ?? 'Unable to sign in.')
  if (!data.access_token || !data.refresh_token) throw new Error('Login did not return a valid session. Please contact support.')

  onProgress('Establishing secure session…')
  started = performance.now()
  const { error: sessionError } = await supabase.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token })
  recordAuthTiming('session setup', started)
  if (sessionError) throw sessionError

  onProgress('Opening your workspace…')
  started = performance.now()
  const profile = await getCurrentProfile()
  recordAuthTiming('profile lookup', started)
  // Never fall back to unverified profile details for role-based workspace access.
  if (!profile) throw new Error('Signed in, but your workspace profile could not be found. Please contact an Ozzie admin.')
  return profile
}

export async function changeOwnPassword(password) {
  if (!supabaseConfigured) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.functions.invoke('change-password', { body: { password } })
  if (error || data?.error) throw new Error(data?.error ?? 'Password change failed.')
  return data
}

export async function activateAccount(payload) {
  if (!supabaseConfigured) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.functions.invoke('activate-account', { body: { initials: payload.initials, invite_code: payload.inviteCode, username: payload.username, password: payload.password } })
  if (error || data?.error) throw new Error(data?.error ?? 'Activation could not be completed.')
  return data
}

export async function getCurrentProfile() {
  if (!supabaseConfigured) return null
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  if (!sessionData.session) return null
  const { data, error } = await supabase.from('zoom_profiles').select('id,username,initials,role,status,must_change_password,avatar_id,ozzie_intro_seen_at,workspace_role').eq('id', sessionData.session.user.id).maybeSingle()
  if (error) throw error
  return data
}

export async function markOzzieIntroSeen() {
  if (!supabaseConfigured) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.rpc('zoom_mark_ozzie_intro_seen')
  if (error) throw error
  return data
}

export async function updateOwnAvatar(avatarId) {
  if (!supabaseConfigured) throw new Error('Supabase is not configured.')
  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData.session) throw new Error('You must be signed in.')
  const { data, error } = await supabase.from('zoom_profiles').update({ avatar_id: avatarId }).eq('id', sessionData.session.user.id).select('avatar_id').single()
  if (error) throw error
  return data
}

export async function signOut() {
  await supabase?.auth.signOut()
}
