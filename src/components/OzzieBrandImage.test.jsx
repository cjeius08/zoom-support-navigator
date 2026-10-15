import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { OzzieBrandImage } from './OzzieBrandImage'
import { OZZIE_BRAND, ozzieBrandSrc } from '../lib/brandAssets'

const approved = {
  full: ['ozzie-official-full.png', '8477f94e6b66fd5871e2871078cc0988d7ed9411fda834aca57dcffd653d868f'],
  owl: ['ozzie-official-owl.png', '5b9587f265fa8e62ce86a14792284868cd98dccb23a37f8b4021a5009ca7a564'],
  favicon: ['ozzie-official-favicon.png', '3fa10cf825842de439c7078be2d449db0484faeab71f7a306804fdfdfea1483d'],
}

describe('approved Ozzie branding is locked', () => {
  it('renders the transparent full wordmark with accurate alternative text', () => {
    render(<OzzieBrandImage variant="full" />)
    const logo = screen.getByRole('img', { name: 'Ozzie — Ogletree Support Workspace' })
    expect(logo.getAttribute('src')).toContain(approved.full[0])
    expect(OZZIE_BRAND.fullAlt).toContain('Ogletree')
  })

  it('uses the owl-only artwork for compact icon use', () => {
    render(<OzzieBrandImage variant="owl" alt="Ozzie owl" />)
    expect(screen.getByRole('img', { name: 'Ozzie owl' }).getAttribute('src')).toContain(approved.owl[0])
    expect(() => ozzieBrandSrc('legacy')).toThrow('Unsupported Ozzie logo variant')
  })

  it('keeps exact approved PNG bytes, including transparency, across future changes', () => {
    for (const [variant, [name, hash]] of Object.entries(approved)) {
      const data = readFileSync(join(cwd(), 'public/assets', name))
      expect(data.subarray(0, 8).toString('hex'), variant).toBe('89504e470d0a1a0a')
      expect(createHash('sha256').update(data).digest('hex'), variant).toBe(hash)
    }
  })

  it('uses the matching owl favicon and full logo in both header and sign-in', () => {
    const html = readFileSync(join(cwd(), 'index.html'), 'utf8')
    const app = readFileSync(join(cwd(), 'src/App.jsx'), 'utf8')
    const shell = readFileSync(join(cwd(), 'src/features/shell/AppShell.jsx'), 'utf8')
    const css = readFileSync(join(cwd(), 'src/features/theme/logoLock.css'), 'utf8')
    expect(html).toContain(approved.favicon[0])
    expect(app).toContain('<OzzieBrandImage variant="full" className="login-brand-logo" />')
    expect(shell).toContain('<OzzieBrandImage variant="full" />')
    expect(app).not.toContain('ozzie-hq.png')
    expect(shell).not.toContain('ozzie-hq.png')
    expect(css).toMatch(/html\[data-theme="day"\]/)
    expect(css).toMatch(/html\[data-theme="night"\]/)
    expect(css).toContain('filter: none !important')
  })
})
