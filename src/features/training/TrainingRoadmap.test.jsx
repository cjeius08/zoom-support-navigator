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
    'readiness-lab',
  ])
  expect(TRAINING_ROADMAP_MODULES.filter(module => module.status === 'available')).toHaveLength(5)
  expect(TRAINING_ROADMAP_MODULES.filter(module => module.status === 'partial')).toHaveLength(1)
})

it('shows a progressive visual path without pretending unfinished modules are available', () => {
  render(<TrainingRoadmap />)

  expect(screen.getByRole('heading', { name: /Follow one learning path/i })).toBeInTheDocument()

  const list = screen.getByRole('list')
  const modules = within(list).getAllByRole('listitem')
  expect(modules).toHaveLength(6)

  expect(screen.getByRole('button', { name: 'Open call flow language' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Open device walkthroughs' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Open wording guardrails' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Open scenario scripts' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Open guided lessons' })).toBeInTheDocument()

  expect(screen.queryByText('Coming in Batch 2')).not.toBeInTheDocument()
  expect(screen.getByText('Parts 1–4 available')).toBeInTheDocument()
  expect(screen.getByText('Open Readiness Lab from the sidebar')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /readiness lab/i })).not.toBeInTheDocument()
})

it('routes existing roadmap modules to the exact current training resource', async () => {
  const user = userEvent.setup()
  const onOpenResource = vi.fn()
  render(<TrainingRoadmap onOpenResource={onOpenResource} />)

  await user.click(screen.getByRole('button', { name: 'Open call flow language' }))
  expect(onOpenResource).toHaveBeenLastCalledWith({
    section: 'scripts',
    mode: 'language',
    subsection: 'opening',
  })

  await user.click(screen.getByRole('button', { name: 'Open scenario scripts' }))
  expect(onOpenResource).toHaveBeenLastCalledWith({
    section: 'scripts',
    mode: 'scenarios',
  })

  await user.click(screen.getByRole('button', { name: 'Open guided lessons' }))
  expect(onOpenResource).toHaveBeenLastCalledWith({ section: 'lessons' })

  await user.click(screen.getByRole('button', { name: 'Open Video Library' }))
  expect(onOpenResource).toHaveBeenLastCalledWith({ section: 'videos' })
})
