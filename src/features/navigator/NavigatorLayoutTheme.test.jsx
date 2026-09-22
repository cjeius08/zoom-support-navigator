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
  expect(screen.getAllByRole('heading', { name: 'Live Call Flow' }).length).toBeGreaterThan(0)
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


it('renders the Ozzie Teal enterprise layout and keeps summary navigation usable', async () => {
  const user = userEvent.setup()
  render(<Navigator theme="teal" onReportContextChange={() => {}} />)

  expect(screen.getByRole('heading', { name: /Welcome to Ozzie/i })).toBeInTheDocument()
  expect(screen.getByText('Support people. Solve faster.')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'The 7-Stage Support Workflow' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Common Issues' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Fastest Routes' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Process Guides' })).toBeInTheDocument()

  const commonCard = screen.getByRole('heading', { name: 'Common Issues' }).closest('article')
  await user.click(within(commonCard).getByRole('button', { name: /View all/i }))
  expect(screen.getByText('Support library')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Back to overview/i })).toBeInTheDocument()
})
