import { expect, it } from 'vitest'
import { possibleRoadblocksForProcess } from './processRoadblocks'

it('maps audio Process Guides to device, permission, and product boundaries', () => {
  const items = possibleRoadblocksForProcess({ category: 'audio' })
  expect(items.map(item => item.id)).toEqual([
    'roadblock-device-hardware',
    'roadblock-managed-permission',
    'roadblock-zoom-product',
  ])
  items.forEach(item => {
    expect(item.why).toBeTruthy()
    expect(item.agentBoundary).toBeTruthy()
    expect(item.nextAction).toBeTruthy()
  })
})

it('uses the originating Common Issue to make exhausted roadblocks symptom-specific', () => {
  const items = possibleRoadblocksForProcess(
    { category: 'sharing' },
    { sourceRouteId: 'cant-share' },
  )
  expect(items[0]).toMatchObject({
    id: 'roadblock-host-controlled-feature',
  })
  expect(items[0].why).toMatch(/screen sharing/i)
})

it('does not invent roadblocks outside the approved roadblock inventory', () => {
  const categories = ['join', 'audio', 'video', 'controls', 'sharing', 'devices', 'support']
  for (const category of categories) {
    for (const item of possibleRoadblocksForProcess({ category })) {
      expect(item.id).toMatch(/^roadblock-/)
      expect(item.title).toBeTruthy()
      expect(item.agentBoundary).toBeTruthy()
      expect(item.nextAction).toBeTruthy()
    }
  }
})
