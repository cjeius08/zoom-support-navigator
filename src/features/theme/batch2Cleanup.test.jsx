import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FavoriteToggle } from '../favorites/FavoriteToggle'
import { FavoritesView } from '../favorites/FavoritesView'
import { Navigator } from '../navigator/Navigator'
import { HostLibrary } from '../navigator/HostLibrary'
import { hostFastestTopics } from '../../data/hostExperience'
import { HOST_ROADBLOCKS } from '../../data/arbitratorHostSupport'

const read = name => readFileSync(join(cwd(),name),'utf8')
const css = read('src/features/theme/batch2Cleanup.css')
const app = read('src/App.jsx')
const full = read('src/features/training/TrainingResources.jsx')
const adminNotes = read('src/features/admin/SavedNotesPage.jsx')
const avatars = read('src/features/admin/AvatarLibraryManagement.jsx')

function lum(color) {
  const x=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255)
    .map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4)
  return x[0]*.2126+x[1]*.7152+x[2]*.0722
}
function contrast(a,b) {
  const x=lum(a), y=lum(b)
  return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)
}

describe('Batch 2 cleanup regression — favorites, training, destructive actions',()=>{
  it('uses the official Ozzie owl instead of a star while preserving aria-pressed',async()=>{
    const user=userEvent.setup()
    const onToggle=vi.fn()
    render(<FavoriteToggle label="test resource" onToggle={onToggle} />)
    const button=screen.getByRole('button',{name:'Add to Favorites'})
    expect(button).toHaveAttribute('aria-pressed','false')
    expect(button.querySelector('img')).toHaveAttribute('src',expect.stringContaining('ozzie-for-ogletree-owl-2026.svg'))
    await user.click(button)
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('restores saving in default Host mode using existing supported common_issue IDs',async()=>{
    const user=userEvent.setup()
    const onToggleFavorite=vi.fn()
    const first=hostFastestTopics()[0]
    render(<HostLibrary
      libraryTab="fastest"
      query=""
      topicMatches={[]}
      roadblockMatches={[]}
      processMatches={[]}
      processes={[]}
      faqItems={[]}
      onToggleFavorite={onToggleFavorite}
    />)
    const hostCard=screen.getByText(first.title).closest('button')
    const favorite=within(hostCard.closest('article')).getByRole('button',{name:'Add to Favorites'})
    await user.click(favorite)
    expect(onToggleFavorite).toHaveBeenCalledWith('common_issue', 'host:'+first.id)
  })

  it('opens saved Host topics and roadblocks from My Quick Access',async()=>{
    const user=userEvent.setup()
    const first=hostFastestTopics()[0]
    const roadblock=HOST_ROADBLOCKS[0]
    const open=vi.fn()
    render(<FavoritesView
      favorites={[
        {itemType:'common_issue',itemId:'host:'+first.id,createdAt:'2026-10-15T12:00:00Z'},
        {itemType:'common_issue',itemId:'host-roadblock:'+roadblock.id,createdAt:'2026-10-15T12:01:00Z'}
      ]}
      onOpenCommonIssue={open}
    />)
    expect(screen.getByText(first.title)).toBeInTheDocument()
    expect(screen.getByText(roadblock.title)).toBeInTheDocument()
    await user.click(screen.getByText(first.title).closest('button'))
    expect(open).toHaveBeenCalledWith('host:'+first.id)
    await user.click(screen.getByText(roadblock.title).closest('button'))
    expect(open).toHaveBeenCalledWith('host-roadblock:'+roadblock.id)
  })

  it('can open the saved Host guide directly in Navigator',()=>{
    const first=hostFastestTopics()[0]
    render(<Navigator initialCommonIssueId={'host:'+first.id} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('includes major Training & Resources surfaces without retheming video frames',()=>{
    for(const target of [
      '.training-card','.roadmap-module > article',
      '.guided-lesson-panel','.device-walkthrough-panel',
      '.communication-panel','.scenario-script-card','.training-viewer'
    ]) expect(css,target).toContain(target)
    expect(full).toContain('className="console-view training-library"')
    expect(css).not.toContain('.video-frame iframe')
    expect(css).not.toContain('display: none')
    expect(css).not.toContain('overflow: hidden')
    expect(css).not.toContain('max-height: 0')
  })

  it('restores readable delete actions in notes and avatar library',()=>{
    expect(adminNotes).toContain('className="danger-action"')
    expect(adminNotes).toContain("'Delete note'")
    expect(avatars).toContain('aria-label=')
    expect(avatars).toContain('className="danger-action"')
    expect(css).toContain('button.danger-action')
    expect(css).toContain('color: var(--cleanup-delete-ink) !important')
    expect(css).toContain('background: var(--cleanup-delete-bg) !important')
    expect(css).toContain('border: 1px solid var(--cleanup-delete-border) !important')
    expect(contrast('#862c33','#fff0f0')).toBeGreaterThanOrEqual(4.5)
    expect(contrast('#ffd8dd','#4c2933')).toBeGreaterThanOrEqual(4.5)
  })

  it('loads cleanup last and keeps layouts flexible at 67% browser zoom',()=>{
    expect(app).toContain("import './features/theme/batch2Cleanup.css'")
    expect(app.indexOf('batch2Cleanup.css')).toBeGreaterThan(app.indexOf('workspaceBatch2.css'))
    expect(css).not.toContain('.access-shell')
    expect(css).not.toContain('pointer-events: none')
    expect(css).not.toContain('grid-template-columns: repeat(5')
  })
})
