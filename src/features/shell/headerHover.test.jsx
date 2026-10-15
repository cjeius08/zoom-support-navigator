import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AppShell } from './AppShell'

const profile = { username: 'agent', initials: 'AG', role: 'agent', workspace_role: 'member' }

describe('Batch 5 correction — hover to open desktop navigation', () => {
  it('opens a dropdown after a short mouse hover and closes after a short leave grace period', () => {
    render(<AppShell profile={profile} />)
    const menu = screen.getByText('Knowledge').closest('details')
    expect(menu.open).toBe(false)
    vi.useFakeTimers()
    try {
      fireEvent.pointerEnter(menu, { pointerType: 'mouse' })
      expect(menu.open).toBe(false)
      act(() => vi.advanceTimersByTime(115))
      expect(menu.open).toBe(true)

      fireEvent.pointerLeave(menu, { pointerType: 'mouse' })
      act(() => vi.advanceTimersByTime(100))
      expect(menu.open).toBe(true)
      fireEvent.pointerEnter(menu, { pointerType: 'mouse' })
      act(() => vi.advanceTimersByTime(230))
      expect(menu.open).toBe(true)

      fireEvent.pointerLeave(menu, { pointerType: 'mouse' })
      act(() => vi.advanceTimersByTime(225))
      expect(menu.open).toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })

  it('switches between hovered menus and leaves only the last menu open', () => {
    render(<AppShell profile={profile} />)
    const knowledge = screen.getByText('Knowledge').closest('details')
    const reports = screen.getByText('Reports').closest('details')
    vi.useFakeTimers()
    try {
      fireEvent.pointerEnter(knowledge, { pointerType: 'mouse' })
      act(() => vi.advanceTimersByTime(115))
      expect(knowledge.open).toBe(true)
      fireEvent.pointerLeave(knowledge, { pointerType: 'mouse' })
      fireEvent.pointerEnter(reports, { pointerType: 'mouse' })
      act(() => vi.advanceTimersByTime(115))
      expect(reports.open).toBe(true)
      expect(knowledge.open).toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })

  it('retains the normal click and keyboard Escape behavior', async () => {
    const user = userEvent.setup()
    render(<AppShell profile={profile} />)
    const summary = screen.getByText('Knowledge')
    const dropdown = summary.closest('details')
    await user.click(summary)
    expect(dropdown.open).toBe(true)
    await user.keyboard('{Escape}')
    expect(dropdown.open).toBe(false)
  })

  it('does not auto-open from a touch pointer', () => {
    render(<AppShell profile={profile} />)
    const dropdown = screen.getByText('Knowledge').closest('details')
    vi.useFakeTimers()
    try {
      fireEvent.pointerEnter(dropdown, { pointerType: 'touch' })
      act(() => vi.advanceTimersByTime(200))
      expect(dropdown.open).toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })
})
