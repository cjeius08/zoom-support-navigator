import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { AppShell } from '../shell/AppShell'
import { formatCallDocumentation } from '../training/CallDocumentation'
import {
  REFERRAL_ROADBLOCKS,
  evaluateScope,
  getReferralGuidance,
} from './scopeCheckData'
import { LiveCallFlow, LiveCallFlowDetails } from '../navigator/LiveCallFlow'

const agentProfile = { username: 'agent_1', initials: 'AG', role: 'agent' }

it('freezes the Phase 5 live-tool inventory and support-boundary contract', () => {
  expect(REFERRAL_ROADBLOCKS).toHaveLength(11)
  expect(new Set(REFERRAL_ROADBLOCKS.map(item => item.id)).size).toBe(11)

  const ids = REFERRAL_ROADBLOCKS.map(item => item.id)
  expect(ids).toEqual(expect.arrayContaining([
    'waiting-room',
    'host-permission',
    'meeting-details',
    'join-unresolved',
    'account-admin',
    'hardware-not-detected',
    'managed-permission',
    'network-security',
    'possible-zoom-product',
    'proceeding-decision',
    'privacy-policy',
  ]))

  for (const roadblock of REFERRAL_ROADBLOCKS) {
    expect(roadblock.contact).toBeTruthy()
    expect(roadblock.boundary).toBeTruthy()
    expect(roadblock.language).toBeTruthy()
    expect(roadblock.categories.length).toBeGreaterThan(0)

    const combined = [roadblock.contact, roadblock.boundary, roadblock.language].join(' ')
    expect(combined).not.toMatch(/https?:\/\//i)
    expect(combined).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
    expect(combined).not.toMatch(/\bwe will escalate\b|\bi['’]ll escalate\b|\bZoom Support will fix\b/i)
  }
})

it('freezes all four Phase 5 scope outcomes', () => {
  expect(evaluateScope({
    category: '',
    troubleshooting: '',
    authority: '',
  }).label).toBe('MORE INFORMATION NEEDED')

  expect(evaluateScope({
    category: 'basic',
    troubleshooting: 'steps-remain',
    authority: 'safe',
  }).label).toBe('CONTINUE APPROVED TROUBLESHOOTING')

  expect(evaluateScope({
    category: 'host',
    troubleshooting: 'steps-remain',
    authority: 'safe',
  }).label).toBe('STOP + REFER')

  expect(evaluateScope({
    category: 'basic',
    troubleshooting: 'resolved',
    authority: 'safe',
  }).label).toBe('RESOLVED — DOCUMENT & CLOSE')
})

it('keeps the direct Zoom Support boundary routed through organization support first', () => {
  const guidance = getReferralGuidance('possible-zoom-product')

  expect(guidance.contact).toMatch(/Organization IT \/ Zoom administrator/i)
  expect(guidance.contact).toMatch(/determine whether Zoom Support is needed/i)
  expect(guidance.boundary).toMatch(/Do not promise or imply a direct Zoom escalation/i)
  expect(guidance.language).toMatch(/They can determine whether Zoom Support needs to be contacted/i)
})

it('keeps the complete documentation handoff fields in the approved copy format', () => {
  const output = formatCallDocumentation({
    callerName: 'Caller',
    phoneNumber: '555-0100',
    dateTime: '2026-09-19T02:00',
    callerRef: 'REF-1',
    device: 'Windows',
    accessContext: 'Zoom desktop app',
    exactIssue: 'Issue',
    stepsResult: 'Steps and result',
    resolutionNextSteps: 'Next step',
    recommendedContact: 'Organization IT / help desk',
    outcome: 'Referred for Additional Assistance',
  })

  const expectedLabels = [
    'Caller Name:',
    'Phone Number:',
    'Date and Time:',
    'Caller Ref:',
    'Device / Platform:',
    'Device and Access:',
    'Exact Issue:',
    'Steps Attempted + Result:',
    'Resolution / Next Steps:',
    'Recommended Contact (if referred):',
    'Call Outcome:',
  ]

  let lastIndex = -1
  for (const label of expectedLabels) {
    const index = output.indexOf(label)
    expect(index).toBeGreaterThan(lastIndex)
    lastIndex = index
  }

  expect(output).toContain('Recommended Contact (if referred): Organization IT / help desk')
  expect(output).toContain('Call Outcome: Referred for Additional Assistance')
})

it('keeps Documentation and Scope Check global, mutually visible, and preserves the documentation draft while switching', async () => {
  const user = userEvent.setup()
  const onNavigate = vi.fn()

  render(<AppShell profile={agentProfile} onNavigate={onNavigate}><div>Navigator stays here</div></AppShell>)

  await user.click(screen.getByRole('button', { name: 'Call Documentation' }))
  await user.type(screen.getByLabelText('Caller name'), 'Persistent Caller')
  expect(onNavigate).not.toHaveBeenCalled()

  await user.click(screen.getByRole('button', { name: 'Scope Check' }))
  expect(screen.getByRole('heading', { name: 'Scope Check' })).toBeInTheDocument()
  expect(screen.queryByLabelText('Caller name')).not.toBeInTheDocument()
  expect(onNavigate).not.toHaveBeenCalled()

  await user.click(screen.getByRole('button', { name: 'Call Documentation' }))
  expect(screen.getByLabelText('Caller name')).toHaveValue('Persistent Caller')
})

it('keeps referral wording in the approved detailed Call Flow aligned with Phase 5', () => {
  render(<><LiveCallFlow /><LiveCallFlowDetails /></>)

  expect(screen.queryByRole('button', { name: 'Referral Needed' })).not.toBeInTheDocument()
  expect(screen.getByText(/Use the current Scope Check \/ referral guidance/i)).toBeInTheDocument()
  expect(screen.getByText(/Do not promise a handoff/i)).toBeInTheDocument()
})

it('keeps Phase 5 live tools responsive and below the global report control', () => {
  const css = readFileSync(join(cwd(), 'src/styles.css'), 'utf8')

  const dockMatch = css.match(/\.documentation-dock\s*\{[\s\S]*?z-index:\s*(\d+)/)
  const reportMatch = css.match(/\.global-feedback-fab\s*\{[\s\S]*?z-index:\s*(\d+)/)

  expect(dockMatch).toBeTruthy()
  expect(reportMatch).toBeTruthy()
  expect(Number(reportMatch[1])).toBeGreaterThan(Number(dockMatch[1]))

  expect(css).toMatch(/@media\s*\(max-width:\s*800px\)[\s\S]*?\.documentation-dock\s*\{[^}]*width:\s*min\(23rem,\s*calc\(100vw\s*-\s*1\.2rem\)\)/)
  expect(css).toMatch(/@media\s*\(max-width:\s*480px\)[\s\S]*?\.documentation-dock\s*\{[^}]*left:\s*\.45rem[^}]*right:\s*\.45rem[^}]*width:\s*auto/)
  expect(css).toMatch(/\.scope-handoff-language button:focus-visible/)
})
