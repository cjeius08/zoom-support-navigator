import { expect, it } from 'vitest'
import { AVATAR_IDS, avatarUrl, isApprovedAvatarId } from './avatarCatalog'

it('has no approved avatars while the library is being replaced', () => {
  expect(AVATAR_IDS).toEqual([])
  expect(isApprovedAvatarId('avatar_001')).toBe(false)
  expect(avatarUrl('avatar_001')).toBeNull()
})
