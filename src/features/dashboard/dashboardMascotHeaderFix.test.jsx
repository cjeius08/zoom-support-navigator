import { readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DashboardWelcome } from './DashboardWelcome'
import { AppShell } from '../shell/AppShell'

const read = p => readFileSync(join(cwd(),p),'utf8')
const styles = read('src/features/shell/headerOverlapFix.css')
const shell = read('src/features/shell/AppShell.jsx')
const app = read('src/App.jsx')
const dashboard = read('src/features/dashboard/DashboardWelcome.jsx')

describe('Screenshot QA correction — separate owls and safe navigation control layout', () => {
  it('uses the uploaded welcome owl AND the distinct lightbulb owl in the correct cards', () => {
    render(<DashboardWelcome username="agent" />)
    const hero = screen.getByRole('heading', { name: 'Welcome back!' }).closest('section')
    const feedback = screen.getByRole('heading', { name: 'Help Ozzie grow and thrive.' }).closest('section')
    const openArms = hero.querySelector('img')
    const idea = feedback.querySelector('img.dashboard-feedback-mascot')
    expect(openArms).toHaveAttribute('src',expect.stringContaining('ozzie-welcome-open-arms.webp'))
    expect(idea).toHaveAttribute('src',expect.stringContaining('ozzie-feedback-idea.webp'))
    expect(openArms.getAttribute('src')).not.toEqual(idea.getAttribute('src'))
    for (const name of ['ozzie-welcome-open-arms.webp','ozzie-feedback-idea.webp']) {
      const file = join(cwd(),'public/assets',name)
      const bytes = readFileSync(file)
      expect(statSync(file).size).toBeGreaterThan(10000)
      expect(bytes.toString('ascii',0,4)).toBe('RIFF')
      expect(bytes.toString('ascii',8,12)).toBe('WEBP')
    }
  })

  it('groups search, notifications, and profile in a shared rail (never independent absolute blocks)', () => {
    render(<AppShell profile={{username:'sample_user',initials:'SU',role:'agent'}}/>)
    const account = screen.getByRole('button',{name:'sample_user account'})
    const search = screen.getByRole('button',{name:'Search Ozzie'})
    const bell = screen.getByRole('button',{name:"What's New and Updates"})
    const rail = account.closest('.ozzie-header-right-rail')
    expect(rail).toBeInTheDocument()
    expect(rail).toContainElement(search)
    expect(rail).toContainElement(bell)
    expect(rail.parentElement).toHaveClass('app-header-brand-row')
    expect(shell).toContain('className="ozzie-header-right-rail"')
  })

  it('uses flow layout and real responsive breakpoints at 67%, desktop and mobile', () => {
    expect(app).toContain("import './features/shell/headerOverlapFix.css'")
    expect(app.indexOf('headerOverlapFix.css')).toBeGreaterThan(app.indexOf('headerReference.css'))
    expect(styles).toContain('grid-template-columns: minmax(10.5rem,12.2rem) minmax(0,1fr) auto')
    expect(styles).toContain('grid-template-columns: minmax(0,1fr) auto')
    expect(styles).toContain('.ozzie-header-right-rail .account-menu')
    expect(styles).toContain('position: static !important')
    expect(styles).toContain('@media (min-width: 801px) and (max-width: 1340px)')
    expect(styles).toContain('@media (max-width: 800px), (hover: none) and (pointer: coarse)')
    expect(styles).toContain('@media (max-width: 520px)')
    expect(styles).not.toContain('.access-shell')
    expect(styles).not.toContain('.feedback-page')
    expect(styles).not.toContain('.topnav-menu { display: none')
    expect(dashboard).toContain('assets/ozzie-welcome-open-arms.webp')
    expect(dashboard).toContain('assets/ozzie-feedback-idea.webp')
  })
})
