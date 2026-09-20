import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { AvatarPicker } from './AvatarPicker'

it('renders all 103 new avatars and keeps the selected state', () => {
  const { container } = render(<AvatarPicker selectedId="avatar_037" onSave={() => {}} onCancel={() => {}} />)
  expect(screen.getByRole('heading', { name: /choose an avatar/i })).toBeInTheDocument()
  expect(screen.getAllByRole('radio', { name: /avatar_/i })).toHaveLength(103)
  expect(screen.getByRole('radio', { name: 'avatar_001' })).toBeInTheDocument()
  expect(screen.getByRole('radio', { name: 'avatar_103' })).toBeInTheDocument()
  expect(screen.queryByRole('radio', { name: 'avatar_104' })).not.toBeInTheDocument()
  expect(screen.getByRole('radio', { name: 'avatar_037' })).toHaveAttribute('aria-checked', 'true')
  expect(container.querySelectorAll('.avatar-selected-indicator')).toHaveLength(1)
})

it('moves the selected avatar and saves it', async () => {
  const user = userEvent.setup()
  const onSave = vi.fn()
  render(<AvatarPicker selectedId="avatar_037" onSave={onSave} onCancel={() => {}} />)
  await user.click(screen.getByRole('radio', { name: 'avatar_038' }))
  expect(screen.getByRole('radio', { name: 'avatar_038' })).toHaveAttribute('aria-checked', 'true')
  await user.click(screen.getByRole('button', { name: 'Save Avatar' }))
  expect(onSave).toHaveBeenCalledWith('avatar_038')
})
