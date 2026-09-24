import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
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


  it('uses the roadmap as the training home and opens existing resources from the learning path', async () => {
    const user = userEvent.setup()
    render(<TrainingResources />)

    expect(screen.getByRole('tab', { name: 'Training Roadmap' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('heading', { name: /Follow one learning path/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Open call flow language' }))

    expect(screen.getByRole('tab', { name: 'Scripts & Communication' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Call Language' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel', { name: 'Opening / Greeting' })).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Training Roadmap' }))
    await user.click(screen.getByRole('button', { name: 'Open scenario scripts' }))

    expect(screen.getByRole('tab', { name: 'Scenario Scripts' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('region', { name: /Can.t Join scenario/i })).toBeInTheDocument()
  })

  it('publishes Training Roadmap as the default report context', () => {
    const onReportContextChange = vi.fn()
    render(<TrainingResources onReportContextChange={onReportContextChange} />)

    expect(onReportContextChange).toHaveBeenLastCalledWith(expect.objectContaining({
      selected_tab: 'Training Roadmap',
      current_section: 'Structured learning path',
    }))
  })


  it('opens Guided Visual Lessons from the roadmap and deep-links lesson resources', async () => {
    const user = userEvent.setup()
    render(<TrainingResources />)

    await user.click(screen.getByRole('button', { name: 'Open guided lessons' }))
    expect(screen.getByRole('tab', { name: 'Guided Visual Lessons' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('heading', { name: /Learn the pattern before practicing the call/i })).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /Separate speaker problems from microphone problems/i }))
    await user.click(screen.getByRole('button', { name: 'Open the Can’t Hear scenario' }))

    expect(screen.getByRole('tab', { name: 'Scripts & Communication' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Scenario Scripts' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Can’t Hear' })).toHaveAttribute('aria-selected', 'true')
  })

  it('opens the exact training location requested by the Readiness Lab without becoming a training tab itself', () => {
    const { rerender } = render(<TrainingResources initialTarget={{
      view: 'training',
      section: 'scripts',
      mode: 'language',
      subsection: 'identify',
    }} />)

    expect(screen.getByRole('tab', { name: 'Scripts & Communication' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel', { name: 'Identify Caller / Hearing' })).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Readiness Lab' })).not.toBeInTheDocument()

    rerender(<TrainingResources initialTarget={{
      view: 'training',
      section: 'lessons',
    }} />)

    expect(screen.getByRole('tab', { name: 'Guided Visual Lessons' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel', { name: 'Follow the Ogletree call flow before troubleshooting' })).toBeInTheDocument()
  })

  it('publishes the active Guided Visual Lesson as report context', async () => {
    const user = userEvent.setup()
    const onReportContextChange = vi.fn()
    render(<TrainingResources onReportContextChange={onReportContextChange} />)

    await user.click(screen.getByRole('tab', { name: 'Guided Visual Lessons' }))
    await user.click(screen.getByRole('tab', { name: /Know when basic support should stop/i }))

    expect(onReportContextChange).toHaveBeenLastCalledWith(expect.objectContaining({
      selected_tab: 'Guided Visual Lessons',
      current_section: 'Know when basic support should stop',
    }))
  })

  it('filters cards locally without creating an iframe before a video is opened', async () => {
    const user = userEvent.setup()
    render(<TrainingResources />)
    expect(screen.getByRole('heading', { name: 'Training & Resources' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Training Roadmap' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.queryByTitle(/video player/i)).not.toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: 'Video Library' }))
    await user.type(screen.getByRole('searchbox', { name: 'Search training videos' }), 'audio')
    expect(screen.getByText('How to Mute and Unmute on Zoom (PC, Mac & Phone Calls)')).toBeInTheDocument()
    expect(screen.queryByText('Zoom Waiting Room: How to Enable and Configure Settings')).not.toBeInTheDocument()
  })

  it('opens the privacy-enhanced player with next and YouTube fallback controls', async () => {
    const user = userEvent.setup()
    render(<TrainingResources />)
    await user.click(screen.getByRole('tab', { name: 'Video Library' }))
    const card = screen.getByText('How to Join a Zoom Meeting').closest('article')
    await user.click(within(card).getByRole('button', { name: /watch video/i }))
    const dialog = screen.getByRole('dialog', { name: /how to join a zoom meeting/i })
    expect(within(dialog).getByTitle('Video player: How to Join a Zoom Meeting')).toHaveAttribute('src', expect.stringContaining('www.youtube-nocookie.com/embed/pAMDxH_H_Cs'))
    expect(within(dialog).getByRole('link', { name: /open on youtube/i })).toHaveAttribute('href', expect.stringContaining('pAMDxH_H_Cs'))
    await user.click(within(dialog).getByRole('button', { name: /next video/i }))
    expect(screen.getByRole('dialog')).toHaveAccessibleName(/basic in-meeting navigation/i)
  })

  it('opens a requested training video directly in the Video Library', () => {
    const requested = TRAINING_VIDEOS.find(video => video.title === 'How to Join a Zoom Meeting')
    render(<TrainingResources initialVideoId={requested.id} />)

    expect(screen.getByRole('tab', { name: 'Video Library' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('dialog', { name: 'How to Join a Zoom Meeting' })).toBeInTheDocument()
  })


  it('opens the Scripts & Communication workspace without disturbing the other training sections', async () => {
    const user = userEvent.setup()
    render(<TrainingResources />)

    const scriptsTab = screen.getByRole('tab', { name: 'Scripts & Communication' })
    await user.click(scriptsTab)

    expect(scriptsTab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('heading', { name: /Live-call language that stays inside scope/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Call Language' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.queryByRole('searchbox', { name: 'Search training videos' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Device Walkthroughs' }))
    expect(screen.getByRole('heading', { name: /Choose the caller’s device/i })).toBeInTheDocument()
  })


  it('publishes the most specific Training tab and scenario for global reports', async () => {
    const user = userEvent.setup()
    const onReportContextChange = vi.fn()
    render(<TrainingResources onReportContextChange={onReportContextChange} />)

    await user.click(screen.getByRole('tab', { name: 'Scripts & Communication' }))
    await user.click(screen.getByRole('tab', { name: 'Scenario Scripts' }))
    await user.click(screen.getByRole('tab', { name: 'Screen Share' }))

    expect(onReportContextChange).toHaveBeenLastCalledWith(expect.objectContaining({
      selected_tab: 'Scenario Scripts',
      current_section: 'Screen Share',
    }))
  })


  it('deep-links a Readiness device question to the exact Device Walkthrough', () => {
    render(<TrainingResources initialTarget={{
      view: 'training',
      section: 'devices',
      device: 'iphone',
    }} />)

    expect(screen.getByRole('tab', { name: 'Device Walkthroughs' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /iPhone Zoom Workplace mobile app on iOS/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('heading', { name: 'iPhone mobile walkthrough' })).toBeInTheDocument()
  })


  it('keeps Training & Resources reference-only and does not expose Documentation as a training tab', () => {
    render(<TrainingResources />)

    expect(screen.getByRole('tab', { name: 'Training Roadmap' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Guided Visual Lessons' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Device Walkthroughs' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Scripts & Communication' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Video Library' })).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Documentation' })).not.toBeInTheDocument()
  })

})


it('opens Device Walkthroughs and Video Library from their Roadmap actions', async () => {
  const user = userEvent.setup()
  render(<TrainingResources />)

  await user.click(screen.getByRole('button', { name: 'Open device walkthroughs' }))
  expect(screen.getByRole('tab', { name: 'Device Walkthroughs' })).toHaveAttribute('aria-selected', 'true')

  await user.click(screen.getByRole('tab', { name: 'Training Roadmap' }))
  await user.click(screen.getByRole('button', { name: 'Open Video Library' }))
  expect(screen.getByRole('tab', { name: 'Video Library' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('searchbox', { name: 'Search training videos' })).toBeInTheDocument()
})

it('closes the video player when the Close video button is clicked', async () => {
  const user = userEvent.setup()
  render(<TrainingResources />)

  await user.click(screen.getByRole('tab', { name: 'Video Library' }))
  const card = screen.getByText('How to Join a Zoom Meeting').closest('article')
  await user.click(within(card).getByRole('button', { name: /watch video/i }))

  const dialog = screen.getByRole('dialog', { name: 'How to Join a Zoom Meeting' })
  await user.click(within(dialog).getByRole('button', { name: 'Close video' }))

  expect(screen.queryByRole('dialog', { name: 'How to Join a Zoom Meeting' })).not.toBeInTheDocument()
  expect(screen.getByRole('tab', { name: 'Video Library' })).toHaveAttribute('aria-selected', 'true')
})

  it('opens the external Windows sandbox in a dedicated walkthrough view and tracks the launch once', async () => {
    const user = userEvent.setup()
    const trackEvent = vi.fn()
    render(<TrainingResources trackEvent={trackEvent} />)

    await user.click(screen.getByRole('tab', { name: 'Device Walkthroughs' }))
    expect(screen.queryByTitle('Zoom Training Environment')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Open Zoom Training Environment' }))

    expect(screen.getByRole('heading', { name: 'Zoom Training Environment' })).toBeInTheDocument()
    expect(screen.getByTitle('Zoom Training Environment')).toHaveAttribute(
      'src',
      'https://limegreen-anteater-490127.hostingersite.com/',
    )
    expect(screen.getByRole('link', { name: 'Open training environment in a new tab' })).toHaveAttribute(
      'href',
      'https://limegreen-anteater-490127.hostingersite.com/',
    )
    expect(screen.getByText(/Ozzie records when this training environment opens/i)).toBeInTheDocument()
    expect(trackEvent).toHaveBeenCalledTimes(1)
    expect(trackEvent).toHaveBeenCalledWith({
      eventType: 'tool_open',
      routeId: 'training',
      toolId: 'windows-device-sandbox',
    })

    await user.click(screen.getByRole('button', { name: /Back to Windows walkthrough/i }))
    expect(screen.getByRole('tabpanel', { name: 'Windows desktop walkthrough' })).toBeInTheDocument()
  })


  it('opens the sandbox directly from the Home shortcut target without recording a second launch', () => {
    const trackEvent = vi.fn()
    render(<TrainingResources
      initialTarget={{ section: 'devices', device: 'windows', sandboxOpen: true }}
      trackEvent={trackEvent}
    />)

    expect(screen.getByRole('heading', { name: 'Zoom Training Environment' })).toBeInTheDocument()
    expect(screen.getByTitle('Zoom Training Environment')).toBeInTheDocument()
    expect(trackEvent).not.toHaveBeenCalled()
  })
