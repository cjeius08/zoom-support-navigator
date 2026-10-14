import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { LiveVisitors } from './LiveVisitors'

it('shows the compact count without requiring a dashboard and reveals names only on click', async () => {
  const user = userEvent.setup()
  const load = vi.fn().mockResolvedValue({
    activeCount: 2,
    active: [{id:'1',initials:'JR',username:'Jon',role:'Agent',page:'Home',lastLoginAt:'2026-10-15T03:00:00Z'}, {id:'2',initials:'MC',username:'Lead',role:'Lead',page:'Knowledge'}],
    idle: [{id:'3',initials:'AA',username:'Admin',role:'Admin',page:'Reports'}],
  })
  render(<LiveVisitors loadVisitors={load} />)
  const counter = await screen.findByRole('button',{name:/Live visitors: 2/})
  expect(screen.queryByRole('region',{name:'Currently online team members'})).not.toBeInTheDocument()
  await user.click(counter)
  const popover=screen.getByRole('region',{name:'Currently online team members'})
  expect(within(popover).getByText('Jon')).toBeInTheDocument()
  expect(within(popover).getByText(/Last login:/)).toBeInTheDocument()
  expect(within(popover).getByText(/Oct 15, 2026/)).toBeInTheDocument()
  expect(within(popover).getByText('Lead')).toBeInTheDocument()
  expect(within(popover).getByText('Admin')).toBeInTheDocument()
  expect(within(popover).getByText(/Idle \(not counted as active\)/)).toBeInTheDocument()
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('region',{name:'Currently online team members'})).not.toBeInTheDocument()
})

it('does not misrepresent failed presence data as zero visitors', async () => {
  const load = vi.fn().mockRejectedValue(new Error('connection'))
  render(<LiveVisitors loadVisitors={load}/>)
  const counter = await screen.findByRole('button',{name:/Live visitors: —/})
  expect(counter).toBeInTheDocument()
})

it('renders no live visitor counter for ordinary agent Home', async () => {
  const { Navigator } = await import('./Navigator')
  render(<Navigator isAdmin={false} />)
  expect(screen.queryByRole('button',{name:/Live visitors:/})).not.toBeInTheDocument()
})
