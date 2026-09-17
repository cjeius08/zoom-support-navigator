import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { Navigator } from './Navigator'

it('restores common routes, metadata, and the four-tab process drawer', async () => {
  const user = userEvent.setup()
  render(<Navigator />)
  expect(screen.getByRole('heading', { name: 'Locate → Describe → Guide → Confirm' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Common Issues' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Customer cannot join/i }))
  const dialog = screen.getByRole('dialog')
  expect(within(dialog).getByRole('tab', { name: 'Quick View' })).toHaveAttribute('aria-selected', 'true')
  expect(within(dialog).getByRole('button', { name: 'Copy Quick Steps' })).toBeInTheDocument()
  await user.click(within(dialog).getByRole('tab', { name: 'Visual Guide' }))
  expect(within(dialog).getByText(/No visual reference available|Visual 1/i)).toBeInTheDocument()
  await user.click(within(dialog).getByRole('tab', { name: 'Source Pages' }))
  expect(within(dialog).getByText(/Page 1 of/i)).toBeInTheDocument()
  await user.click(within(dialog).getByRole('tab', { name: 'Full Process' }))
  expect(within(dialog).getByRole('region', { name: 'Full Process' })).toBeInTheDocument()
  await user.click(within(dialog).getByRole('button', { name: 'Close process' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

it('shows source-page and Zoom-visual counts on process cards', async () => {
  const user = userEvent.setup(); render(<Navigator />)
  await user.click(screen.getByRole('button', { name: /Audio & Microphone/i }))
  expect(screen.getAllByText(/source pages?/i).length).toBeGreaterThan(0)
  expect(screen.getAllByText(/Zoom visuals?/i).length).toBeGreaterThan(0)
})
