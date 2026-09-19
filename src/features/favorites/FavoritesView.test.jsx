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

  expect(screen.getByRole('heading', { name: 'Favorites' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Common Issues' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Process Guides' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /I can’t hear anyone/i }))
  expect(onOpenCommonIssue).toHaveBeenCalledWith('cant-hear')

  await user.click(screen.getByRole('button', { name: /Zoom Audio Troubleshooting/i }))
  expect(onOpenProcess).toHaveBeenCalledWith('zoom-audio-troubleshooting')

  await user.click(screen.getAllByRole('button', { name: 'Remove from Favorites' })[0])
  expect(onToggleFavorite).toHaveBeenCalledWith('common_issue', 'cant-hear')
})

it('shows a useful empty state when the user has no saved items', () => {
  render(<FavoritesView favorites={[]} />)
  expect(screen.getByRole('heading', { name: 'No Favorites yet' })).toBeInTheDocument()
  expect(screen.getByText(/Open a Common Issue or Process Guide/i)).toBeInTheDocument()
})
