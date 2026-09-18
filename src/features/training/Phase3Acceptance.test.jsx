import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { DeviceWalkthroughs } from './DeviceWalkthroughs'
import { DEVICE_WALKTHROUGHS, DEVICE_WALKTHROUGH_VERIFIED_AT, deviceWalkthroughById } from './deviceWalkthroughs'

const FROZEN_DEVICE_IDS = ['windows', 'mac', 'iphone', 'android', 'browser']

it('freezes the Phase 3 device inventory', () => {
  expect(DEVICE_WALKTHROUGHS.map(device => device.id)).toEqual(FROZEN_DEVICE_IDS)
  expect(DEVICE_WALKTHROUGHS).toHaveLength(5)
  expect(DEVICE_WALKTHROUGH_VERIFIED_AT).toBe('September 18, 2026')
})

it('keeps every frozen device walkthrough complete and source-traceable', () => {
  for (const device of DEVICE_WALKTHROUGHS) {
    expect(device.label).toBeTruthy()
    expect(device.title).toBeTruthy()
    expect(device.summary).toBeTruthy()
    expect(device.quickFacts.length).toBeGreaterThanOrEqual(3)
    expect(device.sections.length).toBeGreaterThanOrEqual(4)
    expect(device.platformNotes.length).toBeGreaterThanOrEqual(3)
    expect(device.sources.length).toBeGreaterThanOrEqual(4)

    const sectionIds = device.sections.map(section => section.id)
    expect(new Set(sectionIds).size, device.id + ' has duplicate section IDs').toBe(sectionIds.length)

    for (const section of device.sections) {
      expect(section.steps.length, device.id + ' / ' + section.id + ' needs steps').toBeGreaterThan(0)
      expect(section.whatTheyShouldSee, device.id + ' / ' + section.id + ' needs an expected result').toBeTruthy()
      expect(section.image, device.id + ' / ' + section.id + ' needs a bundled visual').not.toMatch(/^https?:\/\//)

      const asset = path.join(process.cwd(), 'public', section.image)
      expect(fs.existsSync(asset), 'Missing Phase 3 asset: ' + section.image).toBe(true)
      expect(fs.statSync(asset).size).toBeGreaterThan(1000)
    }

    for (const source of device.sources) {
      expect(source.title).toBeTruthy()
      expect(source.url).toMatch(/^https:\/\/support\.zoom\.com\//)
    }
  }
})

it('keeps the three Phase 3 platform visual families distinct where platform-specific assets exist', () => {
  const iphone = deviceWalkthroughById('iphone')
  const android = deviceWalkthroughById('android')
  const browser = deviceWalkthroughById('browser')

  expect(iphone.sections.every(section => section.image.includes('iphone-mobile-'))).toBe(true)
  expect(android.sections.every(section => section.image.includes('android-mobile-'))).toBe(true)
  expect(browser.sections.every(section => section.image.includes('browser-'))).toBe(true)

  const iphoneAssets = new Set(iphone.sections.map(section => section.image))
  const androidAssets = new Set(android.sections.map(section => section.image))
  const browserAssets = new Set(browser.sections.map(section => section.image))

  expect([...iphoneAssets].some(asset => androidAssets.has(asset))).toBe(false)
  expect([...iphoneAssets].some(asset => browserAssets.has(asset))).toBe(false)
  expect([...androidAssets].some(asset => browserAssets.has(asset))).toBe(false)
})

it('keeps the verified Browser limitations visible in the approved walkthrough', () => {
  const browser = deviceWalkthroughById('browser')
  const allText = [
    browser.summary,
    ...browser.quickFacts,
    ...browser.sections.flatMap(section => [section.title, ...section.steps, section.whatTheyShouldSee]),
    ...browser.platformNotes.flatMap(note => [note.title, note.text]),
  ].join(' ')

  expect(allText).toMatch(/Join from your browser/i)
  expect(allText).toMatch(/host or account/i)
  expect(allText).toMatch(/end-to-end encrypted|E2EE/i)
  expect(allText).toMatch(/browser.*permission/i)
  expect(allText).toMatch(/mobile web browsers.*limited functionality/i)
})

it('lets an agent switch across all five frozen device tabs', async () => {
  const user = userEvent.setup()
  render(<DeviceWalkthroughs />)

  const expectations = [
    ['Windows', 'Windows desktop walkthrough'],
    ['Mac', 'Mac desktop walkthrough'],
    ['iPhone', 'iPhone mobile walkthrough'],
    ['Android', 'Android mobile walkthrough'],
    ['Browser', 'Browser / Zoom Web App walkthrough'],
  ]

  for (const [label, panelName] of expectations) {
    const tab = screen.getByRole('tab', { name: new RegExp('^' + label + '\\b', 'i') })
    await user.click(tab)
    expect(tab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel', { name: panelName })).toBeInTheDocument()
  }
})
