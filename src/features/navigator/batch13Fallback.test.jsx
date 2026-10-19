import { afterEach, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Navigator } from './Navigator'
import { OGLETREE_CALL_FLOW_STEPS } from '../../data/ogletreeCallFlow'

afterEach(() => {
  cleanup()
  try { window.localStorage.removeItem('ozzie.answerFirst.mode.v1') } catch { /* storage disabled */ }
})

it('offers instant, persistent Classic Search fallback without losing the current query', () => {
  render(<Navigator initialRole="Participant" />)
  const search = screen.getByRole('combobox', { name: 'Search support processes' })
  const query = 'My microphone is not muted but no one can hear me'
  fireEvent.change(search, { target: { value: query } })
  expect(screen.getByRole('region', { name: 'Verified quick answer' })).toBeInTheDocument()
  expect(screen.getByRole('region', { name: 'Compact Approved Call Flow Tracker' })).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Switch to Classic Search' }))
  expect(screen.queryByRole('region', { name: 'Verified quick answer' })).not.toBeInTheDocument()
  expect(screen.queryByRole('region', { name: 'Compact Approved Call Flow Tracker' })).not.toBeInTheDocument()
  expect(search).toHaveValue(query)
  expect(screen.getByRole('heading', { name: /Results for/ })).toBeInTheDocument()
  expect(window.localStorage.getItem('ozzie.answerFirst.mode.v1')).toBe('classic')

  cleanup()
  render(<Navigator initialRole="Participant" />)
  expect(screen.getByRole('button', { name: 'Enable Answer-First Search' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Enable Answer-First Search' }))
  expect(screen.getByRole('button', { name: 'Switch to Classic Search' })).toBeInTheDocument()
})

it('uses exact approved call-flow stages and carries state into and out of a Common Issue drawer', () => {
  render(<Navigator initialRole="Participant" />)
  const tracker = screen.getByRole('region', { name: 'Compact Approved Call Flow Tracker' })
  expect(within(tracker).getByText(OGLETREE_CALL_FLOW_STEPS[0].name)).toBeInTheDocument()
  fireEvent.click(within(tracker).getByRole('button', { name: 'Next Call Stage' }))
  expect(within(tracker).getByText(OGLETREE_CALL_FLOW_STEPS[1].name)).toBeInTheDocument()
  fireEvent.click(screen.getByRole('tab', { name: 'Common Issues' }))
  fireEvent.click(screen.getByRole('button', { name: /They can’t hear me/i }))
  const drawer = screen.getByRole('dialog', { name: /They can’t hear me/i })
  const inside = within(drawer).getByRole('region', { name: 'Compact Approved Call Flow Tracker' })
  expect(within(inside).getByText(OGLETREE_CALL_FLOW_STEPS[1].name)).toBeInTheDocument()
  fireEvent.click(within(inside).getByRole('button', { name: 'Next Call Stage in guide' }))
  expect(within(inside).getByText(OGLETREE_CALL_FLOW_STEPS[2].name)).toBeInTheDocument()
  fireEvent.click(within(drawer).getByRole('button', { name: 'Close common issue route' }))
  expect(within(screen.getByRole('region', { name: 'Compact Approved Call Flow Tracker' })).getByText(OGLETREE_CALL_FLOW_STEPS[2].name)).toBeInTheDocument()
})

it('shows the compact tracker inside approved Host guide without changing support instructions', () => {
  render(<Navigator initialRole="Host" />)
  const input = screen.getByRole('combobox', { name: 'Search support processes' })
  fireEvent.change(input, { target: { value: 'Why are my host controls missing?' } })
  fireEvent.click(within(screen.getByRole('region', { name: 'Verified quick answer' })).getByRole('button', { name: /Open guided troubleshooting/ }))
  const dialog = screen.getByRole('dialog')
  const tracker = within(dialog).getByRole('region', { name: 'Compact Approved Call Flow Tracker' })
  expect(within(tracker).getByText(OGLETREE_CALL_FLOW_STEPS[0].name)).toBeInTheDocument()
  fireEvent.click(within(tracker).getByRole('button', { name: 'View script' }))
  expect(within(tracker).getByText(new RegExp(OGLETREE_CALL_FLOW_STEPS[0].action.slice(0,25)))).toBeInTheDocument()
})

it('resets the shared call stage only when a new call is confirmed', () => {
  render(<Navigator initialRole="Participant" />)
  let tracker = screen.getByRole('region', { name: 'Compact Approved Call Flow Tracker' })
  fireEvent.click(within(tracker).getByRole('button', { name: 'Next Call Stage' }))
  fireEvent.click(screen.getByRole('tab', { name: 'Common Issues' }))
  fireEvent.click(screen.getByRole('button', { name: /They can’t hear me/i }))
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Close common issue route' }))
  fireEvent.click(screen.getByRole('button', { name: 'New Call' }))
  fireEvent.click(within(screen.getByRole('dialog', { name: 'Start a new call?' })).getByRole('button', { name: 'Start New Call' }))
  tracker = screen.getByRole('region', { name: 'Compact Approved Call Flow Tracker' })
  expect(within(tracker).getByText(OGLETREE_CALL_FLOW_STEPS[0].name)).toBeInTheDocument()
})
