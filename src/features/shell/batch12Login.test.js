import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { expect, it } from 'vitest'
import { OZZIE_BRAND, ozzieBrandSrc } from '../../lib/brandAssets'

const read = path => readFileSync(join(cwd(), path), 'utf8')

it('uses one approved Ozzie for Ogletree logo family across the sign-in and header', () => {
  expect(OZZIE_BRAND.full).toBe('assets/ozzie-for-ogletree-2026.svg')
  expect(OZZIE_BRAND.owl).toBe('assets/ozzie-for-ogletree-owl-2026.svg')
  expect(OZZIE_BRAND.favicon).toBe(OZZIE_BRAND.owl)
  expect(OZZIE_BRAND.fullAlt).toMatch(/Ozzie for Ogletree/)
  expect(ozzieBrandSrc('full')).toMatch(/ozzie-for-ogletree-2026\.svg/)
  expect(read('public/assets/ozzie-for-ogletree-2026.svg')).toContain('data:image/webp;base64,')
  expect(read('public/assets/ozzie-for-ogletree-owl-2026.svg')).toContain('data:image/webp;base64,')
  expect(read('index.html')).toContain('ozzie-for-ogletree-owl-2026.svg')
})

it('keeps the real login and activation flow instead of fake buttons in the design mockup', () => {
  const app = read('src/App.jsx')
  const layout = app.slice(app.indexOf('if (activationOpen)'))
  expect(layout).toContain('onSubmit={submit}')
  expect(layout).toContain('name="username"')
  expect(layout).toContain('name="password"')
  expect(layout).toContain('setShowPassword')
  expect(layout).toContain('Activate Account')
  expect(layout).not.toContain('Forgot password?')
  expect(layout).not.toContain('Create account')
  expect(layout.match(/variant="full" className="login-brand-logo"/g)).toHaveLength(2)
})

it('ships responsive approved login styles and an identifiable production release', () => {
  const app = read('src/App.jsx')
  const css = read('src/features/shell/batch12Login.css')
  expect(app).toContain("import './features/shell/batch12Login.css'")
  expect(css).toMatch(/@media \(max-width: 850px\)/)
  expect(css).toMatch(/\.login-layout/)
  expect(css).toMatch(/\.login-benefit/)
  expect(read('index.html')).toContain('name="ozzie-release" content="batch-12"')
})
