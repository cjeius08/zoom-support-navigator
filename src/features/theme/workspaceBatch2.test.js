import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { describe, expect, it } from 'vitest'

const load = path => readFileSync(join(cwd(), path), 'utf8')
const css = load('src/features/theme/workspaceBatch2.css')
const app = load('src/App.jsx')
const usage = load('src/features/admin/AdminViews.jsx')
const feedback = load('src/features/feedback/FeedbackForm.jsx')
const portal = load('src/features/feedback/GlobalFeedbackButton.jsx')

describe('Batch 2 — compact feedback, analytics and data quality', () => {
  it('loads after Day/Night and 67% zoom safeguards without touching login', () => {
    expect(app).toContain("import './features/theme/workspaceBatch2.css'")
    expect(app.indexOf("workspaceBatch2.css")).toBeGreaterThan(app.indexOf("workspaceBatch1.css"))
    expect(css).not.toContain('.access-shell')
    expect(css).not.toContain('.access-card')
    expect(css).not.toContain('--workspace-image')
    expect(css).not.toContain('.readiness-part-rail')
  })

  it('styles both inline feedback and the portal-mounted global feedback dialog', () => {
    expect(portal).toContain('createPortal(')
    expect(portal).toContain('document.body,')
    expect(css).toContain('html:is([data-theme="day"],[data-theme="night"]) .global-feedback-dialog')
    expect(css).toContain('.app-shell-horizontal .feedback-form-panel')
    expect(css).toMatch(/form textarea\s*\{[^}]*min-height:\s*5\.5rem;[^}]*resize:\s*vertical/s)
    expect(css).toContain('.dialog-actions button:not([type="button"])')
    expect(feedback).toContain('aria-invalid={errorField ===')
    expect(feedback).toContain('maxLength={4000}')
    expect(feedback).toContain('onSubmit={submit}')
  })

  it('compacts Feedback Queue while preserving actual status and expanded details', () => {
    for (const name of [
      '.feedback-list',
      '.feedback-item-row',
      '.feedback-item-toggle',
      '.feedback-item-preview',
      '.feedback-item-details',
      '.feedback-status-control select',
    ]) expect(css, name).toContain(name)
    expect(usage).toContain('onClick={() => toggleExpanded(item.id)}')
    expect(usage).toContain('onChange={(event) => changeStatus(item, event.target.value)}')
  })

  it('reflows analytics cards and keeps scrollable tables at 67% browser zoom', () => {
    expect(css).toContain('repeat(auto-fit,minmax(min(100%,11rem),1fr))')
    expect(css).toContain('repeat(auto-fit,minmax(min(100%,14rem),1fr))')
    expect(css).toMatch(/\.usage-summary \.usage-summary-time\s*\{[^}]*white-space:\s*normal/s)
    expect(css).toMatch(/\.usage-chart-column small\s*\{[^}]*white-space:\s*normal/s)
    expect(css).toMatch(/\.usage-table-wrap\s*\{[^}]*overflow-x:\s*auto/s)
    expect(css).toContain('@media (max-width: 900px)')
    expect(css).toContain('@media (max-width: 600px)')
    expect(usage).toContain('buildUsageReport({')
    expect(usage).toContain('loadUsage(range)')
  })

  it('lays out Data Quality definitions without dropping any data', () => {
    expect(css).toMatch(/\.usage-data-integrity ul\s*\{[^}]*grid-template-columns:\s*repeat\(2,minmax\(0,1fr\)\)/s)
    expect(css).toMatch(/@media \(max-width: 900px\)[\s\S]*?\.usage-data-integrity ul\s*\{[^}]*grid-template-columns:\s*minmax\(0,1fr\)/s)
    expect(css).toContain('overflow-wrap: anywhere')
    expect(usage).toContain('role="note"')
    expect(usage).toContain('Data and metric definitions')
    expect(usage).toContain('unmatchedEventCount')
    expect(usage).toContain('unendedSessionCount')
  })

  it('does not hide data or alter permission, destructive or saved-note behavior', () => {
    expect(css).not.toMatch(/display:\s*none/)
    expect(css).not.toMatch(/visibility:\s*hidden/)
    expect(css).not.toContain('pointer-events: none')
    expect(css).not.toContain('.saved-note-card')
    expect(css).not.toContain('.avatar-library-card')
    expect(css).not.toContain('.team-list')
  })

  it('retains a readable typography floor without giving compact cards fixed heights', () => {
    expect(css).toContain('/* Last-mile typography: readable labels at 67%, never fixed-height clipping.')
    for (const selector of [
      '.usage-summary span',
      '.usage-overview-highlights small',
      '.usage-section-tabs button strong',
      '.usage-chart-column small',
      '.usage-data-integrity li',
      '.feedback-item-type',
      '.feedback-status-control select',
    ]) {
      expect(css, selector).toContain(selector)
    }
    expect(css).toContain('font-size: var(--ozzie-legible-meta) !important')
    expect(css).toContain('font-size: var(--ozzie-legible-body) !important')
    expect(css).toContain('white-space: normal')
    expect(css).toContain('overflow-wrap: break-word')
    expect(css).toContain('height: auto')
  })



  it('contrast patch keeps neutral, selected and warning copy legible in both themes', () => {
    const patch = css.split('/* Batch 2 follow-up: semantic contrast across all report states and themes.')[1]
    expect(patch).toBeTruthy()
    for (const selector of [
      '.usage-empty-state',
      '.usage-report-heading p:last-child',
      '.usage-summary span',
      '.usage-section-tabs button.active',
      '.usage-period-controls button.active',
      '.usage-filter-toggle.active',
      '.usage-support-switch button.active',
      '.usage-data-integrity li',
      '.usage-validation-message',
      '.global-feedback-dialog',
      '.feedback-page .empty-state'
    ]) expect(patch, selector).toContain(selector)
    for (const variable of [
      '--read-ink', '--read-body', '--read-bg', '--read-soft',
      '--read-selected', '--batch2-warning-ink', '--batch2-error-ink'
    ]) expect(patch, variable).toContain(variable)
    expect(patch).not.toMatch(/display:\s*none|visibility:\s*hidden|grid-template-columns:|max-height:/)
    expect(patch).not.toContain('.avatar-library-card')
    expect(patch).not.toContain('.saved-note-card')
    expect(patch).not.toContain('.team-list')
  })

  it('uses AA-contrast semantic warning/error colors in both Day and Night Mode', () => {
    const hex = {
      day: {bg:'#f9fbfc',warn:'#85500b',error:'#9b342a'},
      night: {bg:'#192a35',warn:'#ffd28a',error:'#ffb8ae'}
    }
    const luminance = color => {
      const a = [1,3,5].map(i => parseInt(color.slice(i,i+2),16)/255)
        .map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4)
      return a[0]*.2126+a[1]*.7152+a[2]*.0722
    }
    const contrast = (a,b) => {
      const x = luminance(a), y = luminance(b)
      return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)
    }
    for (const mode of ['day','night']) {
      expect(contrast(hex[mode].bg,hex[mode].warn)).toBeGreaterThanOrEqual(4.5)
      expect(contrast(hex[mode].bg,hex[mode].error)).toBeGreaterThanOrEqual(4.5)
      expect(css).toContain('--batch2-warning-ink: ' + hex[mode].warn + ';')
      expect(css).toContain('--batch2-error-ink: ' + hex[mode].error + ';')
    }
  })


})
