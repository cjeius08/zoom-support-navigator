import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
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

it('keeps Hub information high contrast regardless of inherited workspace text theme', () => {
  // CSS itself is the contract: this reference overlays an image-backed dark
  // workspace yet its content cards use pale backgrounds in every theme.
  // The old styling omitted an explicit text color and resulted in white-on-white.
  const css = readFileSync(join(cwd(), 'src/features/knowledge/flexHubReference.css'), 'utf8')
  const colorOf = name => {
    const value = css.match(new RegExp(name + ':\\s*(#[0-9a-fA-F]{6})\\s*;'))
    expect(value, name).not.toBeNull()
    return value[1]
  }
  const luminance = hex => {
    const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    const adjusted = rgb.map(n => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4)
    return .2126 * adjusted[0] + .7152 * adjusted[1] + .0722 * adjusted[2]
  }
  const contrast = (a, b) => {
    const values = [luminance(a), luminance(b)].sort((x, y) => y - x)
    return (values[0] + .05) / (values[1] + .05)
  }
  const background = colorOf('--hub-card')
  expect(contrast(background, colorOf('--hub-ink'))).toBeGreaterThanOrEqual(7)
  expect(contrast(background, colorOf('--hub-muted'))).toBeGreaterThanOrEqual(4.5)
  expect(contrast(background, colorOf('--hub-eyebrow'))).toBeGreaterThanOrEqual(4.5)
  expect(contrast(background, colorOf('--hub-link'))).toBeGreaterThanOrEqual(4.5)
  expect(css).toContain('.flex-hub-view .flex-hub-topic li')
  expect(css).toContain('.flex-hub-view .flex-hub-video-grid button')
})
