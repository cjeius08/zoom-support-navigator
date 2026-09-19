import { adminClient, requireUser } from '../_shared/clients.ts'
import { hashInvite, normalizeInitials, validInitials, validPassword, validUsername } from '../_shared/identity.ts'
import { json, options } from '../_shared/responses.ts'

type AdminAction =
  | { action: 'generate_invite'; initials: string; workspace_role?: 'member' | 'lead' }
  | { action: 'rename_username'; user_id: string; username: string }
  | { action: 'rename_initials'; user_id: string; initials: string }
  | { action: 'set_workspace_role'; user_id: string; workspace_role: 'member' | 'lead' }
  | { action: 'reset_password'; user_id: string; temporary_password: string }
  | { action: 'deactivate' | 'reactivate'; user_id: string }
  | { action: 'delete_permanently'; user_id: string; confirmation: string }

function sessionId(token: string) {
  const payload = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/')
  if (!payload) throw new Error('Invalid session')
  return JSON.parse(atob(payload)).session_id as string
}

function inviteCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(15))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase().match(/.{1,6}/g)?.join('-') ?? ''
}

async function requireCreator(request: Request) {
  const { token, user } = await requireUser(request)
  const admin = adminClient()
  const { data, error } = await admin.rpc('zoom_service_admin_actor_valid', { actor: user.id, session: sessionId(token) })
  if (error || data !== true) throw new Error('Not authorized')
  return { admin, actor: user.id }
}

function badRequest(message: string, request: Request) { return json({ error: message }, 400, request) }

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return options(request)
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, request)
  try {
    const payload = await request.json() as AdminAction
    const { admin, actor } = await requireCreator(request)
    if (payload.action === 'generate_invite') {
      if (!validInitials(payload.initials)) return badRequest('Initials must be 2–3 uppercase letters.', request)
      const workspaceRole = payload.workspace_role === 'lead' ? 'lead' : payload.workspace_role === 'member' || payload.workspace_role == null ? 'member' : null
      if (!workspaceRole) return badRequest('Role must be Member or Lead.', request)
      const code = inviteCode()
      const { error } = await admin.rpc('zoom_service_admin_generate_invite', { actor, requested_initials: normalizeInitials(payload.initials), requested_hash: await hashInvite(code), requested_workspace_role: workspaceRole })
      if (error) throw error
      return json({ invite_code: code, initials: normalizeInitials(payload.initials), workspace_role: workspaceRole }, 200, request)
    }
    if (payload.action === 'rename_username') {
      if (!validUsername(payload.username)) return badRequest('Username must use at least 3 lowercase letters, numbers, or underscores.', request)
      const { error } = await admin.rpc('zoom_service_admin_rename_username', { actor, target: payload.user_id, requested_username: payload.username })
      if (error) throw error
      return json({ updated: true }, 200, request)
    }
    if (payload.action === 'rename_initials') {
      if (!validInitials(payload.initials)) return badRequest('Initials must be 2–3 uppercase letters.', request)
      const { error } = await admin.rpc('zoom_service_admin_rename_initials', { actor, target: payload.user_id, requested_initials: normalizeInitials(payload.initials) })
      if (error) throw error
      return json({ updated: true }, 200, request)
    }
    if (payload.action === 'set_workspace_role') {
      if (payload.workspace_role !== 'member' && payload.workspace_role !== 'lead') return badRequest('Role must be Member or Lead.', request)
      const { error } = await admin.rpc('zoom_service_admin_set_workspace_role', {
        actor,
        target: payload.user_id,
        desired_workspace_role: payload.workspace_role,
      })
      if (error) throw error
      return json({ updated: true, workspace_role: payload.workspace_role }, 200, request)
    }
    if (payload.action === 'reset_password') {
      if (!validPassword(payload.temporary_password)) return badRequest('Temporary password must be at least 8 characters.', request)
      const { error: authError } = await admin.auth.admin.updateUserById(payload.user_id, { password: payload.temporary_password })
      if (authError) throw authError
      const { error } = await admin.rpc('zoom_service_admin_mark_password_reset', { actor, target: payload.user_id })
      if (error) throw error
      return json({ reset: true }, 200, request)
    }
    if (payload.action === 'deactivate' || payload.action === 'reactivate') {
      const { error } = await admin.rpc('zoom_service_admin_set_status', { actor, target: payload.user_id, desired_status: payload.action === 'deactivate' ? 'deactivated' : 'active' })
      if (error) throw error
      return json({ status: payload.action === 'deactivate' ? 'deactivated' : 'active' }, 200, request)
    }
    if (payload.action === 'delete_permanently') {
      const { error: prepareError } = await admin.rpc('zoom_service_admin_prepare_delete', { actor, target: payload.user_id, confirmation: payload.confirmation })
      if (prepareError) throw prepareError
      const { error } = await admin.auth.admin.deleteUser(payload.user_id)
      if (error) throw error
      return json({ deleted: true }, 200, request)
    }
    return badRequest('Unknown admin action.', request)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Admin action failed.'
    return json({ error: message === 'Not authorized' ? message : 'Admin action could not be completed.' }, message === 'Not authorized' ? 403 : 400, request)
  }
})
