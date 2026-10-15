import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { describe, expect, it } from 'vitest'

const source = path => readFileSync(join(cwd(),path),'utf8')
const css = source('src/features/theme/readabilitySearchHostFix.css')
const app = source('src/App.jsx')
const navigator = source('src/features/navigator/Navigator.jsx')
const host = source('src/features/navigator/HostSupportDrawer.jsx')
const colors = source('src/features/theme/readabilityTokens.css')

function token(theme, name) {
  const group = colors.match(new RegExp('html\\[data-theme="'+theme+'"\\]\\s*\\{([\\s\\S]*?)\\}'))?.[1]
  return group?.match(new RegExp(name+':\\s*(#[\\da-fA-F]{6})'))?.[1] || null
}
function lum(color) {
  const rgb = [1,3,5].map(x=>parseInt(color.slice(x,x+2),16)/255)
    .map(v=>v<=.04045 ? v/12.92 : ((v+.055)/1.055)**2.4)
  return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]
}
function contrast(a,b) {
  const x=lum(a), y=lum(b)
  return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)
}

describe('Smart Search & Host guided drawer Day/Night contrast hotfix',()=>{
  it('loads after all earlier theme and 67% zoom CSS',()=>{
    expect(app).toContain("import './features/theme/readabilitySearchHostFix.css'")
    expect(app.indexOf('readabilitySearchHostFix.css')).toBeGreaterThan(app.indexOf('workspaceBatch2.css'))
    expect(css).not.toContain('.access-shell')
    expect(css).not.toContain('.saved-note-card')
    expect(css).not.toContain('.avatar-library-card')
  })
  it('uses contrasting colors in Day and Night even for selected/hover controls',()=>{
    for(const theme of ['day','night']) {
      const bg=token(theme,'--read-bg'), soft=token(theme,'--read-soft')
      const selected=token(theme,'--read-selected')
      for(const text of ['--read-ink','--read-body','--read-link']) {
        for(const surface of [bg,soft,selected]) {
          expect(contrast(token(theme,text),surface),theme+' '+text+' vs '+surface).toBeGreaterThanOrEqual(4.5)
        }
      }
    }
  })
  it('overrides hardcoded pale titles, tiny category badges and truncated search descriptions',()=>{
    expect(navigator).toContain('className="search-suggestions"')
    expect(navigator).toContain('className="search-suggestion-copy"')
    expect(navigator).toContain('role="option"')
    expect(css).toContain('.search-suggestion-copy strong')
    expect(css).toContain('.search-suggestion-copy small')
    expect(css).toContain('.search-suggestion-category')
    expect(css).toMatch(/\.search-suggestion-copy small\s*\{[^}]*color:\s*var\(--read-body\)[^}]*white-space:\s*normal/s)
    expect(css).toContain('grid-template-columns: minmax(0,1fr)')
    expect(css).toContain('background: var(--read-selected)')
  })
  it('styles Host/Arbitrator script text, source reference, Back bar, and role switch',()=>{
    for(const target of [
      '.navigator-role-switch button[aria-pressed="true"]',
      '.host-troubleshooting-back-row',
      '.host-troubleshooting-back-row small',
      '.host-troubleshooting-back-row .guide-back-step',
      '.host-common-issue-script-card blockquote',
      '.common-issue-script-source a',
      '.host-device-options button[aria-pressed="true"]',
      '.host-step-confirm'
    ])expect(css,target).toContain(target)
    expect(host).toContain('className="host-common-issue-script-card"')
    expect(host).toContain('className="host-troubleshooting-back-row"')
    expect(host).toContain('className="common-issue-script-source"')
    expect(host).toContain('onClick={copySuggestedScript}')
    expect(host).toContain('onClick={goBack}')
    expect(host).toContain('aria-pressed={device === option}')
  })
  it('keeps selection, results and drawer interaction behavior unchanged',()=>{
    expect(css).not.toMatch(/display:\s*none|pointer-events:\s*none|visibility:\s*hidden/)
    expect(css).not.toContain('max-height: 0')
    expect(navigator).toContain('aria-activedescendant={showSuggestions')
    expect(navigator).toContain('onClick={() => selectSuggestion(suggestion)}')
    expect(host).toContain("chooseGate('Yes'")
    expect(host).toContain("chooseGate('No'")
  })
})
