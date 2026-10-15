import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { describe, expect, it } from 'vitest'

const read = path => readFileSync(join(cwd(), path), 'utf8')
const css = read('src/features/theme/workspaceBatch3.css')
const app = read('src/App.jsx')
const adminNotes = read('src/features/admin/SavedNotesPage.jsx')
const myNotes = read('src/features/notes/MySavedNotesPage.jsx')
const team = read('src/features/admin/AdminViews.jsx')

const lum = h => {
  const v = [1,3,5].map(i => parseInt(h.slice(i,i+2),16)/255)
    .map(x => x<=.04045 ? x/12.92 : ((x+.055)/1.055)**2.4)
  return v[0]*.2126 + v[1]*.7152 + v[2]*.0722
}
const contrast = (a,b) => {
  const x=lum(a),y=lum(b)
  return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)
}

describe('Batch 3: dense responsive Saved Notes, Follow-Ups, and Team Management', () => {
  it('loads last and remains scoped to signed-in pages, preserving login and prior batches', () => {
    expect(app).toContain("import './features/theme/workspaceBatch3.css'")
    expect(app.indexOf('workspaceBatch3.css')).toBeGreaterThan(app.indexOf('batch2Cleanup.css'))
    expect(css).not.toContain('.access-shell')
    expect(css).not.toContain('.readiness-lab')
    expect(css).not.toContain('.avatar-library-card')
    expect(css).not.toContain('.training-library')
  })

  it('replaces fixed note columns with content-driven tracks and two-column metadata', () => {
    expect(css).toContain('repeat(auto-fit,minmax(min(100%,11rem),1fr))')
    expect(css).toContain('repeat(auto-fit,minmax(min(100%,10.5rem),1fr))')
    expect(css).toContain('repeat(auto-fit,minmax(min(100%,27rem),1fr))')
    expect(css).toContain('grid-template-columns: repeat(2,minmax(0,1fr))')
    expect(css).toContain('grid-template-columns: minmax(0,1fr)')
    expect(css).toMatch(/\.saved-note-meta dd\s*\{[^}]*white-space:\s*normal;[^}]*overflow-wrap:\s*anywhere/s)
    expect(css).toMatch(/\.saved-note-card > header\s*\{[^}]*flex-wrap:\s*wrap/s)
    expect(css).not.toMatch(/text-overflow:\s*ellipsis/)
  })

  it('does not suppress notes, alter retention or remove destructive confirmation', () => {
    expect(css).not.toMatch(/display:\s*none|visibility:\s*hidden|pointer-events:\s*none/)
    expect(css).not.toMatch(/max-height:\s*0/)
    expect(adminNotes).toContain('loadCallNotesReport({})')
    expect(adminNotes).toContain('deleteCallNoteAsAdmin(note.id)')
    expect(adminNotes).toContain('window.confirm(')
    expect(myNotes).toContain('loadAllOwnCallNotes()')
    expect(adminNotes).toContain('<details className="saved-note-details">')
    expect(myNotes).toContain('className="saved-note-details" open={selected || undefined}')
  })

  it('keeps follow-up filter active states explicit in member and admin views', () => {
    for(const source of [adminNotes,myNotes]) {
      expect(source).toContain('aria-pressed={!followUpOnly}')
      expect(source).toContain('aria-pressed={followUpOnly}')
      expect(source).toContain('setFollowUpOnly(true)')
      expect(source).toContain('setFollowUpOnly(false)')
      expect(source).toContain("const FOLLOW_UP_OUTCOME = 'Follow-Up Required'")
    }
    expect(css).toContain('.saved-note-card.follow-up')
    expect(css).toContain('.saved-note-follow-badge')
    expect(css).toContain('var(--batch3-follow-bg)')
  })

  it('keeps team presence, pending invite and account actions while reducing empty width', () => {
    expect(css).toContain('repeat(auto-fit,minmax(min(100%,28rem),1fr))')
    expect(css).toContain('grid-template-columns: 2.6rem minmax(0,1fr) auto')
    expect(css).toContain('.team-list article > .row-menu')
    expect(css).toContain('.team-list article > .status-badge')
    expect(css).toContain('.team-list article > .presence-badge')
    expect(css).toContain('@media (max-width: 520px)')
    for(const hook of ['loadTeam()', 'runAdminAction(payload)', 'action: "generate_invite"', 'setSelected(person)', 'status-badge ${person.status}', 'className="profile-panel admin-dialog"']) {
      expect(team,hook).toContain(hook)
    }
  })

  it('has accessible warning / follow-up ink and safe Day and Night colors', () => {
    expect(contrast('#74430b','#fff7e8')).toBeGreaterThanOrEqual(4.5)
    expect(contrast('#ffdc9d','#342d21')).toBeGreaterThanOrEqual(4.5)
    expect(contrast('#173249','#f9fbfc')).toBeGreaterThanOrEqual(4.5)
    expect(contrast('#f1f6f8','#192a35')).toBeGreaterThanOrEqual(4.5)
    expect(css).toContain('color: var(--cleanup-delete-ink) !important')
    expect(css).toContain('font-size: var(--ozzie-legible-meta,.9rem)')
    expect(css).toContain('white-space: normal')
  })
})
