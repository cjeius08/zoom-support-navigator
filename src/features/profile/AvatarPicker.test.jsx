import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { AvatarPicker } from './AvatarPicker'

it('renders the approved avatar gallery and selected state', () => {
  render(<AvatarPicker selectedId="avatar_037" onSave={() => {}} onCancel={() => {}} />)
  expect(screen.getByRole('heading', { name: /choose an avatar/i })).toBeInTheDocument()
  expect(screen.getByRole('radio', { name: 'avatar_037' })).toHaveAttribute('aria-checked', 'true')
  expect(screen.getAllByRole('radio', { name: /avatar_/i })).toHaveLength(160)
  expect(screen.queryByRole('radio', { name: 'avatar_151' })).not.toBeInTheDocument()
  expect(screen.queryByRole('radio', { name: 'avatar_177' })).not.toBeInTheDocument()
})

it('cannot select an excluded avatar', () => {
  render(<AvatarPicker selected="avatar_151" onSave={() => {}} onCancel={() => {}} />)
  expect(screen.queryByRole('radio', { name: 'avatar_151' })).not.toBeInTheDocument()
})
