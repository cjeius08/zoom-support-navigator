import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { UpdatesView } from './UpdatesView'

it('hides admin-only release notes from members and leads', () => {
  render(<UpdatesView isAdmin={false} />)
  expect(screen.getByRole('heading', { name: 'Ozzie now welcomes users immediately after first sign-in' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Team Management adds Member and Lead assignment' })).not.toBeInTheDocument()
})

it('shows admin-only release notes to administrators', () => {
  render(<UpdatesView isAdmin />)
  expect(screen.getByRole('heading', { name: 'Team Management adds Member and Lead assignment' })).toBeInTheDocument()
  expect(screen.getAllByText('Admin only').length).toBeGreaterThan(0)
  expect(screen.getByText('Workspace Lead')).toBeInTheDocument()
})
