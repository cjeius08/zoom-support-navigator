import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { DashboardWelcome } from './DashboardWelcome'

it('shows the five newest member announcements and opens their full release notes', () => {
  const onOpenUpdates = vi.fn()
  render(<DashboardWelcome isAdmin={false} onOpenUpdates={onOpenUpdates} />)

  expect(screen.getByRole('heading', { name: 'Easier Knowledge Navigation — Three Support Areas and Expanded Flex Hub' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Floating Call Documentation and Clearer Saved-Note Owners' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Recording Questions — More Relevant First Answers' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'More Accurate Host Search and Mobile Call Support' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Smooth Navigation — Quick Page and Tool Transitions' })).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: /Read full release notes for Easier Knowledge Navigation/ }))
  expect(onOpenUpdates).toHaveBeenCalledTimes(1)
})
