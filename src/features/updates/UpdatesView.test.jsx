import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { UpdatesView } from './UpdatesView'

it('shows user-facing changes while hiding admin-only release notes from members and leads', () => {
  render(<UpdatesView isAdmin={false} />)
  expect(screen.getByRole('heading', { name: 'Smart Search relevance hardened for live-call safety' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Common Issues now include suggested scripts, and exhausted Process Guides show possible roadblocks' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Back navigation added across troubleshooting' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Ozzie is now Host / Arbitrator-first for live Zoom support' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Roadblocks now stop at the correct Tier 1 boundary and show the right next action' })).toBeInTheDocument()
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

it('shows the Batch 10 and Batch 11 announcements and filters release history without leaking Admin-only changes', () => {
  render(<UpdatesView isAdmin={false} />)
  const search = screen.getByRole('searchbox', { name: 'Find an update' })

  expect(screen.getByRole('heading', { name: /Batch 11 — Find Updates Faster/ })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: /Batch 10 — Meet the New Ozzie Command Center/ })).toBeInTheDocument()

  fireEvent.change(search, { target: { value: 'Command Center' } })
  expect(screen.getByRole('heading', { name: /Batch 10 — Meet the New Ozzie Command Center/ })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: /Batch 11 — Find Updates Faster/ })).not.toBeInTheDocument()

  fireEvent.change(search, { target: { value: 'Team Management adds Member and Lead assignment' } })
  expect(screen.queryByRole('heading', { name: 'Team Management adds Member and Lead assignment' })).not.toBeInTheDocument()
  expect(screen.getByText('No updates match your search.')).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))
  expect(search).toHaveValue('')
  expect(screen.getByRole('heading', { name: /Batch 11 — Find Updates Faster/ })).toBeInTheDocument()
})
