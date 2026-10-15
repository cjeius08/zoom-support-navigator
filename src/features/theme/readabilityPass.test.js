import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { describe, expect, it } from 'vitest'

const read = path => readFileSync(join(cwd(), path), 'utf8')
const root = 'src/features/theme/'
const tokens = read(root+'readabilityTokens.css')
const knowledge = read(root+'readabilityKnowledge.css')
const flows = read(root+'readabilityFlows.css')
const docs = read(root+'readabilityDocumentation.css')
const admin = read(root+'readabilityAdmin.css')
const app = read('src/App.jsx')
const sourceReader = read('src/features/knowledge/ProcessDocuments.jsx')

function luminance(hex) {
  const channels = [1,3,5].map(i => parseInt(hex.slice(i,i+2),16)/255)
  const rgb = channels.map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4)
  return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722
}
function ratio(a,b) {
  const x=luminance(a), y=luminance(b)
  return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)
}
function color(theme,token) {
  const block = tokens.match(new RegExp('html\\[data-theme="'+theme+'"\\]\\s*\\{([\\s\\S]*?)\\}'))?.[1]
  expect(block, theme).toBeTruthy()
  const match = block.match(new RegExp(token+':\\s*(#[0-9a-fA-F]{6})'))
  expect(match, theme + ' ' + token).toBeTruthy()
  return match[1]
}

describe('Ozzie Day/Night readability checkpoint', () => {
  for (const theme of ['day','night']) {
    it(theme + ' pairs surface colors with accessible text and button contrast', () => {
      const bg=color(theme,'--read-bg')
      for (const token of ['--read-ink','--read-body','--read-muted','--read-link']) {
        expect(ratio(bg,color(theme,token)), theme+' '+token).toBeGreaterThanOrEqual(4.5)
      }
      expect(ratio('#ffffff',color(theme,'--read-button'))).toBeGreaterThanOrEqual(4.5)
    })
  }
  it('loads surface/text correction after the header and original theme styles', () => {
    const imports=['readabilityTokens.css','readabilityKnowledge.css','readabilityFlows.css','readabilityDocumentation.css','readabilityAdmin.css']
    let previous=app.indexOf("headerReadability.css")
    for (const file of imports) {
      const index=app.indexOf(file)
      expect(index).toBeGreaterThan(previous)
      previous=index
    }
  })
  it('keeps full-detail background, theme control and official logo untouched', () => {
    for (const css of [knowledge,flows,docs,admin]) {
      expect(css).not.toMatch(/\.app-shell::(?:before|after)|background-image:|--workspace-image|\.ozzie-brand-dock/)
    }
    expect(app).toContain("import './features/theme/logoLock.css'")
    expect(app).toContain("import './features/theme/typography.css'")
  })
  it('fixes conflicting white source reader inline background without changing source content', () => {
    expect(sourceReader).not.toContain("background: 'var(--surface, #fff)'")
    expect(sourceReader).toContain('process-document-text-page')
    for(const selector of ['.process-document-card','.process-document-reader-toolbar','.process-document-pages > article.process-document-page','.process-document-transcription','.flex-hub-view']) {
      expect(knowledge).toContain(selector)
    }
    expect(knowledge).toContain('--hub-card: var(--read-bg)')
  })
  it('covers the actual call flow, guides, floating call notes, and reporting surfaces', () => {
    for (const selector of ['.route-card','.live-call-workflow-panel','.live-call-table','.process-drawer','.common-issue-step-list article']) {
      expect(flows).toContain(selector)
    }
    for (const selector of ['.documentation-dock','.documentation-dock-field','.documentation-dock-outcomes button','.documentation-dock-preview pre']) {
      expect(docs).toContain(selector)
    }
    for (const selector of ['.usage-analytics','.saved-note-card','.usage-section-tabs button','.usage-table-wrap table','.feedback-list article']) {
      expect(admin).toContain(selector)
    }
  })
  it('keeps statuses and action semantics instead of hiding issues with global overrides', () => {
    for (const css of [knowledge,flows,docs,admin]) {
      expect(css).not.toMatch(/display:\s*none\s*!important|pointer-events:\s*none\s*!important/)
    }
    expect(admin).toContain('Keep success, pending, offline, warning')
  })
})
