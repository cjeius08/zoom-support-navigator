import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { describe, expect, it, vi } from 'vitest'
import { DashboardWelcome } from './DashboardWelcome'
import { AppShell } from '../shell/AppShell'
import { updatesForAudience } from '../updates/updatesData'

const read=p=>readFileSync(join(cwd(),p),'utf8')
const dashboardCss=read('src/features/dashboard/dashboardReference.css')
const headerCss=read('src/features/shell/headerReference.css')
const app=read('src/App.jsx')

describe('Batch 7 reference screenshot layout and working actions',()=>{
  it('places welcome and feedback side by side, then five real updates, then four quick actions',()=>{
    render(<DashboardWelcome username="agent" />)
    const hero=screen.getByRole('heading',{name:'Welcome back!'}).closest('section')
    const feedback=screen.getByRole('heading',{name:'Help Ozzie grow and thrive.'}).closest('section')
    expect(hero.parentElement).toBe(feedback.parentElement)
    expect(hero.parentElement).toHaveClass('dashboard-feature-grid')
    const updates=screen.getByRole('heading',{name:'What’s New'}).closest('section')
    expect(within(updates).getAllByRole('article')).toHaveLength(5)
    const quick=screen.getByRole('region',{name:'Dashboard quick access'})
    expect(within(quick).getAllByRole('button')).toHaveLength(4)
    expect(hero.compareDocumentPosition(updates)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(updates.compareDocumentPosition(quick)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
  it('uses real authorized update records with valid source dates instead of mockup dates',()=>{
    render(<DashboardWelcome isAdmin={false} />)
    const updateSection=screen.getByRole('heading',{name:'What’s New'}).closest('section')
    const entries=within(updateSection).getAllByRole('article')
    const expected=updatesForAudience(false).slice(0,5)
    expect(entries).toHaveLength(expected.length)
    expected.forEach((entry,i)=>{
      expect(entries[i]).toHaveTextContent(entry.title)
      expect(within(entries[i]).getByText(entry.area)).toBeInTheDocument()
      expect(entries[i].querySelector('time')).toHaveAttribute('datetime',entry.date)
    })
  })
  it('retains functional feedback, updates and saved references actions',async()=>{
    const user=userEvent.setup()
    const onOpenFeedback=vi.fn(),onOpenUpdates=vi.fn(),onOpenFavorites=vi.fn()
    render(<DashboardWelcome onOpenFeedback={onOpenFeedback} onOpenUpdates={onOpenUpdates} onOpenFavorites={onOpenFavorites}/>)
    await user.click(screen.getByRole('button',{name:'Submit Feedback'}))
    await user.click(screen.getByRole('button',{name:/View All Updates/}))
    await user.click(within(screen.getByRole('region',{name:'Dashboard quick access'})).getByRole('button',{name:'My Favorites'}))
    expect(onOpenFeedback).toHaveBeenCalledTimes(1)
    expect(onOpenUpdates).toHaveBeenCalledTimes(1)
    expect(onOpenFavorites).toHaveBeenCalledTimes(1)
  })
  it('gives the header screenshot-style icons plus functional search and updates routes',async()=>{
    const user=userEvent.setup()
    const onDashboardSearch=vi.fn(),onDashboardUpdates=vi.fn()
    render(<AppShell profile={{username:'agent',initials:'AG',role:'agent'}} onDashboardSearch={onDashboardSearch} onDashboardUpdates={onDashboardUpdates}/>)
    expect(screen.getByRole('button',{name:'Dashboard'}).querySelector('.header-nav-icon')).toBeInTheDocument()
    expect(screen.getByText('Knowledge').closest('summary').querySelector('.header-nav-icon')).toBeInTheDocument()
    await user.click(screen.getByRole('button',{name:'Search Ozzie'}))
    await user.click(screen.getByRole('button',{name:"What's New and Updates"}))
    expect(onDashboardSearch).toHaveBeenCalledTimes(1)
    expect(onDashboardUpdates).toHaveBeenCalledTimes(1)
  })
  it('protects 67% zoom and narrow widths, both themes, real routes and prior Login',()=>{
    expect(dashboardCss).toMatch(/grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)/)
    expect(dashboardCss).toMatch(/grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/)
    expect(dashboardCss).toContain('@media (max-width:620px)')
    expect(dashboardCss).toContain('var(--ref-card)')
    expect(headerCss).toContain('var(--ref-border)')
    expect(headerCss).toContain('.topnav-menu')
    expect(headerCss).toContain('(hover:none) and (pointer:coarse)')
    expect(app).toContain("onOpenFeedback={() => navigate('feedback')}")
    expect(app).toContain("onOpenUpdates={() => navigate('updates')}")
    expect(app).toContain("onOpenFavorites={() => navigate('favorites')}")
    expect(dashboardCss+headerCss).not.toContain('.access-shell')
  })
})
