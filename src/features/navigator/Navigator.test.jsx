import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { Navigator } from './Navigator'

it('preserves the imported support-process categories and opens a source-backed process', async () => {
  const user = (await import('@testing-library/user-event')).default.setup()
  render(<Navigator />)
  expect(screen.getByRole('heading', { name: 'What does the customer need?' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Joining Meetings/i }))
  expect(screen.getByText(/Troubleshooting When You Can’t Join a Zoom Meeting/i)).toBeInTheDocument()
})
