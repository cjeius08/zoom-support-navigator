import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FlexHubReference } from './FlexHubReference'
import { FLEX_HUB_REFERENCE, FLEX_HUB_VIDEOS, matchesFlexHubReference } from '../../data/flexHubReference'
import { ALL_TRAINING_VIDEOS, TRAINING_VIDEOS } from '../../data/trainingVideos'

describe('Flex Arbitration Hub reference integration', () => {
  it('has complete program reference, hides internal-only escalation email, and retains the one-link and recording rules', () => {
    expect(FLEX_HUB_REFERENCE.topics).toHaveLength(4)
    expect(FLEX_HUB_REFERENCE.topics.find(topic => topic.id === 'scheduling').points.join(' ')).toMatch(/SAME PMI link/)
    expect(FLEX_HUB_REFERENCE.topics.find(topic => topic.id === 'rules').points.join(' ')).toMatch(/NOT stop or turn off recordings/)
    expect(JSON.stringify(FLEX_HUB_REFERENCE)).not.toContain('odflexmassarbs@')
  })

  it('opens the two source-provided videos through Training & Resources', async () => {
    const user = userEvent.setup()
    const onOpenVideo = vi.fn()
    render(<FlexHubReference onOpenVideo={onOpenVideo} />)
    expect(screen.getByRole('heading',{name: /Flex Arbitration Hub – Agent Reference Guide/})).toBeInTheDocument()
    expect(screen.getByText(/Keep recording active/)).toBeInTheDocument()
    const buttons = screen.getAllByRole('button',{name: /Go to Video Library/})
    expect(buttons).toHaveLength(2)
    await user.click(buttons[0])
    expect(onOpenVideo).toHaveBeenCalledWith('flex-hub-site-overview')
    await user.click(buttons[1])
    expect(onOpenVideo).toHaveBeenCalledWith('flex-hub-overview-session')
  })

  it('retains 31 existing YouTube videos plus the two external videos', () => {
    expect(TRAINING_VIDEOS).toHaveLength(31)
    expect(FLEX_HUB_VIDEOS).toHaveLength(2)
    expect(ALL_TRAINING_VIDEOS).toHaveLength(33)
    expect(FLEX_HUB_VIDEOS.map(video => video.provider)).toEqual(['Synthesia','Vimeo'])
  })

  it('recognizes specific Hub searches without replacing general Zoom guidance', () => {
    for (const query of ['Flex Arbitration Hub', 'PMI', 'hearing scheduling', 'sharepoint guest login', 'welcome email']) {
      expect(matchesFlexHubReference(query),query).toBe(true)
    }
    expect(matchesFlexHubReference('mic not working')).toBe(false)
    expect(matchesFlexHubReference('breakout room')).toBe(false)
  })
})
