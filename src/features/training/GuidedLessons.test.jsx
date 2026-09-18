import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { GUIDED_LESSONS, GuidedLessons } from './GuidedLessons'

it('locks Phase 6 Batch 2 to five source-backed guided lessons', () => {
  expect(GUIDED_LESSONS).toHaveLength(5)
  expect(GUIDED_LESSONS.map(lesson => lesson.id)).toEqual([
    'one-step-method',
    'device-first',
    'audio-direction',
    'waiting-state',
    'support-boundary',
  ])

  for (const lesson of GUIDED_LESSONS) {
    expect(lesson.title).toBeTruthy()
    expect(lesson.summary).toBeTruthy()
    expect(lesson.remember).toBeTruthy()
    expect(lesson.sourceProcessIds.length).toBeGreaterThan(0)
    expect(lesson.takeaways).toHaveLength(3)
    expect(lesson.target).toBeTruthy()
  }
})

it('renders the visual call-method lesson first without adding a scored knowledge check', () => {
  render(<GuidedLessons />)

  expect(screen.getByRole('heading', { name: /Learn the pattern before practicing the call/i })).toBeInTheDocument()
  expect(screen.getByRole('tabpanel', { name: 'Guide one visible action at a time' })).toBeInTheDocument()

  const panel = screen.getByRole('tabpanel', { name: 'Guide one visible action at a time' })
  for (const stage of ['Locate', 'Describe', 'Guide', 'Confirm']) {
    expect(within(panel).getByText(stage, { selector: 'strong' })).toBeInTheDocument()
  }
  expect(within(panel).getByText(/If the caller cannot find the control/i)).toBeInTheDocument()
  expect(screen.getByText(/Practice questions are intentionally saved for Phase 6 Batch 3/i)).toBeInTheDocument()
})

it('switches to audio direction and keeps speaker versus microphone visually separate', async () => {
  const user = userEvent.setup()
  render(<GuidedLessons />)

  await user.click(screen.getByRole('tab', { name: /Separate speaker problems from microphone problems/i }))

  const panel = screen.getByRole('tabpanel', { name: 'Separate speaker problems from microphone problems' })
  expect(within(panel).getByText('OUTPUT')).toBeInTheDocument()
  expect(within(panel).getByText('INPUT')).toBeInTheDocument()
  expect(within(panel).getByRole('heading', { name: '“I can’t hear anyone”' })).toBeInTheDocument()
  expect(within(panel).getByRole('heading', { name: '“They can’t hear me”' })).toBeInTheDocument()
  expect(within(panel).getByText(/Hear = output\/speaker/i)).toBeInTheDocument()
  expect(within(panel).getByRole('img')).toHaveAttribute('src', expect.stringContaining('audio-settings.png'))
})

it('teaches Waiting for host and Waiting Room as different connected states', async () => {
  const user = userEvent.setup()
  render(<GuidedLessons />)

  await user.click(screen.getByRole('tab', { name: /waiting screen is not automatically a failed join/i }))

  const panel = screen.getByRole('tabpanel', { name: 'A waiting screen is not automatically a failed join' })
  expect(within(panel).getByText('HOST HAS NOT STARTED')).toBeInTheDocument()
  expect(within(panel).getByText('HOST CONTROLS ADMISSION')).toBeInTheDocument()
  expect(within(panel).getByText(/support agent cannot admit the participant/i)).toBeInTheDocument()
  expect(within(panel).getByText(/Do not start audio\/video\/reinstall troubleshooting/i)).toBeInTheDocument()
})

it('routes each lesson to its existing approved resource instead of duplicating the full workflow', async () => {
  const user = userEvent.setup()
  const onOpenResource = vi.fn()
  render(<GuidedLessons onOpenResource={onOpenResource} />)

  await user.click(screen.getByRole('button', { name: 'Open the full call method' }))
  expect(onOpenResource).toHaveBeenLastCalledWith({
    section: 'scripts',
    mode: 'language',
    subsection: 'guide',
  })

  await user.click(screen.getByRole('tab', { name: /Separate speaker problems from microphone problems/i }))
  await user.click(screen.getByRole('button', { name: 'Open the Can’t Hear scenario' }))
  expect(onOpenResource).toHaveBeenLastCalledWith({
    section: 'scripts',
    mode: 'scenarios',
    scenario: 'cant-hear',
  })

  await user.click(screen.getByRole('tab', { name: /waiting screen is not automatically a failed join/i }))
  await user.click(screen.getByRole('button', { name: 'Open Waiting to Get In scenario' }))
  expect(onOpenResource).toHaveBeenLastCalledWith({
    section: 'scripts',
    mode: 'scenarios',
    scenario: 'waiting-entry',
  })
})

it('publishes the active guided lesson as report context', async () => {
  const user = userEvent.setup()
  const onReportContextChange = vi.fn()
  render(<GuidedLessons onReportContextChange={onReportContextChange} />)

  expect(onReportContextChange).toHaveBeenLastCalledWith(expect.objectContaining({
    selected_tab: 'Guided Visual Lessons',
    current_section: 'Guide one visible action at a time',
  }))

  await user.click(screen.getByRole('tab', { name: /Know when basic support should stop/i }))
  expect(onReportContextChange).toHaveBeenLastCalledWith(expect.objectContaining({
    selected_tab: 'Guided Visual Lessons',
    current_section: 'Know when basic support should stop',
  }))
})
