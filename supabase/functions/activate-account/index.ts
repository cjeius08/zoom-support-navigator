import { adminClient } from '../_shared/clients.ts'
import { hashInvite, normalizeInitials, normalizeUsername, validInitials, validPassword, validUsername } from '../_shared/identity.ts'
import { json, options } from '../_shared/responses.ts'

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return options()
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)
  let reservation: { invite_id: string; reserved_slot_id: string } | null = null
  let userId: string | null = null
  let claimToken: string | null = null
  try {
    const body = await request.json()
    const initials = normalizeInitials(String(body.initials ?? ''))
    const username = normalizeUsername(String(body.username ?? ''))
    const password = String(body.password ?? '')
    if (!validInitials(initials) || !validUsername(username) || !validPassword(password) || typeof body.invite_code !== 'string') return json({ error: 'Activation details are invalid.' }, 400)
    const admin = adminClient(); claimToken = crypto.randomUUID()
    const { data } = await admin.rpc('zoom_reserve_invite', { requested_initials: initials, requested_hash: await hashInvite(body.invite_code), token: claimToken })
    reservation = data?.[0] ?? null
    if (!reservation) return json({ error: 'Invite is invalid, revoked, or already used.' }, 400)
    const { data: existing } = await admin.from('zoom_profiles').select('id').eq('username', username).maybeSingle()
    if (existing) return json({ error: 'Username is unavailable.' }, 409)
    const internalEmail = `z_${crypto.randomUUID()}@auth.zoom.invalid`
    const { data: created, error } = await admin.auth.admin.createUser({ email: internalEmail, password, email_confirm: true })
    if (error || !created.user) throw error ?? new Error('CREATE_FAILED')
    userId = created.user.id
    const profile = { id: userId, username, initials, role: 'agent', status: 'active' }
    const { error: profileError } = await admin.from('zoom_profiles').insert(profile)
    if (profileError) throw profileError
    await admin.schema('private').from('zoom_auth_identities').insert({ user_id: userId, internal_email: internalEmail })
    await admin.schema('private').from('zoom_login_security').insert({ user_id: userId })
    const { data: finalized } = await admin.rpc('zoom_finalize_invite', { invite: reservation.invite_id, token: claimToken, account: userId })
    if (!finalized) throw new Error('FINALIZE_FAILED')
    await admin.schema('private').from('zoom_admin_notifications').insert({ type: 'account_activated', subject_user_id: userId })
    return json({ activated: true }, 201)
  } catch {
    const admin = adminClient()
    if (userId) await admin.auth.admin.deleteUser(userId)
    if (reservation && claimToken) await admin.rpc('zoom_release_invite', { invite: reservation.invite_id, token: claimToken })
    return json({ error: 'Activation could not be completed.' }, 400)
  }
})
