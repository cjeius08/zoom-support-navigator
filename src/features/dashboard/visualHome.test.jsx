import { afterEach, beforeEach, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Navigator } from '../navigator/Navigator'
import { DashboardWelcome } from './DashboardWelcome'
import { approvedQuickAnswer } from '../navigator/answerFirst'
import { routeById } from '../navigator/commonIssueRoutes'
import { hostTopics } from '../../data/hostExperience'

beforeEach(() => {
  window.localStorage.removeItem('ozzie.visualHome.mode.v1')
  window.localStorage.removeItem('ozzie.answerFirst.mode.v1')
})
afterEach(() => { cleanup(); window.localStorage.removeItem('ozzie.visualHome.mode.v1') })

it('uses short Visual Home by default while retaining the original verified Smart Search', () => {
  render(<Navigator initialRole="Host" />)
  expect(screen.getByRole('region', { name: 'Visual Home welcome' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Switch to Classic Home' })).toBeInTheDocument()
  expect(screen.getByRole('combobox', { name: 'Search support processes' })).toBeInTheDocument()
  expect(screen.getByRole('region', { name: 'One-click approved guides' })).toBeInTheDocument()
  expect(screen.getByRole('region', { name: 'Approved Ogletree Live Call Flow' })).not.toBeInTheDocument()
  expect(screen.getByRole('region', { name: 'Compact Approved Call Flow Tracker' })).toBeInTheDocument()
  expect(screen.queryByText('Help Ozzie grow and thrive.')).not.toBeInTheDocument()
})

it('keeps the exact source-backed answer and role-safe search behavior in Visual Home', () => {
  const source = hostTopics().find(topic => topic.id === 'host-audio')
  expect(source).toBeTruthy()
  render(<Navigator initialRole="Host" />)
  fireEvent.change(screen.getByRole('combobox', { name: 'Search support processes' }), {
    target: { value: 'microphone is unmuted but participants cannot hear arbitrator' },
  })
  const card = screen.getByRole('region', { name: 'Verified quick answer' })
  expect(within(card).getByText(source.steps[1].instruction)).toBeInTheDocument()
  expect(within(card).getByRole('button', { name: /Open guided troubleshooting/ })).toBeInTheDocument()
  expect(approvedQuickAnswer('microphone is unmuted but participants cannot hear arbitrator', { role: 'Host' }).answer).toBe(source.steps[1].instruction)
})

it('opens the actual Host guide directly from its tile, with no copied instructions', () => {
  render(<Navigator initialRole="Host" />)
  const tile = screen.getByRole('button', { name: 'Open approved Microphone guide' })
  fireEvent.click(tile)
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getByRole('region', { name: 'Compact Approved Call Flow Tracker' })).toBeInTheDocument()
})

it('opens the approved Participant guide after changing caller role', () => {
  render(<Navigator initialRole="Host" />)
  fireEvent.click(screen.getByRole('button', { name: 'Participant' }))
  const guide = routeById('cant-be-heard')
  expect(guide).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Open approved Microphone guide' }))
  expect(screen.getByRole('dialog', { name: guide.title })).toBeInTheDocument()
})

it('restores Classic Home instantly, saves choice and preserves query and caller role', () => {
  render(<Navigator initialRole="Participant" />)
  const search = screen.getByRole('combobox', { name: 'Search support processes' })
  fireEvent.change(search, { target: { value: 'wrong camera preview' } })
  const answerBefore = screen.getByRole('region', { name: 'Verified quick answer' }).textContent
  fireEvent.click(screen.getByRole('button', { name: 'Switch to Classic Home' }))
  expect(window.localStorage.getItem('ozzie.visualHome.mode.v1')).toBe('classic')
  expect(screen.getByRole('heading', { name: 'Help Ozzie grow and thrive.' })).toBeInTheDocument()
  expect(screen.getByRole('region', { name: 'Dashboard quick access' })).toBeInTheDocument()
  expect(search).toHaveValue('wrong camera preview')
  expect(screen.getByRole('button', { name: 'Participant' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('region', { name: 'Verified quick answer' }).textContent).toBe(answerBefore)
  cleanup()
  render(<Navigator initialRole="Participant" />)
  expect(screen.getByRole('button', { name: 'Enable Visual Home' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Enable Visual Home' }))
  expect(window.localStorage.getItem('ozzie.visualHome.mode.v1')).toBe('visual')
  expect(screen.getByRole('region', { name: 'One-click approved guides' })).toBeInTheDocument()
})

it('opens the full reviewed Process Guide library without hiding the underlying reference tabs', () => {
  render(<Navigator initialRole="Participant" />)
  expect(screen.getByRole('region', { name: 'Navigator library' })).not.toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: 'Browse all approved Process Guides' }))
  expect(screen.getByRole('region', { name: 'Navigator library' })).toBeVisible()
  expect(screen.getByRole('tab', { name: 'Process Guides' })).toHaveAttribute('aria-selected','true')
  expect(screen.getByRole('tab', { name: 'FAQ' })).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: 'Roadblock Matrix' })).toBeInTheDocument()
})

it('leaves standalone Classic DashboardWelcome untouched for full source and training access', () => {
  render(<DashboardWelcome />)
  expect(screen.getByRole('heading', { name: 'Help Ozzie grow and thrive.' })).toBeInTheDocument()
  expect(screen.getByRole('region', { name: 'Dashboard quick access' })).toBeInTheDocument()
})
