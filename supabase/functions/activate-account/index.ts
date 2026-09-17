import { adminClient } from '../_shared/clients.ts'
import { hashInvite, normalizeInitials, normalizeUsername, validInitials, validPassword, validUsername } from '../_shared/identity.ts'
import { json, options } from '../_shared/responses.ts'

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return options(request)
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, request)
  let reservation: { invite_id: string; reserved_slot_id: string } | null = null
  let userId: string | null = null
  let claimToken: string | null = null
  try {
    const body = await request.json()
    const initials = normalizeInitials(String(body.initials ?? ''))
    const username = normalizeUsername(String(body.username ?? ''))
    const password = String(body.password ?? '')
    if (!validInitials(initials) || !validUsername(username) || !validPassword(password) || typeof body.invite_code !== 'string') return json({ error: 'Activation details are invalid.' }, 400, request)
    const admin = adminClient(); claimToken = crypto.randomUUID()
    const { data } = await admin.rpc('zoom_service_reserve_invite', { requested_initials: initials, requested_hash: await hashInvite(body.invite_code), token: claimToken })
    reservation = data?.[0] ?? null
    if (!reservation) return json({ error: 'Invite is invalid, revoked, or already used.' }, 400, request)
    const { data: existing } = await admin.from('zoom_profiles').select('id').eq('username', username).maybeSingle()
    if (existing) return json({ error: 'Username is unavailable.' }, 409, request)
    const internalEmail = `z_${crypto.randomUUID()}@auth.zoom.invalid`
    const { data: created, error } = await admin.auth.admin.createUser({ email: internalEmail, password, email_confirm: true })
    if (error || !created.user) throw error ?? new Error('CREATE_FAILED')
    userId = created.user.id
    const { data: finalized } = await admin.rpc('zoom_service_finalize_activation', { invite: reservation.invite_id, token: claimToken, account: userId, internal_email: internalEmail, requested_username: username, requested_initials: initials })
    if (!finalized) throw new Error('FINALIZE_FAILED')
    return json({ activated: true }, 201, request)
  } catch {
    const admin = adminClient()
    if (userId) await admin.auth.admin.deleteUser(userId)
    if (reservation && claimToken) await admin.rpc('zoom_service_release_invite', { invite: reservation.invite_id, token: claimToken })
    return json({ error: 'Activation could not be completed.' }, 400, request)
  }
})
