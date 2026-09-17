import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { ForcePasswordChange } from './ForcePasswordChange'

it('renders two password fields, validation, save, and logout controls', async () => {
  const user = (await import('@testing-library/user-event')).default.setup()
  const onChange = vi.fn().mockResolvedValue(undefined)
  render(<ForcePasswordChange onChange={onChange} onLogout={vi.fn()} />)
  expect(screen.getByLabelText('New Password')).toBeInTheDocument()
  expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Change Password/i }))
  expect(screen.getByRole('alert')).toHaveTextContent(/at least 8/i)
  await user.type(screen.getByLabelText('New Password'), 'strongpass8')
  await user.type(screen.getByLabelText('Confirm New Password'), 'different9')
  await user.click(screen.getByRole('button', { name: /Change Password/i }))
  expect(screen.getByRole('alert')).toHaveTextContent(/match/i)
  expect(onChange).not.toHaveBeenCalled()
})
