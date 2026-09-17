import { supabase, supabaseConfigured } from './supabaseClient'

export async function loginWithUsername(username, password) {
  if (!supabaseConfigured) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.functions.invoke('login', { body: { username, password } })
  if (error) throw new Error(data?.error ?? 'Unable to sign in.')
  if (data.error) throw new Error(data.error)
  const { error: sessionError } = await supabase.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token })
  if (sessionError) throw sessionError
  return data.user
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
  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData.session) return null
  const { data, error } = await supabase.from('zoom_profiles').select('id,username,initials,role,status,must_change_password,avatar_id').eq('id', sessionData.session.user.id).maybeSingle()
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
