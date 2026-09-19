import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { ActivateAccountForm } from './ActivateAccountForm'

it('places the mirrored Ozzie pointer beside the activation form', () => {
  const { container } = render(<ActivateAccountForm onActivate={vi.fn()} onCancel={vi.fn()} />)
  const mascot = container.querySelector('.activation-pointer-mascot')
  expect(mascot).toBeInTheDocument()
  expect(mascot).toHaveAttribute('src', expect.stringContaining('ozzie-activation-pointer.webp'))
})

it('shows the Ozzie celebration mascot after activation succeeds', async () => {
  const user = userEvent.setup()
  const onActivate = vi.fn().mockResolvedValue(undefined)
  const { container } = render(<ActivateAccountForm onActivate={onActivate} onCancel={vi.fn()} />)

  await user.type(screen.getByLabelText('Initials'), 'CJ')
  await user.type(screen.getByLabelText('Invite code'), 'TEST-CODE')
  await user.type(screen.getByLabelText('Choose username'), 'pilot_user')
  await user.type(screen.getByLabelText('Password'), 'password123')
  await user.type(screen.getByLabelText('Confirm password'), 'password123')
  await user.click(screen.getByRole('button', { name: 'Activate' }))

  await waitFor(() => expect(screen.getByRole('heading', { name: 'Account activated' })).toBeInTheDocument())
  expect(onActivate).toHaveBeenCalled()
  const mascot = container.querySelector('.activation-success-mascot')
  expect(mascot).toBeInTheDocument()
  expect(mascot).toHaveAttribute('src', expect.stringContaining('ozzie-activation-success.webp'))
})
