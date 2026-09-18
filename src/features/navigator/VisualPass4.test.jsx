import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { CommonIssueDrawer } from './CommonIssueDrawer'
import { routeById } from './commonIssueRoutes'

const CASES = [
  ['meeting-volume', 'audio-settings.png', /Find the speaker test and volume controls/i],
  ['auto-computer-audio', 'join-experience-settings.png', /Automatically connect to computer audio/i],
  ['multiple-audio-input-channels', 'multiple-audio-input-channels.svg', /Choose and save specific audio input channels/i],
  ['participants-before-join', 'participants-before-join.svg', /See who has already joined before you enter/i],
]

it.each(CASES)('shows a bundled reviewed visual for Batch 4 route %s', async (routeId, filename, title) => {
  const user = userEvent.setup()
  render(<CommonIssueDrawer
    route={routeById(routeId)}
    callContext={{ device: null, role: null, status: null }}
    onClose={() => {}}
    onOpenProcess={() => {}}
    onOpenRoute={() => {}}
    onStatusChange={() => {}}
  />)

  const dialog = screen.getByRole('dialog')
  await user.click(within(dialog).getByRole('tab', { name: 'Visual Guide' }))

  expect(within(dialog).getByText(title)).toBeInTheDocument()
  expect(within(dialog).queryByText(/No reviewed visual yet/i)).not.toBeInTheDocument()

  const image = within(dialog).getByRole('img')
  expect(image.getAttribute('src')).toMatch(new RegExp(`assets/visual-references/${filename.replace('.', '\\.')}$`))
  expect(image.getAttribute('src')).not.toMatch(/^https?:\/\//)
})

it('bundles the two new Visual Pass 4 guides as substantial local SVGs', () => {
  for (const filename of ['multiple-audio-input-channels.svg', 'participants-before-join.svg']) {
    const file = path.join(process.cwd(), 'public', 'assets', 'visual-references', filename)
    expect(fs.existsSync(file), `Missing visual: ${filename}`).toBe(true)
    const svg = fs.readFileSync(file, 'utf8')
    expect(svg.length).toBeGreaterThan(4000)
    expect(svg).toContain('SOURCE-VERIFIED VISUAL GUIDE')
    expect(svg).toContain('not a pixel-for-pixel UI reproduction')
  }
})

it('keeps the official Zoom Support article as the truth source for both new visual guides', () => {
  const channels = routeById('multiple-audio-input-channels')
  const participants = routeById('participants-before-join')

  expect(channels.visuals[0].sourceUrl).toBe(channels.primarySource.url)
  expect(participants.visuals[0].sourceUrl).toBe(participants.primarySource.url)
  expect(channels.visuals[0].note).toMatch(/3 or more channels/i)
  expect(channels.visuals[0].note).toMatch(/Save/i)
  expect(participants.visuals[0].note).toMatch(/does not prove the meeting is empty/i)
})
