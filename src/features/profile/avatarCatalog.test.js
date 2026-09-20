import { expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { AVATAR_IDS, avatarUrl, isApprovedAvatarId } from './avatarCatalog'

it('exposes exactly the 103 new avatar identifiers', () => {
  expect(AVATAR_IDS).toHaveLength(103)
  expect(AVATAR_IDS.at(0)).toBe('avatar_001')
  expect(AVATAR_IDS.at(-1)).toBe('avatar_103')
  expect(isApprovedAvatarId('avatar_001')).toBe(true)
  expect(isApprovedAvatarId('avatar_103')).toBe(true)
  expect(isApprovedAvatarId('avatar_104')).toBe(false)
  expect(avatarUrl('avatar_104')).toBeNull()
  expect(AVATAR_IDS.every(id => fs.existsSync(path.resolve('public/avatars', `${id}.webp`)))).toBe(true)
})
