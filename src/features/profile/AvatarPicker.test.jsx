import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { AvatarPicker } from './AvatarPicker'

it('shows an empty-state message while no avatars are available', () => {
  render(<AvatarPicker selectedId="avatar_037" onSave={() => {}} onCancel={() => {}} />)
  expect(screen.getByRole('heading', { name: /choose an avatar/i })).toBeInTheDocument()
  expect(screen.getByRole('status')).toHaveTextContent(/no avatars are currently available/i)
  expect(screen.queryByRole('radio')).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /save avatar/i })).not.toBeInTheDocument()
})

it('still lets the user close the empty avatar picker', async () => {
  const user = userEvent.setup()
  const onCancel = vi.fn()
  render(<AvatarPicker selectedId={null} onSave={() => {}} onCancel={onCancel} />)
  await user.click(screen.getByRole('button', { name: 'Close' }))
  expect(onCancel).toHaveBeenCalledTimes(1)
})
