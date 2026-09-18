import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { TRAINING_ROADMAP_MODULES, TrainingRoadmap } from './TrainingRoadmap'

it('locks the Phase 6 Batch 1 roadmap to six ordered learning modules', () => {
  expect(TRAINING_ROADMAP_MODULES).toHaveLength(6)
  expect(TRAINING_ROADMAP_MODULES.map(module => module.id)).toEqual([
    'call-method',
    'device-orientation',
    'communication-boundaries',
    'scenario-routing',
    'guided-lessons',
    'practice-lab',
  ])
  expect(TRAINING_ROADMAP_MODULES.filter(module => module.status === 'available')).toHaveLength(4)
  expect(TRAINING_ROADMAP_MODULES.filter(module => module.status === 'coming')).toHaveLength(2)
})

it('shows a progressive visual path without pretending unfinished modules are available', () => {
  render(<TrainingRoadmap />)

  expect(screen.getByRole('heading', { name: /Follow one learning path/i })).toBeInTheDocument()

  const list = screen.getByRole('list')
  const modules = within(list).getAllByRole('listitem')
  expect(modules).toHaveLength(6)

  expect(screen.getByRole('button', { name: 'Open call method' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Open device walkthroughs' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Open wording guardrails' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Open scenario scripts' })).toBeInTheDocument()

  expect(screen.getByText('Coming in Batch 2')).toBeInTheDocument()
  expect(screen.getByText('Coming in Batch 3')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /guided visual lessons/i })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /practice lab/i })).not.toBeInTheDocument()
})

it('routes existing roadmap modules to the exact current training resource', async () => {
  const user = userEvent.setup()
  const onOpenResource = vi.fn()
  render(<TrainingRoadmap onOpenResource={onOpenResource} />)

  await user.click(screen.getByRole('button', { name: 'Open call method' }))
  expect(onOpenResource).toHaveBeenLastCalledWith({
    section: 'scripts',
    mode: 'language',
    subsection: 'guide',
  })

  await user.click(screen.getByRole('button', { name: 'Open scenario scripts' }))
  expect(onOpenResource).toHaveBeenLastCalledWith({
    section: 'scripts',
    mode: 'scenarios',
  })

  await user.click(screen.getByRole('button', { name: 'Open Video Library' }))
  expect(onOpenResource).toHaveBeenLastCalledWith({ section: 'videos' })
})
