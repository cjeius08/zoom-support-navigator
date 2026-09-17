import { adminClient } from '../_shared/clients.ts'
import { json, options } from '../_shared/responses.ts'

const matches = (left: string, right: string) => {
  if (left.length !== right.length) return false
  let difference = 0
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index)
  return difference === 0
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return options()
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)
  let createdUserId: string | null = null
  try {
    const { bootstrap_token: bootstrapToken, username, password } = await request.json()
    const expected = Deno.env.get('JA_BOOTSTRAP_TOKEN') ?? ''
    if (typeof bootstrapToken !== 'string' || !matches(bootstrapToken, expected) || username !== 'ja_admin' || typeof password !== 'string' || password.length < 8) return json({ error: 'Bootstrap rejected.' }, 403)
    const admin = adminClient(); const email = `z_${crypto.randomUUID()}@auth.zoom.invalid`
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
    if (error || !data.user) throw error ?? new Error('CREATE_FAILED')
    createdUserId = data.user.id
    const { data: created } = await admin.rpc('zoom_service_create_creator', { account: createdUserId, creator_username: username, email_address: email })
    if (!created) throw new Error('CREATOR_EXISTS')
    return json({ created: true, user_id: createdUserId }, 201)
  } catch {
    if (createdUserId) await adminClient().auth.admin.deleteUser(createdUserId)
    return json({ error: 'Bootstrap rejected.' }, 403)
  }
})
