import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { DeviceWalkthroughs } from './DeviceWalkthroughs'
import { DEVICE_WALKTHROUGHS, DEVICE_WALKTHROUGH_VERIFIED_AT } from './deviceWalkthroughs'

it('starts Phase 3 with Windows and Mac only', () => {
  expect(DEVICE_WALKTHROUGHS.map(device => device.id)).toEqual(['windows', 'mac'])
  expect(DEVICE_WALKTHROUGH_VERIFIED_AT).toBe('September 18, 2026')
})

it('keeps every walkthrough section source-grounded and backed by bundled local visuals', () => {
  for (const device of DEVICE_WALKTHROUGHS) {
    expect(device.sections.length).toBeGreaterThanOrEqual(4)
    expect(device.sources.length).toBeGreaterThanOrEqual(4)

    for (const source of device.sources) {
      expect(source.url).toMatch(/^https:\/\/support\.zoom\.com\//)
      expect(source.title).toBeTruthy()
    }

    for (const section of device.sections) {
      expect(section.steps.length).toBeGreaterThan(0)
      expect(section.whatTheyShouldSee).toBeTruthy()
      expect(section.image).not.toMatch(/^https?:\/\//)
      const file = path.join(process.cwd(), 'public', section.image)
      expect(fs.existsSync(file), 'Missing walkthrough visual: ' + section.image).toBe(true)
      expect(fs.statSync(file).size).toBeGreaterThan(1000)
    }
  }
})

it('shows Windows by default with the live-call orientation sequence', () => {
  render(<DeviceWalkthroughs />)

  expect(screen.getByRole('tab', { name: /Windows Zoom Workplace desktop app/i })).toHaveAttribute('aria-selected', 'true')
  const panel = screen.getByRole('tabpanel', { name: 'Windows desktop walkthrough' })
  expect(within(panel).getByRole('heading', { name: /Start from Zoom Workplace/i })).toBeInTheDocument()
  expect(within(panel).getByRole('heading', { name: /Find the meeting controls toolbar/i })).toBeInTheDocument()
  expect(within(panel).getByRole('heading', { name: /Speaker and microphone live under Audio/i })).toBeInTheDocument()
  expect(within(panel).getByRole('heading', { name: /Camera selection lives under Video/i })).toBeInTheDocument()
  expect(within(panel).getByText(/Alt \+ A toggles mute/i)).toBeInTheDocument()
})

it('switches to Mac and exposes macOS-specific permission guidance', async () => {
  const user = userEvent.setup()
  render(<DeviceWalkthroughs />)

  await user.click(screen.getByRole('tab', { name: /Mac Zoom Workplace desktop app on macOS/i }))

  const panel = screen.getByRole('tabpanel', { name: 'Mac desktop walkthrough' })
  expect(within(panel).getByText(/Command \+ Shift \+ A toggles mute/i)).toBeInTheDocument()
  expect(within(panel).getByRole('heading', { name: /Camera, microphone, and screen sharing can be blocked by macOS/i })).toBeInTheDocument()
  expect(within(panel).getAllByText(/System Settings → Privacy & Security/i).length).toBeGreaterThan(0)
  expect(within(panel).getByText(/Screen & System Audio Recording/i)).toBeInTheDocument()
})

it('shows the visual before each set of optional source links', () => {
  render(<DeviceWalkthroughs />)

  const panel = screen.getByRole('tabpanel', { name: 'Windows desktop walkthrough' })
  const images = within(panel).getAllByRole('img')
  const links = within(panel).getAllByRole('link')

  expect(images.length).toBeGreaterThanOrEqual(4)
  expect(links.length).toBeGreaterThanOrEqual(4)
  expect(images[0].compareDocumentPosition(links[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
})
