import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { AvatarPicker } from './AvatarPicker'

it('renders the approved avatar gallery and selected state', () => {
  const { container } = render(<AvatarPicker selectedId="avatar_037" onSave={() => {}} onCancel={() => {}} />)
  expect(screen.getByRole('heading', { name: /choose an avatar/i })).toBeInTheDocument()
  expect(screen.getByRole('radio', { name: 'avatar_037' })).toHaveAttribute('aria-checked', 'true')
  expect(container.querySelectorAll('.avatar-selected-indicator')).toHaveLength(1)
  expect(screen.getByRole('radio', { name: 'avatar_037' })).toContainElement(container.querySelector('.avatar-selected-indicator'))
  expect(screen.getAllByRole('radio', { name: /avatar_/i })).toHaveLength(160)
  expect(screen.queryByRole('radio', { name: 'avatar_151' })).not.toBeInTheDocument()
  expect(screen.queryByRole('radio', { name: 'avatar_177' })).not.toBeInTheDocument()
})

it('cannot select an excluded avatar', () => {
  render(<AvatarPicker selected="avatar_151" onSave={() => {}} onCancel={() => {}} />)
  expect(screen.queryByRole('radio', { name: 'avatar_151' })).not.toBeInTheDocument()
})


it('moves the visible selected indicator when another avatar is chosen', async () => {
  const user = userEvent.setup()
  const { container } = render(<AvatarPicker selectedId="avatar_037" onSave={() => {}} onCancel={() => {}} />)

  await user.click(screen.getByRole('radio', { name: 'avatar_038' }))

  expect(screen.getByRole('radio', { name: 'avatar_038' })).toHaveAttribute('aria-checked', 'true')
  expect(screen.getByRole('radio', { name: 'avatar_037' })).toHaveAttribute('aria-checked', 'false')
  expect(container.querySelectorAll('.avatar-selected-indicator')).toHaveLength(1)
  expect(screen.getByRole('radio', { name: 'avatar_038' })).toContainElement(container.querySelector('.avatar-selected-indicator'))
})

it('keeps uploaded library avatars selectable alongside bundled avatars', async () => {
  const user = userEvent.setup()
  const onSave = vi.fn()
  const avatars = [
    { id: 'avatar_001', src: '/avatars/avatar_001.png', source: 'bundled' },
    { id: 'avatar_custom-one', src: 'https://example.com/one.png', source: 'uploaded' },
  ]
  render(<AvatarPicker selectedId="avatar_001" avatars={avatars} onSave={onSave} onCancel={() => {}} />)

  await user.click(screen.getByRole('radio', { name: 'avatar_custom-one' }))
  await user.click(screen.getByRole('button', { name: 'Save Avatar' }))

  expect(onSave).toHaveBeenCalledWith('avatar_custom-one')
  expect(screen.getByRole('radio', { name: 'avatar_custom-one' })).toHaveAttribute('aria-checked', 'true')
})
