import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { CommonIssueDrawer } from './CommonIssueDrawer'
import { routeById } from './commonIssueRoutes'

const VISUAL_CASES = [
  ['secure-connection', 'secure-connection-error.png', /Recognize the exact secure-connection error/i],
  ['bluetooth-headset', 'audio-settings.png', /Zoom audio device selectors/i],
  ['transfer-device', 'switch-device.png', /Find the in-progress meeting and select Switch/i],
  ['join-muted', 'join-experience-settings.png', /Keep the microphone muted when joining/i],
  ['join-video-preference', 'join-experience-settings.png', /Choose the camera behavior before joining/i],
]

it.each(VISUAL_CASES)('renders a bundled source-verified visual for %s', async (routeId, filename, visualTitle) => {
  const user = userEvent.setup()
  const route = routeById(routeId)

  render(<CommonIssueDrawer
    route={route}
    callContext={{ device: null, role: null, status: null }}
    onClose={() => {}}
    onOpenProcess={() => {}}
    onOpenRoute={() => {}}
    onStatusChange={() => {}}
  />)

  const dialog = screen.getByRole('dialog')
  await user.click(within(dialog).getByRole('tab', { name: 'Visual Guide' }))

  expect(within(dialog).getByText(visualTitle)).toBeInTheDocument()
  expect(within(dialog).queryByText(/No reviewed visual yet/i)).not.toBeInTheDocument()

  const image = within(dialog).getByRole('img')
  expect(image.getAttribute('src')).toMatch(new RegExp(`assets/visual-references/${filename.replace('.', '\\.')}$`))
  expect(image.getAttribute('src')).not.toMatch(/^https?:\/\//)
})

it('keeps every Visual Pass 3 file physically bundled in public assets', () => {
  const filenames = [...new Set(VISUAL_CASES.map(([, filename]) => filename))]
  for (const filename of filenames) {
    const asset = path.join(process.cwd(), 'public', 'assets', 'visual-references', filename)
    expect(fs.existsSync(asset), `Missing bundled visual: ${filename}`).toBe(true)
    expect(fs.statSync(asset).size).toBeGreaterThan(1000)
  }
})

it('labels the visual tab as source-verified rather than claiming every image is an official Zoom asset', async () => {
  const user = userEvent.setup()
  render(<CommonIssueDrawer
    route={routeById('bluetooth-headset')}
    callContext={{ device: 'Windows', role: 'Participant', status: null }}
    onClose={() => {}}
  />)

  const dialog = screen.getByRole('dialog')
  await user.click(within(dialog).getByRole('tab', { name: 'Visual Guide' }))
  expect(within(dialog).getByText(/Source-verified visual references/i)).toBeInTheDocument()
  expect(within(dialog).getByRole('link', { name: /Real Zoom audio settings screen matched/i })).toHaveAttribute('href', expect.stringContaining('rcmusic.com'))
})
