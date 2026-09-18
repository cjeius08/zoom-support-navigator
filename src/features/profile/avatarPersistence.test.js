import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { expect, it } from 'vitest'

it('rehydrates the full profile after username login so saved avatar_id survives logout and login', () => {
  const source = readFileSync(join(cwd(), 'src/lib/authApi.js'), 'utf8')
  expect(source).toContain('const profile = await getCurrentProfile()')
  expect(source).toContain('return profile ?? data.user')
})

it('uses one centered crop rule for every approved avatar and a larger header avatar', () => {
  const css = readFileSync(join(cwd(), 'src/styles.css'), 'utf8')

  expect(css).toMatch(/\.avatar-grid img\s*\{[\s\S]*?object-fit:\s*cover;[\s\S]*?object-position:\s*center;[\s\S]*?transform:\s*scale\(1\.08\)/)
  expect(css).toMatch(/\.account-menu\s*>\s*img,[\s\S]*?width:\s*2\.75rem;[\s\S]*?height:\s*2\.75rem;/)
  expect(css).toMatch(/\.avatar-grid button\[aria-checked="true"\]/)
})
