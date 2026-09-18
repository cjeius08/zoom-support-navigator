import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import {
  REFERRAL_ROADBLOCKS,
  ScopeCheck,
  evaluateScope,
  getReferralGuidance,
  getReferralRoadblocks,
} from './ScopeCheck'

it('continues approved troubleshooting only when the issue stays inside scope', () => {
  expect(evaluateScope({
    category: 'basic',
    troubleshooting: 'steps-remain',
    authority: 'safe',
  })).toMatchObject({
    state: 'assist',
    label: 'CONTINUE APPROVED TROUBLESHOOTING',
  })
})

it('stops and refers when an immediate roadblock is selected', () => {
  expect(evaluateScope({
    category: 'host',
    troubleshooting: 'not-started',
    authority: 'safe',
  })).toMatchObject({
    state: 'refer',
    label: 'STOP + REFER',
  })

  expect(evaluateScope({
    category: 'basic',
    troubleshooting: 'exhausted',
    authority: 'safe',
  })).toMatchObject({
    state: 'refer',
    title: 'Approved troubleshooting is exhausted',
  })

  expect(evaluateScope({
    category: 'basic',
    troubleshooting: 'steps-remain',
    authority: 'guess',
  })).toMatchObject({
    state: 'refer',
    title: 'The next action is outside approved authority',
  })
})

it('documents resolved calls instead of referring them', () => {
  expect(evaluateScope({
    category: 'device',
    troubleshooting: 'resolved',
    authority: 'safe',
  })).toMatchObject({
    state: 'resolved',
    label: 'RESOLVED — DOCUMENT & CLOSE',
  })
})

it('locks the approved referral matrix to eleven source-backed roadblocks', () => {
  expect(REFERRAL_ROADBLOCKS).toHaveLength(11)
  expect(new Set(REFERRAL_ROADBLOCKS.map(item => item.id)).size).toBe(11)

  for (const roadblock of REFERRAL_ROADBLOCKS) {
    expect(roadblock.label).toBeTruthy()
    expect(roadblock.contact).toBeTruthy()
    expect(roadblock.boundary).toBeTruthy()
    expect(roadblock.language).toBeTruthy()
    expect(roadblock.categories.length).toBeGreaterThan(0)
  }

  expect(getReferralGuidance('waiting-room')).toMatchObject({
    contact: expect.stringMatching(/Meeting host/i),
    language: expect.stringMatching(/Admission is controlled by the meeting host/i),
  })
  expect(getReferralGuidance('network-security')).toMatchObject({
    contact: 'Organization IT / network support',
    language: expect.stringMatching(/network or security settings/i),
  })
  expect(getReferralGuidance('possible-zoom-product')).toMatchObject({
    contact: expect.stringMatching(/they determine whether Zoom Support is needed/i),
  })
})

it('prioritizes referral roadblocks that match the scope decision', () => {
  const host = getReferralRoadblocks({ category: 'host', troubleshooting: 'not-started' })
  expect(host.recommended.map(item => item.id)).toEqual(expect.arrayContaining([
    'waiting-room',
    'host-permission',
    'meeting-details',
    'join-unresolved',
  ]))

  const exhausted = getReferralRoadblocks({ category: 'basic', troubleshooting: 'exhausted' })
  expect(exhausted.recommended.map(item => item.id)).toEqual(expect.arrayContaining([
    'join-unresolved',
    'possible-zoom-product',
  ]))
})

it('walks from stop decision to exact handoff contact and approved wording', async () => {
  const user = userEvent.setup()
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  })

  render(<ScopeCheck open />)

  await user.click(screen.getByRole('button', { name: /Host action or meeting-owner permission/i }))
  await user.click(screen.getByRole('button', { name: /Approved troubleshooting not started yet/i }))
  await user.click(screen.getByRole('button', { name: /No — next step stays inside approved scope/i }))

  expect(screen.getByText('STOP + REFER')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: /What exact roadblock did you identify/i })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Waiting Room admission' }))

  expect(screen.getAllByText(/Meeting host, meeting organizer, or contact listed in the meeting invitation/i).length).toBeGreaterThanOrEqual(2)
  expect(screen.getByText(/agent cannot admit the participant/i)).toBeInTheDocument()
  expect(screen.getByText(/Admission is controlled by the meeting host/i)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Copy handoff wording' }))
  expect(writeText).toHaveBeenCalledWith(expect.stringMatching(/Admission is controlled by the meeting host/i))
  expect(screen.getByRole('button', { name: 'Copied handoff wording' })).toBeInTheDocument()
})

it('does not guess a referral contact until an approved roadblock is selected', async () => {
  const user = userEvent.setup()
  render(<ScopeCheck open />)

  await user.click(screen.getByRole('button', { name: /Zoom admin, account, license/i }))
  await user.click(screen.getByRole('button', { name: /Approved troubleshooting not started yet/i }))
  await user.click(screen.getByRole('button', { name: /No — next step stays inside approved scope/i }))

  expect(screen.getByText(/Select the exact roadblock before ending the call/i)).toBeInTheDocument()
  expect(screen.queryByText('WHO OWNS THE NEXT STEP')).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /Zoom account, sign-in, license, role, or administrative permission/i }))
  expect(screen.getByText('WHO OWNS THE NEXT STEP')).toBeInTheDocument()
  expect(screen.getAllByText('Organization IT / help desk or Zoom administrator').length).toBeGreaterThanOrEqual(2)
})

it('clears handoff selection when a scope answer changes', async () => {
  const user = userEvent.setup()
  render(<ScopeCheck open />)

  await user.click(screen.getByRole('button', { name: /Host action or meeting-owner permission/i }))
  await user.click(screen.getByRole('button', { name: /Approved troubleshooting not started yet/i }))
  await user.click(screen.getByRole('button', { name: /No — next step stays inside approved scope/i }))
  await user.click(screen.getByRole('button', { name: 'Host-controlled feature or permission' }))

  expect(screen.getByText('WHO OWNS THE NEXT STEP')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /Zoom admin, account, license/i }))
  expect(screen.queryByText('WHO OWNS THE NEXT STEP')).not.toBeInTheDocument()
  expect(screen.getByText(/Select the exact roadblock before ending the call/i)).toBeInTheDocument()
})

it('can be minimized and restored like the documentation dock', () => {
  const { rerender } = render(<ScopeCheck open />)
  expect(screen.getByRole('heading', { name: 'Scope Check' })).toBeInTheDocument()

  rerender(<ScopeCheck open minimized />)
  expect(screen.getByLabelText('Scope Check minimized')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Restore Scope Check' })).toBeInTheDocument()
})

it('keeps the approved source visible and never promises an internal escalation', () => {
  render(<ScopeCheck open />)

  expect(screen.getByText(/Zoom Basic Support Boundaries, Decision Path & Referral Process/i)).toBeInTheDocument()
  expect(screen.queryByText(/we will escalate/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/Zoom Support will fix/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/I’ll escalate this/i)).not.toBeInTheDocument()
})
