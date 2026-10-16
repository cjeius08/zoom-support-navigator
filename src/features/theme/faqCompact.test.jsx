import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { FAQ_ITEMS } from '../../data/supportReference'
import { hostFaqItems } from '../../data/hostExperience'
import { HostLibrary } from '../navigator/HostLibrary'
import { Navigator } from '../navigator/Navigator'

const read = p => readFileSync(join(cwd(),p),'utf8')
const css = read('src/features/theme/faqCompact.css')
const app = read('src/App.jsx')
const host = read('src/features/navigator/HostLibrary.jsx')
const nav = read('src/features/navigator/Navigator.jsx')

describe('Compact but readable Host and Participant FAQs',()=>{
  it('preserves every Host FAQ title and answer without collapsing or truncating information',()=>{
    render(<HostLibrary libraryTab="faq" query="" processes={[]} faqItems={FAQ_ITEMS}/>)
    const section = screen.getByRole('heading',{name:'Host / Arbitrator FAQ'}).closest('section')
    expect(section).toHaveClass('faq-compact-view')
    const cards=section.querySelectorAll('.support-reference-grid > article')
    const hostApproved = hostFaqItems(FAQ_ITEMS)
    expect(cards).toHaveLength(hostApproved.length)
    for(const item of hostApproved) {
      const card=Array.from(cards).find(x=>x.querySelector('h3')?.textContent===item.label)
      expect(card, item.label).toBeDefined()
      expect(card).toHaveTextContent(item.answer)
      for(const point of item.points || []) expect(card).toHaveTextContent(point)
    }
  })

  it('preserves all Participant FAQ cards and links in the same compact layout',async()=>{
    const user=userEvent.setup()
    render(<Navigator initialRole="Participant"/>)
    await user.click(screen.getByRole('tab',{name:'FAQ'}))
    const section=screen.getByRole('heading',{name:'Need to Know / FAQ'}).closest('section')
    expect(section).toHaveClass('faq-compact-view')
    expect(section.querySelectorAll('.support-faq-grid > article')).toHaveLength(FAQ_ITEMS.length)
    for(const item of FAQ_ITEMS) {
      const article=Array.from(section.querySelectorAll('.support-faq-grid > article'))
        .find(card=>card.querySelector('h3')?.textContent===item.label)
      expect(article,item.label).toBeDefined()
      expect(article).toHaveTextContent(item.answer)
    }
    expect(within(section).getByRole('link',{name:/Zoom Meetings Support Troubleshooting/i})).toHaveAttribute('href',expect.stringContaining('support.zoom.com'))
  })

  it('keeps FAQ cards dense while allowing full answers to wrap at 67% and on mobile',()=>{
    expect(css).toContain('grid-template-columns: repeat(3,minmax(0,1fr))')
    expect(css).toContain('grid-template-columns: repeat(2,minmax(0,1fr))')
    expect(css).toContain('grid-template-columns: minmax(0,1fr)')
    expect(css).toContain('@media (max-width:1250px)')
    expect(css).toContain('@media (max-width:720px)')
    expect(css).toContain('line-height: 1.46')
    expect(css).toContain('overflow-wrap: anywhere')
    expect(css).toContain('font-size: var(--ozzie-legible-body,1rem) !important')
    expect(css).not.toMatch(/line-clamp|text-overflow:\s*ellipsis|max-height:\s*0|display:\s*none/)
  })

  it('only affects FAQ tabs, retains approved blue/near-black colors and existing route logic',()=>{
    expect(app).toContain("import './features/theme/faqCompact.css'")
    expect(app.indexOf('faqCompact.css')).toBeGreaterThan(app.indexOf('finalQaBatch9.css'))
    expect(host).toContain('className="support-reference-view faq-compact-view"')
    expect(nav).toContain('className="support-reference-view faq-compact-view"')
    expect(css).toContain('var(--read-ink)')
    expect(css).toContain('var(--read-body)')
    expect(css).toContain('var(--read-bg)')
    expect(css).toContain('var(--read-border)')
    expect(css).not.toContain('.access-shell')
    expect(css).not.toContain('.roadblock-matrix-row')
  })
})
