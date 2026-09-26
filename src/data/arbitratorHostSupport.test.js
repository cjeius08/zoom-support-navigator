import { describe, expect, it } from 'vitest'
import { HOST_ROADBLOCKS, HOST_SUPPORT_TOPICS, searchHostSupport } from './arbitratorHostSupport'

describe('arbitrator host support knowledge', () => {
  it('requires confirmation gates on every host troubleshooting topic', () => {
    expect(HOST_SUPPORT_TOPICS.length).toBeGreaterThan(0)
    for (const topic of HOST_SUPPORT_TOPICS) {
      expect(topic.confirmBeforeProceeding?.length, topic.id).toBeGreaterThan(0)
      expect(topic.resolvedWhen, topic.id).toBeTruthy()
      expect(topic.stopWhen?.length, topic.id).toBeGreaterThan(0)
    }
  })

  it('keeps every roadblock searchable and documentation-ready', () => {
    expect(HOST_ROADBLOCKS.length).toBeGreaterThan(0)
    for (const roadblock of HOST_ROADBLOCKS) {
      expect(roadblock.trigger, roadblock.id).toBeTruthy()
      expect(roadblock.agentBoundary, roadblock.id).toBeTruthy()
      expect(roadblock.nextAction, roadblock.id).toBeTruthy()
      expect(roadblock.documentationSummary, roadblock.id).toBeTruthy()
    }
  })

  it('finds host troubleshooting and roadblocks from the same search surface', () => {
    expect(searchHostSupport('waiting room').topics.map(item => item.id)).toContain('host-waiting-room')
    expect(searchHostSupport('firewall').roadblocks.map(item => item.id)).toContain('roadblock-network-security')
    expect(searchHostSupport('locked setting').roadblocks.map(item => item.id)).toContain('roadblock-account-permission')
  })

  it('does not change Call Documentation data or outcomes', () => {
    const serialized = JSON.stringify({ HOST_SUPPORT_TOPICS, HOST_ROADBLOCKS })
    expect(serialized).not.toContain('GOOGLE_CALL_REPORT_FIELDS')
    expect(serialized).not.toContain('Save note')
  })
})
