import { assetUrl } from '../../lib/assetUrl'

export const AVATAR_IDS = Object.freeze(
  Array.from({ length: 103 }, (_, index) => `avatar_${String(index + 1).padStart(3, '0')}`),
)

export const isApprovedAvatarId = avatarId => AVATAR_IDS.includes(avatarId)
export const avatarUrl = avatarId => isApprovedAvatarId(avatarId) ? assetUrl(`avatars/${avatarId}.webp`) : null
