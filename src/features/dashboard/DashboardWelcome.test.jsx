import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { DashboardWelcome } from './DashboardWelcome'

it('shows Batch 11 and Batch 10 in the latest release cards and opens full updates on request', () => {
  const onOpenUpdates = vi.fn()
  render(<DashboardWelcome isAdmin={false} onOpenUpdates={onOpenUpdates} />)

  expect(screen.getByRole('heading', { name: /Batch 11 — Find Updates Faster/ })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: /Batch 10 — Meet the New Ozzie Command Center/ })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: /Read full release notes for Batch 10/ }))
  expect(onOpenUpdates).toHaveBeenCalledTimes(1)
})
