import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { AppShell } from './AppShell'

it('shows role-aware navigation and account controls', () => {
  render(<AppShell profile={{ username: 'ja_admin', initials: 'JA', role: 'creator_admin', avatar_id: 'avatar_001' }} />)
  expect(screen.getByRole('navigation')).toHaveTextContent('Team Management')
  expect(screen.getByRole('navigation')).toHaveTextContent('Usage Analytics')
  expect(screen.getByRole('navigation')).toHaveTextContent('Training & Resources')
  expect(screen.getByRole('button', { name: /ja_admin/i })).toBeInTheDocument()
  expect(screen.getAllByTestId('nav-icon').length).toBeGreaterThan(3)
})

it('does not render admin navigation for agents', () => {
  render(<AppShell profile={{ username: 'agent_1', initials: 'AG', role: 'agent' }} />)
  expect(screen.queryByText('Team Management')).not.toBeInTheDocument()
  expect(screen.getByRole('navigation')).toHaveTextContent('Training & Resources')
})
