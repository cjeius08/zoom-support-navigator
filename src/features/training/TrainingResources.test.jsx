import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { TRAINING_VIDEOS } from '../../data/trainingVideos'
import { TrainingResources } from './TrainingResources'

describe('Training & Resources', () => {
  it('has a unique, complete static video manifest', () => {
    expect(TRAINING_VIDEOS).toHaveLength(31)
    expect(new Set(TRAINING_VIDEOS.map((video) => video.videoId)).size).toBe(TRAINING_VIDEOS.length)
    for (const video of TRAINING_VIDEOS) {
      expect(video.youtubeUrl).toContain(video.videoId)
      expect(video.thumbnailUrl).toContain(video.videoId)
      expect(video.title).not.toMatch(/unavailable/i)
    }
  })

  it('filters cards locally without creating an iframe before a video is opened', async () => {
    const user = userEvent.setup()
    render(<TrainingResources />)
    expect(screen.getByRole('heading', { name: 'Training & Resources' })).toBeInTheDocument()
    expect(screen.queryByTitle(/video player/i)).not.toBeInTheDocument()
    await user.type(screen.getByRole('searchbox', { name: 'Search training videos' }), 'audio')
    expect(screen.getByText('How to Mute and Unmute on Zoom (PC, Mac & Phone Calls)')).toBeInTheDocument()
    expect(screen.queryByText('Zoom Waiting Room: How to Enable and Configure Settings')).not.toBeInTheDocument()
  })

  it('opens the privacy-enhanced player with next and YouTube fallback controls', async () => {
    const user = userEvent.setup()
    render(<TrainingResources />)
    const card = screen.getByText('How to Join a Zoom Meeting').closest('article')
    await user.click(within(card).getByRole('button', { name: /watch video/i }))
    const dialog = screen.getByRole('dialog', { name: /how to join a zoom meeting/i })
    expect(within(dialog).getByTitle('Video player: How to Join a Zoom Meeting')).toHaveAttribute('src', expect.stringContaining('www.youtube-nocookie.com/embed/pAMDxH_H_Cs'))
    expect(within(dialog).getByRole('link', { name: /open on youtube/i })).toHaveAttribute('href', expect.stringContaining('pAMDxH_H_Cs'))
    await user.click(within(dialog).getByRole('button', { name: /next video/i }))
    expect(screen.getByRole('dialog')).toHaveAccessibleName(/basic in-meeting navigation/i)
  })
})
