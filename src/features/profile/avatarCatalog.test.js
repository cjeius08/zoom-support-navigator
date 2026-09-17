import { expect, it } from 'vitest'
import { AVATAR_IDS, isApprovedAvatarId } from './avatarCatalog'
import fs from 'node:fs'
import path from 'node:path'

it('allows exactly the 187 approved bundled avatar identifiers', () => {
  expect(AVATAR_IDS).toHaveLength(160)
  expect(AVATAR_IDS.at(0)).toBe('avatar_001')
  expect(AVATAR_IDS.at(-1)).toBe('avatar_187')
  expect(AVATAR_IDS).not.toContain('avatar_151')
  expect(AVATAR_IDS).not.toContain('avatar_177')
  expect(isApprovedAvatarId('avatar_151')).toBe(false)
  expect(AVATAR_IDS.every(id => fs.existsSync(path.resolve('public/avatars', `${id}.png`)))).toBe(true)
})
