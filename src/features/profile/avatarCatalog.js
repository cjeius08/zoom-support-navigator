const EXCLUDED_AVATAR_IDS = new Set(
  Array.from({ length: 27 }, (_, index) => `avatar_${String(index + 151).padStart(3, '0')}`),
)

export const AVATAR_IDS = Object.freeze(
  Array.from({ length: 187 }, (_, index) => `avatar_${String(index + 1).padStart(3, '0')}`)
    .filter(id => !EXCLUDED_AVATAR_IDS.has(id)),
)

export const isApprovedAvatarId = avatarId => AVATAR_IDS.includes(avatarId)
export const avatarUrl = avatarId => isApprovedAvatarId(avatarId) ? `/avatars/${avatarId}.png` : null
