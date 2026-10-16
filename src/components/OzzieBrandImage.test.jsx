import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { OzzieBrandImage } from './OzzieBrandImage'
import { OZZIE_BRAND, ozzieBrandSrc } from '../lib/brandAssets'

const approved = {
  full: 'ozzie-for-ogletree-2026.svg',
  owl: 'ozzie-for-ogletree-owl-2026.svg',
  favicon: 'ozzie-for-ogletree-owl-2026.svg',
}

// Keep the prior official PNG files intact as historical brand archives.
const archived = {
  full: ['ozzie-official-full.png', '8477f94e6b66fd5871e2871078cc0988d7ed9411fda834aca57dcffd653d868f'],
  owl: ['ozzie-official-owl.png', '5b9587f265fa8e62ce86a14792284868cd98dccb23a37f8b4021a5009ca7a564'],
  favicon: ['ozzie-official-favicon.png', '3fa10cf825842de439c7078be2d449db0484faeab71f7a306804fdfdfea1483d'],
}

describe('approved Ozzie branding is locked', () => {
  it('renders the transparent full wordmark with accurate alternative text', () => {
    render(<OzzieBrandImage variant="full" />)
    const logo = screen.getByRole('img', { name: 'Ozzie for Ogletree' })
    expect(logo.getAttribute('src')).toContain(approved.full)
    expect(OZZIE_BRAND.fullAlt).toContain('Ogletree')
  })

  it('uses the owl-only artwork for compact icon use', () => {
    render(<OzzieBrandImage variant="owl" alt="Ozzie owl" />)
    expect(screen.getByRole('img', { name: 'Ozzie owl' }).getAttribute('src')).toContain(approved.owl)
    expect(() => ozzieBrandSrc('legacy')).toThrow('Unsupported Ozzie logo variant')
  })

  it('preserves previous PNG artwork unchanged as historical archives', () => {
    for (const [variant, [name, hash]] of Object.entries(archived)) {
      const data = readFileSync(join(cwd(), 'public/assets', name))
      expect(data.subarray(0, 8).toString('hex'), variant).toBe('89504e470d0a1a0a')
      expect(createHash('sha256').update(data).digest('hex'), variant).toBe(hash)
    }
  })


  it('locks the newly approved SVG assets and ensures embedded image data is present', () => {
    for (const variant of ['full', 'owl']) {
      const filename = approved[variant]
      expect(OZZIE_BRAND[variant]).toBe(`assets/${filename}`)
      const markup = readFileSync(join(cwd(), 'public/assets', filename), 'utf8')
      expect(markup).toContain('<svg')
      expect(markup).toContain('data:image/webp;base64,')
      expect(markup).toContain('</svg>')
    }
    expect(OZZIE_BRAND.favicon).toBe(OZZIE_BRAND.owl)
  })

  it('uses the matching owl favicon and full logo in both header and sign-in', () => {
    const html = readFileSync(join(cwd(), 'index.html'), 'utf8')
    const app = readFileSync(join(cwd(), 'src/App.jsx'), 'utf8')
    const shell = readFileSync(join(cwd(), 'src/features/shell/AppShell.jsx'), 'utf8')
    const css = readFileSync(join(cwd(), 'src/features/theme/logoLock.css'), 'utf8')
    expect(html).toContain(approved.favicon)
    expect(app).toContain('<OzzieBrandImage variant="full" className="login-brand-logo" />')
    expect(shell).toContain('<OzzieBrandImage variant="full" />')
    expect(app).not.toContain('ozzie-hq.png')
    expect(shell).not.toContain('ozzie-hq.png')
    expect(css).toMatch(/html\[data-theme="day"\]/)
    expect(css).toMatch(/html\[data-theme="night"\]/)
    expect(css).toContain('filter: none !important')
  })
})
