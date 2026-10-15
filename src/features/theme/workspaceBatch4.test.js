import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { describe, expect, it } from 'vitest'

const read = name => readFileSync(join(cwd(),name),'utf8')
const css = read('src/features/theme/workspaceBatch4.css')
const app = read('src/App.jsx')
const avatars = read('src/features/admin/AvatarLibraryManagement.jsx')
const previous = read('src/features/theme/batch2Cleanup.css')

function luminance(hex) {
  const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255)
    .map(v=>v<=.04045 ? v/12.92 : ((v+.055)/1.055)**2.4)
  return rgb[0]*.2126 + rgb[1]*.7152 + rgb[2]*.0722
}
function contrast(a,b) {
  const l=luminance(a), r=luminance(b)
  return (Math.max(l,r)+.05)/(Math.min(l,r)+.05)
}

describe('Batch 4 — Avatar Library layout / behavior guardrails', () => {
  it('loads last, affects only avatar management and preserves login/dashboard', () => {
    expect(app).toContain("import './features/theme/workspaceBatch4.css'")
    expect(app.indexOf('workspaceBatch4.css')).toBeGreaterThan(app.indexOf('workspaceBatch3.css'))
    expect(css).toContain('.app-shell-horizontal .avatar-library-management')
    for (const other of ['.access-shell','.training-library','.saved-notes-page','.team-management','.navigator-role-switch']) {
      expect(css).not.toContain(other)
    }
  })
  it('avoids seven-rem thumbnail microcards and makes IDs wrap at 67 percent', () => {
    expect(css).toContain('repeat(auto-fill,minmax(min(100%,12rem),1fr))')
    expect(css).toContain('repeat(auto-fill,minmax(min(100%,9.5rem),1fr))')
    expect(css).toMatch(/\.avatar-library-card-id\s*\{[^}]*font-size:\s*var\(--ozzie-legible-meta[^}]*white-space:\s*normal;[^}]*overflow-wrap:\s*anywhere/s)
    expect(css).not.toContain('text-overflow: ellipsis')
    expect(css).not.toContain('grid-template-columns: repeat(8')
    expect(avatars).toContain('title={avatar.id}')
    expect(avatars).toContain('title={file.name}')
  })
  it('compacts upload panels without modifying accepted types or upload behavior', () => {
    expect(css).toContain('repeat(auto-fit, minmax(min(100%, 20rem), 1fr))')
    expect(css).toMatch(/\.avatar-file-picker input\[type="file"\]\s*\{[^}]*width:\s*100%/s)
    expect(css).toMatch(/\.avatar-upload-preview-grid\s*\{[^}]*max-height:\s*10rem;[^}]*overflow:\s*auto/s)
    expect(avatars).toContain("ACCEPTED_AVATAR_TYPES.join(',')")
    expect(avatars).toContain('uploadAvatarFiles(files)')
    expect(avatars).toContain('onChanged?.()')
  })
  it('preserves selectable cards, batch actions and confirmation-before-delete', () => {
    expect(avatars).toContain("onClick={() => setConfirmIds([avatar.id])}")
    expect(avatars).toContain("onClick={() => setConfirmIds([...selectedIds])}")
    expect(avatars).toContain('onConfirm={confirmDeletion}')
    expect(avatars).toContain('deleteAvatarIds(confirmIds)')
    expect(avatars).toContain('aria-label={`Select ${avatar.id}`}')
    expect(avatars).toContain('aria-label={`Delete ${avatar.id}`}')
    expect(css).toContain('.avatar-library-card:has(.avatar-library-checkbox input:checked)')
    expect(css).toContain('.avatar-library-actions button')
    expect(css).not.toMatch(/display:\s*none|pointer-events:\s*none|visibility:\s*hidden/)
  })
  it('keeps the already-correct Delete text and modal readable in both themes', () => {
    expect(previous).toContain('color: var(--cleanup-delete-ink) !important')
    expect(css).toContain('.avatar-library-card button.danger-action')
    expect(css).toContain('.avatar-delete-dialog .dialog-actions button.danger-action')
    expect(css).toContain('color: var(--cleanup-delete-ink) !important')
    expect(css).toContain('background: var(--cleanup-delete-bg) !important')
    expect(contrast('#862c33','#fff0f0')).toBeGreaterThanOrEqual(4.5)
    expect(contrast('#ffd8dd','#4c2933')).toBeGreaterThanOrEqual(4.5)
    expect(css).toContain(':focus-visible')
  })
})
