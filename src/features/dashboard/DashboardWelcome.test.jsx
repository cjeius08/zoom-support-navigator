import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { DashboardWelcome } from './DashboardWelcome'

it('surfaces the latest session stability announcement and opens full release notes', () => {
  const onOpenUpdates = vi.fn()
  render(<DashboardWelcome isAdmin={false} onOpenUpdates={onOpenUpdates} />)

  expect(screen.getByRole('heading', { name: 'Session Stability — Fix for Unexpected Sign-Out' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Improved Sign-In Feedback & Safer Session Recovery' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: /Batch 11 — Find Updates Faster/ })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: /Read full release notes for Session Stability/ }))
  expect(onOpenUpdates).toHaveBeenCalledTimes(1)
})
