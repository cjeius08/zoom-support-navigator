import { adminClient, requireUser } from '../_shared/clients.ts'
import { validPassword } from '../_shared/identity.ts'
import { json, options } from '../_shared/responses.ts'

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return options(request)
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, request)
  try {
    const { token, user } = await requireUser(request); const { password } = await request.json()
    if (!validPassword(String(password ?? ''))) return json({ error: 'Password must be at least 8 characters.' }, 400, request)
    const admin = adminClient(); const { error } = await admin.auth.admin.updateUserById(user.id, { password })
    if (error) throw error
    await admin.from('zoom_profiles').update({ must_change_password: false }).eq('id', user.id)
    return json({ changed: true }, 200, request)
  } catch { return json({ error: 'Password change failed.' }, 401, request) }
})
