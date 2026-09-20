import { assetUrl } from '../../lib/assetUrl'
import { supabase, supabaseConfigured } from '../../lib/supabaseClient'

export const AVATAR_IDS = Object.freeze(
  Array.from({ length: 103 }, (_, index) => `avatar_${String(index + 1).padStart(3, '0')}`),
)

const UPLOADED_AVATAR_PATTERN = /^uploaded_[0-9a-f-]{36}\.(webp|png|jpg)$/i

export const isUploadedAvatarId = avatarId => UPLOADED_AVATAR_PATTERN.test(String(avatarId || ''))
export const isApprovedAvatarId = avatarId => AVATAR_IDS.includes(avatarId) || isUploadedAvatarId(avatarId)

export const avatarUrl = avatarId => {
  if (AVATAR_IDS.includes(avatarId)) return assetUrl(`avatars/${avatarId}.webp`)
  if (!isUploadedAvatarId(avatarId) || !supabaseConfigured || !supabase) return null
  return supabase.storage.from('zoom-avatars').getPublicUrl(`library/${avatarId}`).data.publicUrl
}

export async function loadAvatarCatalog() {
  if (!supabaseConfigured || !supabase) {
    return AVATAR_IDS.map(id => ({
      id,
      source: 'static',
      storage_path: null,
      original_filename: null,
      created_at: null,
    }))
  }

  const { data, error } = await supabase
    .from('zoom_avatar_catalog')
    .select('id,source,storage_path,original_filename,created_at')

  if (error) throw error

  return [...(data || [])].sort((a, b) => {
    if (a.source !== b.source) return a.source === 'static' ? -1 : 1
    return String(a.id).localeCompare(String(b.id))
  })
}

export async function loadAvailableAvatarIds() {
  return (await loadAvatarCatalog()).map(item => item.id)
}
