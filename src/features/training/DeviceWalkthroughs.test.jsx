import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { DeviceWalkthroughs } from './DeviceWalkthroughs'
import { DEVICE_WALKTHROUGHS, DEVICE_WALKTHROUGH_VERIFIED_AT } from './deviceWalkthroughs'

it('covers the final five-device Phase 3 baseline', () => {
  expect(DEVICE_WALKTHROUGHS.map(device => device.id)).toEqual(['windows', 'mac', 'iphone', 'android', 'browser'])
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
  expect(within(panel).getAllByText(/Screen & System Audio Recording/i).length).toBeGreaterThan(0)
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

it('uses dedicated iPhone visuals and iOS-specific labels', async () => {
  const user = userEvent.setup()
  render(<DeviceWalkthroughs />)

  await user.click(screen.getByRole('tab', { name: /iPhone Zoom Workplace mobile app on iOS/i }))

  const panel = screen.getByRole('tabpanel', { name: 'iPhone mobile walkthrough' })
  expect(within(panel).getAllByText(/Mute My Microphone/i).length).toBeGreaterThan(0)
  expect(within(panel).getByRole('heading', { name: /iPhone screen sharing uses Screen Broadcast/i })).toBeInTheDocument()
  expect(within(panel).getAllByText(/Start Broadcast/i).length).toBeGreaterThan(0)

  const images = within(panel).getAllByRole('img')
  expect(images.length).toBeGreaterThanOrEqual(4)
  for (const image of images) {
    expect(image.getAttribute('src')).toMatch(/iphone-mobile-(controls|settings)\.svg$/)
  }
})

it('uses dedicated Android visuals and Android-specific labels', async () => {
  const user = userEvent.setup()
  render(<DeviceWalkthroughs />)

  await user.click(screen.getByRole('tab', { name: /Android Zoom Workplace mobile app on Android/i }))

  const panel = screen.getByRole('tabpanel', { name: 'Android mobile walkthrough' })
  expect(within(panel).getAllByText(/Always Mute My Microphone/i).length).toBeGreaterThan(0)
  expect(within(panel).getByRole('heading', { name: /Android shows a system sharing indicator/i })).toBeInTheDocument()
  expect(within(panel).getAllByText(/Permission Manager/i).length).toBeGreaterThan(0)

  const images = within(panel).getAllByRole('img')
  expect(images.length).toBeGreaterThanOrEqual(4)
  for (const image of images) {
    expect(image.getAttribute('src')).toMatch(/android-mobile-(controls|settings)\.svg$/)
  }
})

it('keeps iPhone and Android visual assets distinct', () => {
  const iphone = DEVICE_WALKTHROUGHS.find(device => device.id === 'iphone')
  const android = DEVICE_WALKTHROUGHS.find(device => device.id === 'android')
  const iphoneAssets = new Set(iphone.sections.map(section => section.image))
  const androidAssets = new Set(android.sections.map(section => section.image))

  expect([...iphoneAssets].every(asset => asset.includes('iphone-mobile-'))).toBe(true)
  expect([...androidAssets].every(asset => asset.includes('android-mobile-'))).toBe(true)
  expect([...iphoneAssets].some(asset => androidAssets.has(asset))).toBe(false)
})


it('uses dedicated Browser visuals and Web App-specific guidance', async () => {
  const user = userEvent.setup()
  render(<DeviceWalkthroughs />)

  await user.click(screen.getByRole('tab', { name: /Browser Zoom Web App in a desktop browser/i }))

  const panel = screen.getByRole('tabpanel', { name: 'Browser / Zoom Web App walkthrough' })
  expect(within(panel).getByRole('heading', { name: /Stay in the browser instead of launching the app/i })).toBeInTheDocument()
  expect(within(panel).getAllByText(/Join from your browser/i).length).toBeGreaterThan(0)
  expect(within(panel).getByRole('heading', { name: /Use the Web App meeting toolbar/i })).toBeInTheDocument()
  expect(within(panel).getByRole('heading', { name: /Web App settings stay inside the meeting/i })).toBeInTheDocument()
  expect(within(panel).getByRole('heading', { name: /Allow the browser to use microphone, camera, and screen share/i })).toBeInTheDocument()
  expect(within(panel).getAllByText(/profile picture/i).length).toBeGreaterThan(0)

  const images = within(panel).getAllByRole('img')
  expect(images.length).toBeGreaterThanOrEqual(4)
  for (const image of images) {
    expect(image.getAttribute('src')).toMatch(/browser-(webapp-(join|controls)|permissions)\.svg$/)
  }
})

it('keeps Browser visuals separate from installed-app walkthrough assets', () => {
  const browser = DEVICE_WALKTHROUGHS.find(device => device.id === 'browser')
  const installedAppAssets = new Set(
    DEVICE_WALKTHROUGHS
      .filter(device => device.id !== 'browser')
      .flatMap(device => device.sections.map(section => section.image)),
  )

  expect(browser.sections.every(section => section.image.includes('browser-'))).toBe(true)
  expect(browser.sections.some(section => installedAppAssets.has(section.image))).toBe(false)
})
