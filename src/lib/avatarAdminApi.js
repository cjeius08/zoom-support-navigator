import { supabase, supabaseConfigured } from './supabaseClient'

export const AVATAR_BUCKET = 'zoom-avatars'
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024

const ALLOWED_TYPES = new Map([
  ['image/webp', 'webp'],
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
])

function ensureConfigured() {
  if (!supabaseConfigured || !supabase) throw new Error('Supabase is not configured.')
}

function normalizeFiles(fileList) {
  return Array.from(fileList || []).filter(Boolean)
}

function validateFiles(files) {
  if (!files.length) throw new Error('Choose at least one image to upload.')
  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      throw new Error(`${file.name}: only WEBP, PNG, and JPG images are allowed.`)
    }
    if (file.size > MAX_AVATAR_BYTES) {
      throw new Error(`${file.name}: file is larger than 5 MB.`)
    }
  }
}

function sortAvatarRows(rows = []) {
  return [...rows].sort((a, b) => {
    if (a.source !== b.source) return a.source === 'static' ? -1 : 1
    return String(a.id).localeCompare(String(b.id))
  })
}

export async function loadAvatarLibrary() {
  ensureConfigured()
  const { data, error } = await supabase
    .from('zoom_avatar_catalog')
    .select('id,source,storage_path,original_filename,created_at')
  if (error) throw error
  return sortAvatarRows(data || [])
}

export async function uploadAvatarFiles(fileList) {
  ensureConfigured()
  const files = normalizeFiles(fileList)
  validateFiles(files)

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  const userId = sessionData.session?.user?.id
  if (!userId) throw new Error('You must be signed in as an admin.')

  const created = []
  try {
    for (const file of files) {
      const extension = ALLOWED_TYPES.get(file.type)
      const id = `uploaded_${crypto.randomUUID()}.${extension}`
      const storagePath = `library/${id}`
      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(storagePath, file, {
          cacheControl: '3600',
          contentType: file.type,
          upsert: false,
        })
      if (uploadError) throw uploadError

      const { data, error: catalogError } = await supabase
        .from('zoom_avatar_catalog')
        .insert({
          id,
          source: 'storage',
          storage_path: storagePath,
          original_filename: file.name,
          created_by: userId,
        })
        .select('id,source,storage_path,original_filename,created_at')
        .single()

      if (catalogError) {
        await supabase.storage.from(AVATAR_BUCKET).remove([storagePath])
        throw catalogError
      }

      created.push(data)
    }

    return created
  } catch (error) {
    if (created.length) {
      const ids = created.map(item => item.id)
      const paths = created.map(item => item.storage_path).filter(Boolean)
      await supabase.from('zoom_avatar_catalog').delete().in('id', ids)
      if (paths.length) await supabase.storage.from(AVATAR_BUCKET).remove(paths)
    }
    throw error
  }
}

export async function deleteAvatarIds(ids) {
  ensureConfigured()
  const uniqueIds = [...new Set((ids || []).map(String).filter(Boolean))]
  if (!uniqueIds.length) throw new Error('Select at least one avatar to delete.')

  const { data: rows, error: loadError } = await supabase
    .from('zoom_avatar_catalog')
    .select('id,source,storage_path')
    .in('id', uniqueIds)
  if (loadError) throw loadError

  const { error: deleteError } = await supabase
    .from('zoom_avatar_catalog')
    .delete()
    .in('id', uniqueIds)
  if (deleteError) throw deleteError

  const paths = (rows || [])
    .filter(item => item.source === 'storage' && item.storage_path)
    .map(item => item.storage_path)

  let cleanupWarning = ''
  if (paths.length) {
    const { error: storageError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .remove(paths)
    if (storageError) {
      cleanupWarning = 'The avatars were removed from the library, but one or more stored image files could not be cleaned up.'
    }
  }

  return {
    deletedIds: (rows || []).map(item => item.id),
    cleanupWarning,
  }
}
