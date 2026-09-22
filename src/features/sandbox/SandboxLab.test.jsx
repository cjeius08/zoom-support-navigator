import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { SandboxLab } from './SandboxLab'

it('supports realistic device-specific Zoom training exploration', async () => {
  const user = userEvent.setup()
  render(<SandboxLab />)

  expect(screen.getByRole('heading', { name: 'Zoom Workplace Sandbox' })).toBeInTheDocument()
  expect(screen.getAllByText(/TRAINING SIMULATION/i).length).toBeGreaterThan(0)
  expect(screen.getByRole('button', { name: /Windows 11/i })).toHaveAttribute('aria-pressed', 'true')

  await user.click(screen.getAllByRole('button', { name: /Settings/i })[0])
  expect(screen.getByRole('dialog', { name: 'Zoom Settings' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Audio/i }))
  expect(screen.getByRole('heading', { name: 'Audio' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Close Settings' }))

  await user.click(screen.getByRole('button', { name: /Android/i }))
  expect(screen.getByRole('button', { name: /Android/i })).toHaveAttribute('aria-pressed', 'true')

  await user.click(screen.getByRole('button', { name: /New Meeting/i }))
  expect(screen.getByRole('dialog', { name: 'Join Audio' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Wi-Fi or Cellular Data' }))
  expect(screen.getByRole('button', { name: /Unmute/i })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /Chat/i }))
  expect(screen.getByText('Meeting Chat')).toBeInTheDocument()
})
