import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { Navigator } from './Navigator'

it('renders the Alaga full-layout preset while keeping navigator actions usable', async () => {
  const user = userEvent.setup()
  const onReportContextChange = vi.fn()
  render(<Navigator theme="alaga" onReportContextChange={onReportContextChange} />)

  expect(screen.getByRole('heading', { name: /Support people\. Solve faster/i })).toBeInTheDocument()
  expect(screen.getByText('That’s Ozzie.')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Common Issues' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Fastest Routes' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Process Guides' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Live Call Flow' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: '7-stage support workflow' })).toBeInTheDocument()

  const commonCard = screen.getByRole('heading', { name: 'Common Issues' }).closest('article')
  await user.click(within(commonCard).getByRole('button', { name: /View all/i }))
  expect(screen.getByRole('button', { name: /Back to overview/i })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /Back to overview/i }))
  const search = screen.getByRole('combobox', { name: 'Search support processes' })
  await user.type(search, 'cant share')
  expect(screen.getByRole('heading', { name: /Results for/i })).toBeInTheDocument()
})

it('keeps the original Navigator layout as the default preset', () => {
  render(<Navigator onReportContextChange={() => {}} />)
  expect(screen.getByRole('heading', { name: 'Find the next step' })).toBeInTheDocument()
  expect(screen.queryByText('That’s Ozzie.')).not.toBeInTheDocument()
})
