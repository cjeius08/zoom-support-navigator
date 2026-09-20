import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AppShell } from './features/shell/AppShell'
import { Navigator } from './features/navigator/Navigator'
import { AvatarPicker } from './features/profile/AvatarPicker'
import { ProcessDrawer } from './features/navigator/ProcessDrawer'
import { FeedbackForm } from './features/feedback/FeedbackForm'
import { ActivateAccountForm } from './features/auth/ActivateAccountForm'
import { ForcePasswordChange } from './features/auth/ForcePasswordChange'
import { searchProcesses } from './features/navigator/smartSearch'
import { buildCallGuide } from './features/navigator/processText'
import { PROCESSES } from './data/processes'

const profile = { id:'u1', username:'agent_one', initials:'AO', role:'agent', avatar_id:null }

function read(path) {
  return readFileSync(join(cwd(), path), 'utf8')
}

describe('post-QA remediation gate', () => {
  it('removes closed mobile navigation from the accessibility tree and restores it when opened', async () => {
    const originalWidth = window.innerWidth
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 })
    window.dispatchEvent(new Event('resize'))
    const user = userEvent.setup()
    render(<AppShell profile={profile}><div>Content</div></AppShell>)

    const navigation = document.getElementById('primary-navigation')
    expect(navigation).toHaveAttribute('inert')
    expect(navigation).toHaveAttribute('aria-hidden', 'true')

    await user.click(screen.getByRole('button', { name: 'Toggle navigation' }))
    expect(navigation).not.toHaveAttribute('inert')
    expect(navigation).toHaveAttribute('aria-hidden', 'false')

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth })
    window.dispatchEvent(new Event('resize'))
  })

  it.each([
    ['mic not working', 'troubleshooting-speaker-or-microphone-issues-in-the-zoom-desktop-app'],
    ['They can’t hear me', 'troubleshooting-speaker-or-microphone-issues-in-the-zoom-desktop-app'],
    ['stuck waiting room', 'waiting-for-the-host-to-start-a-meeting-or-webinar'],
    ['host hasnt started meeting', 'waiting-for-the-host-to-start-a-meeting-or-webinar'],
    ['Where is the share screen button?', 'sharing-your-screen-desktop-or-content-in-zoom'],
  ])('ranks caller-language query %s to the intended route', (query, expectedId) => {
    expect(searchProcesses(PROCESSES, query)[0]?.id).toBe(expectedId)
  })

  it('does not duplicate referral lines in the call guide summary', () => {
    const process = PROCESSES.find(item => item.id === 'zoom-basic-support-boundaries-decision-path-referral-process')
    const guide = buildCallGuide(process)
    const referralCalloutLines = guide.callouts
      .filter(callout => callout.kind === 'referral')
      .flatMap(callout => callout.lines)
    expect(guide.referralDetails).not.toEqual(expect.arrayContaining(referralCalloutLines))
  })

  it('collapses long call guides behind an explicit show-more control without deleting steps', async () => {
    const user = userEvent.setup()
    const process = PROCESSES.find(item => item.id === 'sharing-your-screen-desktop-or-content-in-zoom')
    render(<ProcessDrawer process={process} onClose={() => {}} />)

    const totalSteps = buildCallGuide(process).steps.length
    expect(document.querySelectorAll('.call-step-card').length).toBeLessThan(totalSteps)
    const showMore = screen.getByRole('button', { name: /Show remaining steps/i })
    expect(showMore).toBeInTheDocument()
    await user.click(showMore)
    expect(document.querySelectorAll('.call-step-card')).toHaveLength(totalSteps)
    expect(screen.queryByRole('button', { name: /Show remaining steps/i })).not.toBeInTheDocument()
  })


  it('progressively discloses long source-script groups', async () => {
    const user = userEvent.setup()
    const process = PROCESSES.find(item => item.id === 'transferring-meetings-and-webinars-between-devices')
    const guide = buildCallGuide(process)
    render(<ProcessDrawer process={process} onClose={() => {}} />)

    expect(document.querySelectorAll('.suggested-script').length).toBeLessThan(guide.globalScripts.length)
    const showMore = screen.getByRole('button', { name: /Show remaining scripts/i })
    await user.click(showMore)
    expect(document.querySelectorAll('.suggested-script')).toHaveLength(guide.globalScripts.length)
  })

  it('progressively discloses oversized referral callouts', async () => {
    const user = userEvent.setup()
    const process = PROCESSES.find(item => item.id === 'zoom-basic-support-boundaries-decision-path-referral-process')
    const guide = buildCallGuide(process)
    const referral = guide.callouts.find(callout => callout.kind === 'referral')
    render(<ProcessDrawer process={process} onClose={() => {}} />)

    const referralCard = document.querySelector('.guide-callout.referral')
    expect(referralCard.querySelectorAll('.callout-line').length).toBeLessThan(referral.lines.length)
    await user.click(within(referralCard).getByRole('button', { name: /Show remaining referral details/i }))
    expect(referralCard.querySelectorAll('.callout-line')).toHaveLength(referral.lines.length)
  })

  it('uses one tab stop for the avatar grid and arrow keys to move selection', async () => {
    const user = userEvent.setup()
    render(<AvatarPicker selectedId="avatar-01" onSave={() => {}} onCancel={() => {}} />)

    const grid = screen.getByRole('radiogroup', { name: /avatar/i })
    const options = within(grid).getAllByRole('radio')
    expect(options.filter(option => option.tabIndex === 0)).toHaveLength(1)
    options[0].focus()
    await user.keyboard('{ArrowRight}')
    expect(options[1]).toHaveFocus()
    expect(options[1]).toHaveAttribute('aria-checked', 'true')
  })

  it('implements arrow-key navigation and panel relationships for process tabs', async () => {
    const user = userEvent.setup()
    render(<ProcessDrawer process={PROCESSES[0]} onClose={() => {}} />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs[0]).toHaveAttribute('aria-controls')
    tabs[0].focus()
    await user.keyboard('{ArrowRight}')
    expect(tabs[1]).toHaveFocus()
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', tabs[1].id)
  })

  it('associates feedback validation errors with the invalid field', async () => {
    const user = userEvent.setup()
    render(<FeedbackForm onSubmit={vi.fn()} onCancel={() => {}} />)
    await user.click(screen.getByRole('button', { name: /Send feedback/i }))
    const field = screen.getByLabelText(/What did you notice/i)
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(field.getAttribute('aria-describedby')).toBeTruthy()
  })


  it('associates activation validation with the first invalid field', async () => {
    const user = userEvent.setup()
    render(<ActivateAccountForm onActivate={vi.fn()} onCancel={() => {}} />)
    await user.click(screen.getByRole('button', { name: /^Activate$/i }))
    const username = screen.getByLabelText(/Choose username/i)
    expect(username).toHaveAttribute('aria-invalid', 'true')
    expect(username.getAttribute('aria-describedby')).toBeTruthy()
  })

  it('associates forced password errors with the relevant field', async () => {
    const user = userEvent.setup()
    render(<ForcePasswordChange onChange={vi.fn()} onLogout={() => {}} />)
    await user.click(screen.getByRole('button', { name: /Change Password/i }))
    const password = screen.getByLabelText('New Password')
    expect(password).toHaveAttribute('aria-invalid', 'true')
    expect(password.getAttribute('aria-describedby')).toBeTruthy()
  })

  it('associates profile password errors with the relevant field', async () => {
    const user = userEvent.setup()
    render(<AppShell profile={profile} onPasswordChange={vi.fn()}><div>Content</div></AppShell>)
    await user.click(screen.getByRole('button', { name: /agent_one account/i }))
    await user.click(screen.getByRole('button', { name: 'Change Password' }))
    await user.click(screen.getByRole('button', { name: 'Save Password' }))
    const password = screen.getByLabelText(/New password/i)
    expect(password).toHaveAttribute('aria-invalid', 'true')
    expect(password.getAttribute('aria-describedby')).toBeTruthy()
  })

  it('locks page scrolling while a dialog is open', () => {
    const process = PROCESSES[0]
    render(<ProcessDrawer process={process} onClose={() => {}} />)
    expect(document.documentElement).toHaveStyle({ overflow: 'hidden' })
  })

  it('marks the active Home destination for assistive technology', () => {
    render(<AppShell profile={profile} currentView="navigator"><div>Content</div></AppShell>)
    expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
  })

  it('contains a migration that revokes client execution of rls_auto_enable and adds foreign-key indexes', () => {
    const migration = read('supabase/migrations/20260918004151_post_qa_security_performance_hardening.sql')
    expect(migration).toMatch(/revoke\s+execute\s+on\s+function\s+public\.rls_auto_enable\(\)/i)
    expect(migration).toMatch(/zoom_agent_slots_claimed_by_idx/i)
    expect(migration).toMatch(/zoom_feedback_status_history_changed_by_idx/i)
  })
})
