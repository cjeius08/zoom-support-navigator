import { assetUrl } from '../../lib/assetUrl'

const EXCLUDED_AVATAR_IDS = new Set(
  Array.from({ length: 27 }, (_, index) => `avatar_${String(index + 151).padStart(3, '0')}`),
)

export const AVATAR_IDS = Object.freeze(
  Array.from({ length: 187 }, (_, index) => `avatar_${String(index + 1).padStart(3, '0')}`)
    .filter(id => !EXCLUDED_AVATAR_IDS.has(id)),
)

export const isApprovedAvatarId = avatarId => AVATAR_IDS.includes(avatarId)
export const getBundledAvatarRecords = () => AVATAR_IDS.map(id => ({
  id,
  source: 'bundled',
  src: assetUrl(`avatars/${id}.png`),
}))

export function avatarUrl(avatarId, avatars = null) {
  const record = avatars?.find?.(avatar => avatar.id === avatarId)
  if (record?.src) return record.src
  if (Array.isArray(avatars)) return null
  return isApprovedAvatarId(avatarId) ? assetUrl(`avatars/${avatarId}.png`) : null
}
