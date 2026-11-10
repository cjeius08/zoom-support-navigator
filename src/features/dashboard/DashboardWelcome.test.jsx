import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { DashboardWelcome } from './DashboardWelcome'

it('shows the five newest member announcements and opens their full release notes', () => {
  const onOpenUpdates = vi.fn()
  render(<DashboardWelcome isAdmin={false} onOpenUpdates={onOpenUpdates} />)

  expect(screen.getByRole('heading', { name: 'Search Across Ozzie — Guides, Videos, Documents, Training and Updates' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Easier Knowledge Navigation — Three Support Areas and Expanded Flex Hub' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Floating Call Documentation and Clearer Saved-Note Owners' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Recording Questions — More Relevant First Answers' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'More Accurate Host Search and Mobile Call Support' })).toBeInTheDocument()

  expect(screen.queryByRole('heading', { name: 'Smooth Navigation — Quick Page and Tool Transitions' })).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: /Read full release notes for Search Across Ozzie/ }))
  expect(onOpenUpdates).toHaveBeenCalledTimes(1)
})
