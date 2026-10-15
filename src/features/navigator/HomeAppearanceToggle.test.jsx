import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { Navigator } from './Navigator'

it('exposes an immediately usable Day/Night toggle on Home for regular agents', async () => {
  const user = userEvent.setup()
  const onThemeChange = vi.fn()
  const { rerender } = render(<Navigator isAdmin={false} theme="day" onThemeChange={onThemeChange} />)
  const day = screen.getByRole('button', { name: 'Day Mode' })
  const night = screen.getByRole('button', { name: 'Night Mode' })
  expect(day).toHaveAttribute('aria-pressed', 'true')
  expect(night).toHaveAttribute('aria-pressed', 'false')
  await user.click(night)
  expect(onThemeChange).toHaveBeenCalledWith('night')
  rerender(<Navigator isAdmin={false} theme="night" onThemeChange={onThemeChange} />)
  expect(night).toHaveAttribute('aria-pressed', 'true')
  await user.click(day)
  expect(onThemeChange).toHaveBeenCalledWith('day')
  expect(screen.queryByRole('button', { name: /Live visitors:/i })).not.toBeInTheDocument()
})
