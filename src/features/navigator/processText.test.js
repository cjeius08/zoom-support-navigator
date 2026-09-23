import { describe, expect, it } from 'vitest'
import { buildCallGuide, processSections } from './processText'
import { PROCESSES } from '../../data/processes'

it('preserves wording while structuring inline and standalone headings',()=>{
  expect(processSections('Purpose: Exact purpose\nIntroduction\nExact introduction')).toEqual([
    {heading:'Purpose',lines:['Exact purpose']},
    {heading:'Introduction',lines:['Exact introduction']},
  ])
})

it('surfaces source-specific requirement, quick-guide, limitation, and referral headings',()=>{
  const sections=processSections('Requirements and Important Notes\nKeep this note.\nQuick Flow\nDo this next.\nImportant Transfer Limitations\nDo not transfer.\nReferral / Roadblock Matrix\nContact IT.')
  expect(sections.map(section=>section.heading)).toEqual(['Requirements and Important Notes','Quick Flow','Important Transfer Limitations','Referral / Roadblock Matrix'])
})

describe('buildCallGuide', () => {
  const volume = PROCESSES.find((process) => process.id === 'adjusting-the-volume-of-a-zoom-meeting')
  const joining = PROCESSES.find((process) => process.id === 'troubleshooting-when-you-cant-join-a-zoom-meeting')
  const audioTest = PROCESSES.find((process) => process.id === 'testing-your-audio-settings-for-zoom-meetings')
  const bluetooth = PROCESSES.find((process) => process.id === 'using-bluetooth-headphones-with-zoom-on-android-ios')

  it('keeps source steps while treating lettered platform/scenario headings as routes, not fake steps', () => {
    const guide = buildCallGuide(volume)
    expect(guide.steps[0]).toMatchObject({ number: 1, title: 'Open Zoom Settings' })
    expect(guide.steps[0].instructions.join(' ')).toContain('Sign in to the Zoom Workplace desktop app')
    expect(guide.steps[0].scripts).toEqual([expect.stringContaining('Let’s adjust your Zoom volume before the meeting')])
    expect(guide.steps.some(step => /^A\.|^B\.|^C\./.test(step.title))).toBe(false)
    expect(guide.routes.map(route => route.label)).toEqual(expect.arrayContaining([
      'Adjust Volume Outside of a Meeting',
      'Adjust Volume During a Meeting',
    ]))
  })

  it('detects supported devices from the approved process and keeps mobile and desktop routes separate', () => {
    const audioGuide = buildCallGuide(audioTest)
    expect(audioGuide.availablePlatforms).toEqual(expect.arrayContaining(['windows','macos','linux','android','ios']))

    const bluetoothGuide = buildCallGuide(bluetooth)
    const mobileStep = bluetoothGuide.steps.find(step => step.title === 'Connect to Meeting Audio')
    const desktopStep = bluetoothGuide.steps.find(step => step.title === 'Join with Computer Audio')

    expect(mobileStep.platforms).toEqual(expect.arrayContaining(['android','ios']))
    expect(mobileStep.platforms).not.toContain('windows')
    expect(desktopStep.platforms).toEqual(expect.arrayContaining(['windows','macos']))
    expect(desktopStep.platforms).not.toContain('android')
  })

  it('keeps linked download and cleanup resources inside the numbered steps', () => {
    const guide = buildCallGuide(joining)
    expect(guide.steps.map(({ number }) => number)).toEqual([1, 2, 3, 4])
    expect(guide.steps[0].instructions.join(' ')).toContain('Zoom Download Center')
    expect(guide.steps[1].instructions.join(' ')).toContain('Uninstall Zoom')
    expect(guide.steps[1].instructions.join(' ')).toContain('CleanZoom utility')
  })

  it('does not repeat confirmation lines as both instructions and confirmations', () => {
    const guide = buildCallGuide({
      title: 'Test',
      text: 'Process / Step-by-Step Guide\n1. Test the speaker\nOpen Audio settings.\nConfirm that the customer can hear the tone.',
    })
    expect(guide.steps[0].instructions).toEqual(['Open Audio settings.'])
    expect(guide.steps[0].confirmations).toEqual(['Confirm that the customer can hear the tone.'])
  })

  it('exposes exact source quick guidance, limits, referrals, and an explicit source script', () => {
    const guide = buildCallGuide(volume)
    expect(guide.quickGuide).toContain('OPEN → AUDIO → TEST → ADJUST → CONFIRM')
    expect(guide.callouts.some((item) => item.kind === 'limitation')).toBe(true)
    expect(guide.referralDetails.join(' ')).toContain('host, account')
    expect(guide.suggestedScript).toMatchObject({ origin: 'source' })
  })

  it('creates a clearly-labelled conservative console script only when no source script exists', () => {
    const guide = buildCallGuide({ ...joining, text: 'Process / Step-by-Step Guide\n1. Check the meeting information\nConfirm the Meeting ID provided by the host.' })
    expect(guide.suggestedScript.origin).toBe('derived')
    expect(guide.suggestedScript.label).toBe('Console Suggested Script')
  })

  it('keeps every source-level closing script separately available', () => {
    const guide = buildCallGuide({ text: 'Process / Step-by-Step Guide\n1. Help\nDo the approved action.\nSample Closing Scripts:\nFirst approved closing.\nSecond approved closing.' })
    expect(guide.globalScripts).toEqual(['First approved closing.', 'Second approved closing.'])
  })

  it('returns usable source-driven guidance for every approved process', () => {
    for (const process of PROCESSES) {
      const guide = buildCallGuide(process)
      expect(guide.steps.length + guide.callouts.length).toBeGreaterThan(0)
      expect(guide.suggestedScript.text).not.toEqual('')
    }
  })
})
