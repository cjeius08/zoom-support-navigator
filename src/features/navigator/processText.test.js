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
  const sharing = PROCESSES.find((process) => process.id === 'sharing-your-screen-desktop-or-content-in-zoom')
  const videoPreference = PROCESSES.find((process) => process.id === 'setting-your-video-to-stay-on-or-off-when-joining-meetings-and-webinars')
  const chat = PROCESSES.find((process) => process.id === 'chatting-in-a-zoom-meeting')
  const transfer = PROCESSES.find((process) => process.id === 'transferring-meetings-and-webinars-between-devices')
  const multiChannel = PROCESSES.find((process) => process.id === 'enabling-and-managing-multiple-audio-input-channels-in-zoom')
  const participantPreview = PROCESSES.find((process) => process.id === 'viewing-participants-already-in-a-meeting-before-joining')

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

  it('turns A1/B1/C1 document actions into ordered steps inside their parent approved path', () => {
    const guide = buildCallGuide(sharing)
    const windowsPath = guide.steps.filter(step => step.routeId === 'a')

    expect(windowsPath.map(step => step.title)).toEqual(expect.arrayContaining([
      'Open Screen Share',
      'Choose What to Share',
      'Choose Optional Presenter and Share Options',
      'Start Sharing',
      'Stop Sharing',
    ]))
    expect(windowsPath.every(step => step.platforms.includes('windows') || step.title === 'Show Zoom Windows During Screen Share')).toBe(true)
    expect(guide.routes.find(route => route.id === 'a')).toMatchObject({
      label: expect.stringMatching(/Windows.*macOS/i),
    })
  })

  it('keeps letter-only sections as a meaningful step when the approved document has no A1 substeps', () => {
    const guide = buildCallGuide(videoPreference)
    const desktopOn = guide.steps.find(step => step.routeId === 'a')

    expect(desktopOn.title).toMatch(/Set the Camera to Stay On by Default/i)
    expect(desktopOn.instructions.join(' ')).toMatch(/Keep my camera off/i)
    expect(desktopOn.platforms).toEqual(expect.arrayContaining(['windows', 'macos']))
    expect(desktopOn.platforms).not.toContain('android')

    const mobileOn = guide.steps.find(step => step.routeId === 'c')
    expect(mobileOn.platforms).toEqual(expect.arrayContaining(['android', 'ios']))
    expect(mobileOn.instructions.join(' ')).toMatch(/Turn off my video/i)
  })

  it('keeps desktop, mobile, and web chat actions inside separate platform paths', () => {
    const guide = buildCallGuide(chat)
    expect(guide.steps.find(step => step.title === 'Chat With Everyone' && step.routeId === 'a')?.platforms)
      .toEqual(expect.arrayContaining(['windows', 'macos', 'linux']))
    expect(guide.steps.find(step => step.title === 'Chat With Everyone' && step.routeId === 'b')?.platforms)
      .toEqual(expect.arrayContaining(['android', 'ios']))
    expect(guide.steps.find(step => /Everyone or Send a Private Message/i.test(step.title))?.platforms)
      .toEqual(['web'])
  })

  it('preserves device-transfer steps instead of turning each A1/B1/C1 action into a separate route', () => {
    const guide = buildCallGuide(transfer)
    expect(guide.routes.map(route => route.id)).toEqual(expect.arrayContaining(['a', 'b', 'c', 'd']))
    expect(guide.routes.some(route => /^a1$|^b1$|^c1$/.test(route.id))).toBe(false)
    expect(guide.steps.filter(step => step.routeId === 'a').map(step => step.title))
      .toEqual(expect.arrayContaining(['Sign In on the Device You Want to Switch To', 'Open the Home Tab', 'Transfer the Session']))
  })

  it('infers audited Windows/macOS scope for desktop-only approved guides whose Applies To line is generic', () => {
    expect(buildCallGuide(multiChannel).availablePlatforms).toEqual(expect.arrayContaining(['windows', 'macos']))
    expect(buildCallGuide(participantPreview).availablePlatforms).toEqual(expect.arrayContaining(['windows', 'macos']))
    expect(buildCallGuide(multiChannel).availablePlatforms).not.toContain('android')
    expect(buildCallGuide(participantPreview).availablePlatforms).not.toContain('web')
  })

  it('does not promote supporting-resource labels into fake troubleshooting steps', () => {
    const desktopAudio = PROCESSES.find((process) => process.id === 'troubleshooting-speaker-or-microphone-issues-in-the-zoom-desktop-app')
    const camera = PROCESSES.find((process) => process.id === 'zoom-camera-troubleshooting-during-a-meeting')
    const audioTitles = buildCallGuide(desktopAudio).steps.map(step => step.title)
    const cameraTitles = buildCallGuide(camera).steps.map(step => step.title)

    expect(audioTitles).not.toContain('Zoom-supported USB devices')
    expect(audioTitles).not.toContain('Testing Zoom audio settings')
    expect(audioTitles).not.toContain('Using in-meeting chat')
    expect(cameraTitles).not.toContain('Troubleshooting video crashes')
    expect(cameraTitles).not.toContain('Testing your video before a meeting')
  })

  it('keeps advanced native Bluetooth Windows paths off Android and iOS', () => {
    const guide = buildCallGuide(bluetooth)
    for (const routeId of ['c', 'd', 'e', 'f', 'g']) {
      const routeSteps = guide.steps.filter(step => step.routeId === routeId)
      expect(routeSteps.length).toBeGreaterThan(0)
      expect(routeSteps.every(step => step.platforms.includes('windows'))).toBe(true)
      expect(routeSteps.every(step => !step.platforms.includes('android') && !step.platforms.includes('ios'))).toBe(true)
    }
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
