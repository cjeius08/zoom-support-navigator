import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { UpdatesView } from './UpdatesView'

it('shows user-facing changes while hiding admin-only release notes from members and leads', () => {
  render(<UpdatesView isAdmin={false} />)
  expect(screen.getByRole('heading', { name: 'New Call now starts a clean support session' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Common Issues now helps you find the right approved guide' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Process Guides now give device-specific troubleshooting one step at a time' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Ozzie now welcomes users immediately after first sign-in' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Team Management adds Member and Lead assignment' })).not.toBeInTheDocument()
})

it('shows admin-only release notes to administrators', () => {
  render(<UpdatesView isAdmin />)
  expect(screen.getByRole('heading', { name: 'Team Management adds Member and Lead assignment' })).toBeInTheDocument()
  expect(screen.getAllByText('Admin only').length).toBeGreaterThan(0)
  expect(screen.getByText('Workspace Lead')).toBeInTheDocument()
})


it('labels historical updates without showing obsolete verification steps', () => {
  render(<UpdatesView isAdmin />)
  expect(screen.getAllByText('Historical').length).toBeGreaterThan(0)
  const historicalHeading = screen.getByRole('heading', { name: 'Original Core Live Call Flow' })
  const card = historicalHeading.closest('article')
  expect(card).toHaveTextContent('Historical')
  expect(card).not.toHaveTextContent('Verification')
})
