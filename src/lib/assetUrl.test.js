import { describe, expect, it } from 'vitest'
import { assetUrl } from './assetUrl'

describe('assetUrl', () => {
  it('generates GitHub Pages-safe paths', () => {
    expect(assetUrl('assets/rendered/page.png', '/zoom-support-navigator/')).toBe('/zoom-support-navigator/assets/rendered/page.png')
    expect(assetUrl('/avatars/avatar_001.png', '/zoom-support-navigator/')).toBe('/zoom-support-navigator/avatars/avatar_001.png')
  })
})
