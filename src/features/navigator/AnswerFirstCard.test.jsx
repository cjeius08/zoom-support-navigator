import { fireEvent, render, screen, within } from '@testing-library/react'
import { expect, it } from 'vitest'
import { Navigator } from './Navigator'
import { AnswerFirstCard } from './AnswerFirstCard'
import { approvedQuickAnswer } from './answerFirst'

it('puts a sourced answer before the guide results and opens approved Participant troubleshooting', () => {
  render(<Navigator initialRole="Participant" />)
  fireEvent.change(screen.getByRole('combobox', { name: 'Search support processes' }), {
    target: { value: 'My microphone is not muted but no one can hear me' },
  })
  const card = screen.getByRole('region', { name: 'Verified quick answer' })
  expect(within(card).getByText('Approved next check')).toBeInTheDocument()
  expect(within(card).getByText(/select the intended microphone and test it/i)).toBeInTheDocument()
  expect(within(card).getByText(/Approved Common Issue/)).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: /Results for/ })).toBeInTheDocument()
  fireEvent.click(within(card).getByRole('button', { name: /Open guided troubleshooting/ }))
  expect(screen.getByRole('dialog', { name: /They can’t hear me/i })).toBeInTheDocument()
}, 20000)

it('opens an approved Host route for missing controls, without exposing Participant-only guides', () => {
  render(<Navigator initialRole="Host" />)
  fireEvent.change(screen.getByRole('combobox', { name: 'Search support processes' }), {
    target: { value: 'Why are my host controls missing?' },
  })
  const card = screen.getByRole('region', { name: 'Verified quick answer' })
  expect(within(card).getByText(/host controls are available only after/i)).toBeInTheDocument()
  fireEvent.click(within(card).getByRole('button', { name: /Open guided troubleshooting/ }))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
}, 20000)

it('never fabricates quick answers for unmatched search language', () => {
  render(<Navigator initialRole="Host" />)
  fireEvent.change(screen.getByRole('combobox', { name: 'Search support processes' }), {
    target: { value: 'arbitration billing account changes' },
  })
  expect(screen.queryByRole('region', { name: 'Verified quick answer' })).not.toBeInTheDocument()
  expect(screen.getByText(/No verified quick answer for this wording yet/)).toBeInTheDocument()
})

it('labels account switching as a coverage gap with no misleading troubleshooting CTA', () => {
  const answer = approvedQuickAnswer('Unable to log out personal Zoom and switch account', { role: 'Host' })
  expect(answer.status).toBe('coverage_gap')
  const { container } = render(<AnswerFirstCard answer={answer} onOpenGuide={() => {}} />)
  const card = screen.getByRole('region', { name: 'Coverage gap — no verified answer' })
  expect(within(card).getByText('No approved procedure available')).toBeInTheDocument()
  expect(within(card).getByText(/Coverage gap — confirmation needed/)).toBeInTheDocument()
  expect(within(card).queryByText('Approved next check')).not.toBeInTheDocument()
  expect(within(card).queryByRole('button', { name: /Open guided troubleshooting/ })).not.toBeInTheDocument()
  expect(container.querySelector('.answer-first-check')).toBeNull()
})

import { buildSearchSuggestions, isRecordingPolicySearch, isRecordingSourceRelevant } from './searchSuggestions'

it.each(['turn off recording', 'stop recording', 'disable automatic recording'])('shows the approved Recording answer first and hides incidental transfer guides: %s', query => {
  const answer = approvedQuickAnswer(query, { role: 'Host' })
  expect(answer?.id).toBe('host-recording-policy')
  expect(isRecordingPolicySearch(query)).toBe(true)
  const irrelevant = { id: 'transferring-meetings-and-webinars-between-devices', title: 'Transferring Meetings and Webinars Between Devices', purpose: 'Transfer a meeting to another device', text: 'Local recording does not transfer' }
  expect(isRecordingSourceRelevant(irrelevant)).toBe(false)
  const results = buildSearchSuggestions({
    query, isHost: true, quickAnswer: answer, hubMatch: false,
    hostTopicMatches: [], hostRoadblockMatches: [], processMatches: [irrelevant],
  })
  expect(results).toHaveLength(1)
  expect(results[0].kind).toBe('approved_answer')
  expect(results[0].answer.sourceLabel).toMatch(/approved FAQ/i)
})

it('shows the approved recording answer as the first clickable dropdown option', () => {
  render(<Navigator initialRole="Host" />)
  fireEvent.change(screen.getByRole('combobox', { name: 'Search support processes' }), {
    target: { value: 'turn off recording' },
  })
  const options = within(screen.getByRole('listbox', { name: 'Search suggestions' })).getAllByRole('option')
  expect(options[0]).toHaveTextContent('Recording')
  expect(options[0]).toHaveTextContent('Approved Answer')
  expect(options[0]).toHaveTextContent('cannot be turned off')
  expect(options.some(option => /Transferring Meetings and Webinars/i.test(option.textContent))).toBe(false)
  fireEvent.click(options[0])
  expect(screen.getByRole('tab', { name: 'FAQ' })).toHaveAttribute('aria-selected', 'true')
})

it('does not reveal the Host recording policy as an approved Participant suggestion', () => {
  render(<Navigator initialRole="Participant" />)
  fireEvent.change(screen.getByRole('combobox', { name: 'Search support processes' }), {
    target: { value: 'turn off recording' },
  })
  const listbox = screen.queryByRole('listbox', { name: 'Search suggestions' })
  if (listbox) expect(within(listbox).queryByText('Approved Answer')).not.toBeInTheDocument()
  expect(screen.queryByRole('region', { name: 'Verified quick answer' })).not.toBeInTheDocument()
})

it('preserves break-specific caution and refuses to present a coverage gap as verified', () => {
  const breakAnswer = approvedQuickAnswer('recording during breaks', { role: 'Host' })
  expect(breakAnswer?.id).toBe('recording-break-boundary')
  const suggestions = buildSearchSuggestions({ query: 'recording during breaks', isHost: true, quickAnswer: breakAnswer, hubMatch: false })
  expect(suggestions[0]?.answer.confirmation).toMatch(/program-owner confirmation/i)
  const gap = approvedQuickAnswer('Unable to log out personal Zoom and switch account', { role: 'Host' })
  expect(buildSearchSuggestions({ query: 'switch account', isHost: true, quickAnswer: gap, hubMatch: false })).toHaveLength(0)
})
