import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { ReadinessLab } from './ReadinessLab'
import { FOUNDATION_QUESTIONS, READINESS_PARTS } from './readinessLabData'

it('shows the five-part readiness path while keeping only Part 1 interactive in Batch 3A', () => {
  render(<ReadinessLab open />)

  expect(READINESS_PARTS).toHaveLength(5)
  expect(screen.getByRole('heading', { name: 'Readiness Lab' })).toBeInTheDocument()
  expect(screen.getByText(/Open-book by design/i)).toBeInTheDocument()

  const tabs = screen.getAllByRole('tab')
  expect(tabs).toHaveLength(5)
  expect(screen.getByRole('tab', { name: /Call Flow Available now/i })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tab', { name: /Devices Coming next/i })).toBeDisabled()
  expect(screen.getByRole('tab', { name: /Troubleshooting Coming next/i })).toBeDisabled()
  expect(screen.getByRole('tab', { name: /Scope Coming next/i })).toBeDisabled()
  expect(screen.getByRole('tab', { name: /Live Call Coming next/i })).toBeDisabled()
})

it('scores the first checked answer and preserves it when moving between questions', async () => {
  const user = userEvent.setup()
  render(<ReadinessLab open />)

  expect(screen.getByText('Question 1 of 4')).toBeInTheDocument()
  const correct = screen.getByRole('radio', { name: /Let the caller explain the concern/i })
  await user.click(correct)
  await user.click(screen.getByRole('button', { name: 'Check answer' }))

  expect(screen.getByText('Correct')).toBeInTheDocument()
  expect(screen.getByText(/Good judgment/i)).toBeInTheDocument()
  expect(correct).toBeDisabled()
  expect(screen.getByText('1/4 checked')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Next' }))
  expect(screen.getByText('Question 2 of 4')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Previous' }))

  expect(correct).toHaveAttribute('aria-checked', 'true')
  expect(screen.getByText('Correct')).toBeInTheDocument()
})

it('keeps Find in Workspace separate from answering and opens the exact source location', async () => {
  const user = userEvent.setup()
  const onOpenResource = vi.fn()
  render(<ReadinessLab open onOpenResource={onOpenResource} />)

  await user.click(screen.getByRole('button', { name: 'Find in Workspace' }))

  expect(onOpenResource).toHaveBeenCalledWith({
    view: 'training',
    section: 'scripts',
    mode: 'language',
    subsection: 'listen',
  })
  expect(screen.getByText('Question 1 of 4')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Check answer' })).toBeDisabled()
})

it('shows a Part 1 result after all four first attempts are checked', async () => {
  const user = userEvent.setup()
  render(<ReadinessLab open />)

  for (let index = 0; index < FOUNDATION_QUESTIONS.length; index += 1) {
    const question = FOUNDATION_QUESTIONS[index]
    const correctOption = question.options.find(option => option.id === question.correctOptionId)
    await user.click(screen.getByRole('radio', { name: new RegExp(correctOption.text.replace(/[.*+?^$()|[\]\\]/g, '\\$&'), 'i') }))
    await user.click(screen.getByRole('button', { name: 'Check answer' }))
    if (index < FOUNDATION_QUESTIONS.length - 1) {
      await user.click(screen.getByRole('button', { name: 'Next' }))
    }
  }

  const result = screen.getByText('Part 1 complete').closest('section')
  expect(within(result).getByRole('heading', { name: '4/4 first-attempt answers correct' })).toBeInTheDocument()
  expect(within(result).getByRole('button', { name: 'Restart Part 1' })).toBeInTheDocument()
})

it('renders a compact minimized state without losing completed progress', async () => {
  const user = userEvent.setup()
  const onMinimize = vi.fn()
  const { rerender } = render(<ReadinessLab open onMinimize={onMinimize} />)

  await user.click(screen.getByRole('radio', { name: /Let the caller explain the concern/i }))
  await user.click(screen.getByRole('button', { name: 'Check answer' }))
  await user.click(screen.getByRole('button', { name: 'Minimize Readiness Lab' }))
  expect(onMinimize).toHaveBeenCalled()

  rerender(<ReadinessLab open minimized onMinimize={onMinimize} />)
  expect(screen.getByLabelText('Readiness Lab minimized')).toHaveTextContent('Part 1 · 1/4 checked')
})
