import { assetUrl } from './assetUrl'
import { supabase, supabaseConfigured } from './supabaseClient'
import { getBundledAvatarRecords } from '../features/profile/avatarCatalog'

export const AVATAR_LIBRARY_BUCKET = 'zoom-avatars'
export const ACCEPTED_AVATAR_TYPES = Object.freeze(['image/png', 'image/jpeg', 'image/webp'])
export const MAX_AVATAR_FILE_BYTES = 5 * 1024 * 1024

export function avatarRecordFromRow(row) {
  const src = row.source === 'storage'
    ? supabase.storage.from(AVATAR_LIBRARY_BUCKET).getPublicUrl(row.storage_path).data.publicUrl
    : assetUrl(row.asset_path || `avatars/${row.id}.png`)
  return {
    id: row.id,
    source: row.source === 'storage' ? 'uploaded' : 'bundled',
    src,
    storagePath: row.storage_path || null,
    mimeType: row.mime_type || null,
  }
}

export async function loadAvatarLibrary() {
  if (!supabaseConfigured) return getBundledAvatarRecords()
  const { data, error } = await supabase
    .from('zoom_avatar_catalog')
    .select('id,source,storage_path,original_filename,created_at')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data || []).map(avatarRecordFromRow)
}

async function invokeAvatarAction(body) {
  if (!supabaseConfigured) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.functions.invoke('avatar-library', { body })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data
}

export function validateAvatarFile(file) {
  if (!file || !ACCEPTED_AVATAR_TYPES.includes(file.type)) {
    return 'Only PNG, JPG/JPEG, and WEBP images are supported.'
  }
  if (file.size <= 0 || file.size > MAX_AVATAR_FILE_BYTES) {
    return 'Images must be smaller than 5 MB.'
  }
  return ''
}

export async function uploadAvatarFiles(files) {
  const form = new FormData()
  form.set('action', 'upload')
  files.forEach(file => form.append('files', file, file.name))
  return invokeAvatarAction(form)
}

export async function deleteAvatarIds(avatarIds) {
  return invokeAvatarAction({ action: 'delete', avatar_ids: avatarIds })
}
