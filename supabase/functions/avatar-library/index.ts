import { adminClient, requireUser } from '../_shared/clients.ts'
import { json, options } from '../_shared/responses.ts'

const BUCKET = 'zoom-avatars'
const TABLE = 'zoom_avatar_catalog'
const MAX_FILE_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])

function sessionId(token: string) {
  const payload = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/')
  if (!payload) throw new Error('Invalid session')
  return JSON.parse(atob(payload))?.session_id as string
}

async function requireCreator(request: Request) {
  const { token, user } = await requireUser(request)
  const admin = adminClient()
  const { data, error } = await admin.rpc('zoom_service_admin_actor_valid', {
    actor: user.id,
    session: sessionId(token),
  })
  if (error || data !== true) throw new Error('Not authorized')
  return { admin, actor: user.id }
}

function extensionFor(type: string) {
  return type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg'
}

async function uploadFiles(admin: ReturnType<typeof adminClient>, actor: string, files: File[]) {
  const uploaded: Array<{ id: string; name: string }> = []
  const failed: Array<{ name: string; error: string }> = []
  const bucket = admin.storage.from(BUCKET)

  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      failed.push({ name: file.name, error: 'Only PNG, JPG/JPEG, and WEBP images are supported.' })
      continue
    }
    if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
      failed.push({ name: file.name, error: 'Images must be smaller than 5 MB.' })
      continue
    }

    const id = `avatar_${crypto.randomUUID()}`
    const storagePath = `${id}.${extensionFor(file.type)}`
    const { error: uploadError } = await bucket.upload(storagePath, file, {
      contentType: file.type,
      cacheControl: '31536000',
      upsert: false,
    })
    if (uploadError) {
      failed.push({ name: file.name, error: 'The image could not be stored.' })
      continue
    }

    const { error: insertError } = await admin.from(TABLE).insert({
      id,
      source: 'storage',
      storage_path: storagePath,
      original_filename: file.name,
      created_by: actor,
    })
    if (insertError) {
      await bucket.remove([storagePath])
      failed.push({ name: file.name, error: 'The avatar record could not be created.' })
      continue
    }
    uploaded.push({ id, name: file.name })
  }

  return { uploaded, failed }
}

async function deleteAvatars(admin: ReturnType<typeof adminClient>, ids: string[]) {
  const uniqueIds = [...new Set(ids)]
  if (!uniqueIds.length || uniqueIds.length > 100) throw new Error('Select between 1 and 100 avatars.')

  const { data: rows, error: loadError } = await admin
    .from(TABLE)
    .select('id,storage_path')
    .in('id', uniqueIds)
  if (loadError) throw loadError

  const byId = new Map((rows || []).map(row => [row.id, row]))
  const deleted: string[] = []
  const failed: Array<{ id: string; error: string }> = []
  const bucket = admin.storage.from(BUCKET)

  for (const id of uniqueIds) {
    const row = byId.get(id)
    if (!row) {
      failed.push({ id, error: 'Avatar was not found.' })
      continue
    }
    if (row.storage_path) {
      const { error: storageError } = await bucket.remove([row.storage_path])
      if (storageError) {
        failed.push({ id, error: 'The avatar file could not be removed.' })
        continue
      }
    }
    const { error: deleteError } = await admin.from(TABLE).delete().eq('id', id)
    if (deleteError) {
      failed.push({ id, error: 'The avatar record could not be removed.' })
      continue
    }
    deleted.push(id)
  }

  return { deleted, failed }
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return options(request)
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, request)

  try {
    const { admin, actor } = await requireCreator(request)
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      if (String(form.get('action') || '') !== 'upload') {
        return json({ error: 'Unknown avatar action.' }, 400, request)
      }
      const files = form.getAll('files').filter(value => value instanceof File) as File[]
      if (!files.length) return json({ error: 'Choose at least one image.' }, 400, request)
      return json(await uploadFiles(admin, actor, files), 200, request)
    }

    const payload = await request.json() as { action?: string; avatar_ids?: unknown }
    if (payload.action !== 'delete' || !Array.isArray(payload.avatar_ids) || !payload.avatar_ids.every(id => typeof id === 'string')) {
      return json({ error: 'Invalid avatar delete request.' }, 400, request)
    }
    return json(await deleteAvatars(admin, payload.avatar_ids as string[]), 200, request)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Avatar action failed.'
    const status = message === 'Not authorized' || message === 'UNAUTHORIZED' ? 403 : 400
    return json({ error: status === 403 ? 'Not authorized' : 'Avatar action could not be completed.' }, status, request)
  }
})
