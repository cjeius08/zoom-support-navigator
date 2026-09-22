import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { SandboxLab } from './SandboxLab'

it('supports free device exploration without scenarios or scoring', async () => {
  const user = userEvent.setup()
  render(<SandboxLab />)

  expect(screen.getByRole('heading', { name: 'Device Sandbox' })).toBeInTheDocument()
  expect(screen.getByText('FREE EXPLORE')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Windows 11/i })).toHaveAttribute('aria-pressed', 'true')

  await user.click(screen.getByRole('button', { name: /Android/i }))
  expect(screen.getByRole('button', { name: /Android/i })).toHaveAttribute('aria-pressed', 'true')

  await user.click(screen.getByRole('button', { name: 'Meeting Controls' }))
  expect(screen.getByRole('heading', { name: 'In Meeting' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /Unmute/i }))
  expect(screen.getByRole('button', { name: /Mute/i })).toBeInTheDocument()
})
