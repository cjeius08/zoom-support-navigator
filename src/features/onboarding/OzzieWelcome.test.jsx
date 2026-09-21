import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { OzzieWelcome } from './OzzieWelcome'

it('shows the first-login Ozzie introduction and completes from either action', async () => {
  const user = userEvent.setup()
  const onContinue = vi.fn()

  render(
    <OzzieWelcome
      open
      videoSrc="/assets/Ozzie2.mp4"
      onContinue={onContinue}
    />,
  )

  expect(screen.getByRole('heading', { name: 'Meet Ozzie' })).toBeInTheDocument()
  const video = screen.getByLabelText('Meet Ozzie introduction video')
  const audio = document.querySelector('audio')
  expect(video).toHaveAttribute('src', '/assets/Ozzie2.mp4')
  expect(video).toHaveAttribute('preload', 'auto')
  expect(video.muted).toBe(true)
  expect(audio).toHaveAttribute('src', '/assets/Ozzie2.mp4')
  expect(screen.getByRole('button', { name: 'Play Ozzie introduction' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Start Exploring' }))
  expect(onContinue).toHaveBeenCalledTimes(1)
})

it('replays without showing the first-login Skip action', async () => {
  const user = userEvent.setup()
  const onClose = vi.fn()

  render(
    <OzzieWelcome
      open
      replay
      videoSrc="/assets/Ozzie2.mp4"
      onClose={onClose}
    />,
  )

  expect(screen.queryByRole('button', { name: 'Skip' })).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Back to Workspace' }))
  expect(onClose).toHaveBeenCalledTimes(1)
})
