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

  it('keeps numbered source steps and their following Sample Scripts together in source order', () => {
    const guide = buildCallGuide(volume)
    expect(guide.steps[0]).toMatchObject({ number: 1, title: 'Open Zoom Settings' })
    expect(guide.steps[0].instructions.join(' ')).toContain('Sign in to the Zoom Workplace desktop app')
    expect(guide.steps[0].scripts).toEqual([expect.stringContaining('Let’s adjust your Zoom volume before the meeting')])
    expect(guide.steps.length).toBeGreaterThanOrEqual(14)
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

  it('returns usable source-driven guidance for every approved process', () => {
    for (const process of PROCESSES) {
      const guide = buildCallGuide(process)
      expect(guide.steps.length + guide.callouts.length).toBeGreaterThan(0)
      expect(guide.suggestedScript.text).not.toEqual('')
    }
  })
})
