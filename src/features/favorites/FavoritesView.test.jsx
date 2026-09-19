import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { FavoritesView } from './FavoritesView'

it('groups saved Common Issues and Process Guides and opens the exact saved resource', async () => {
  const user = userEvent.setup()
  const onOpenCommonIssue = vi.fn()
  const onOpenProcess = vi.fn()
  const onToggleFavorite = vi.fn()

  render(<FavoritesView
    favorites={[
      { itemType: 'common_issue', itemId: 'cant-hear', createdAt: '2026-09-19T05:00:00Z' },
      { itemType: 'process', itemId: 'zoom-audio-troubleshooting', createdAt: '2026-09-19T04:00:00Z' },
    ]}
    onOpenCommonIssue={onOpenCommonIssue}
    onOpenProcess={onOpenProcess}
    onToggleFavorite={onToggleFavorite}
  />)

  expect(screen.getByRole('heading', { name: 'My Quick Access' })).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: /Favorites/i })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('heading', { name: 'Common Issues' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Process Guides' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /I can’t hear anyone/i }))
  expect(onOpenCommonIssue).toHaveBeenCalledWith('cant-hear')

  await user.click(screen.getByRole('button', { name: /Zoom Audio Troubleshooting/i }))
  expect(onOpenProcess).toHaveBeenCalledWith('zoom-audio-troubleshooting')

  await user.click(screen.getAllByRole('button', { name: 'Remove from Favorites' })[0])
  expect(onToggleFavorite).toHaveBeenCalledWith('common_issue', 'cant-hear')
})

it('shows a useful Favorites empty state when the user has no saved items', () => {
  render(<FavoritesView favorites={[]} />)
  expect(screen.getByRole('heading', { name: 'No Favorites yet' })).toBeInTheDocument()
  expect(screen.getByText(/Open a Common Issue or Process Guide/i)).toBeInTheDocument()
})

it('shows recently viewed resources newest first and clears only recent history', async () => {
  const user = userEvent.setup()
  const onOpenCommonIssue = vi.fn()
  const onOpenProcess = vi.fn()
  const onClearRecentlyViewed = vi.fn()

  render(<FavoritesView
    favorites={[]}
    recentlyViewed={[
      { itemType: 'common_issue', itemId: 'cant-hear', viewedAt: '2026-09-19T06:20:00Z' },
      { itemType: 'process', itemId: 'zoom-audio-troubleshooting', viewedAt: '2026-09-19T06:19:00Z' },
    ]}
    onOpenCommonIssue={onOpenCommonIssue}
    onOpenProcess={onOpenProcess}
    onClearRecentlyViewed={onClearRecentlyViewed}
  />)

  await user.click(screen.getByRole('tab', { name: /Recently Viewed/i }))
  expect(screen.getByRole('heading', { name: 'Recently Viewed' })).toBeInTheDocument()

  const recentCards = screen.getAllByRole('button', { name: /I can’t hear anyone|Zoom Audio Troubleshooting/i })
  expect(recentCards[0]).toHaveTextContent('I can’t hear anyone')
  expect(recentCards[1]).toHaveTextContent('Zoom Audio Troubleshooting')

  await user.click(recentCards[0])
  expect(onOpenCommonIssue).toHaveBeenCalledWith('cant-hear')

  await user.click(screen.getByRole('button', { name: 'Clear Recently Viewed' }))
  expect(onClearRecentlyViewed).toHaveBeenCalledTimes(1)
})
