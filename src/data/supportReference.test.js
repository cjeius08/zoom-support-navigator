import { expect, it } from 'vitest'
import { ESCALATION_REQUIREMENTS, FAQ_ITEMS, ROADBLOCK_MATRIX, SUPPORT_HELPFUL_LINKS } from './supportReference'
import { HOST_ROADBLOCKS } from './arbitratorHostSupport'

it('keeps the complete arbitrator FAQ reference', () => {
  expect(FAQ_ITEMS.map(item => item.label)).toEqual([
    'Login Credentials',
    'Recording',
    'Password',
    'Waiting Room',
    'Username',
    'Host Controls',
    'Meeting Link Invalid / Expired',
  ])
  expect(FAQ_ITEMS.find(item => item.label === 'Recording')?.answer).toMatch(/automatically record/i)
  expect(FAQ_ITEMS.find(item => item.label === 'Meeting Link Invalid / Expired')?.points).toHaveLength(3)
  expect(SUPPORT_HELPFUL_LINKS[0]?.url).toMatch(/^https:\/\/support\.zoom\.com\//)
})

it('keeps all Roadblock Matrix boundaries and escalation requirements', () => {
  expect(ROADBLOCK_MATRIX).toHaveLength(11)
  expect(ROADBLOCK_MATRIX.every(item => item.boundary && item.contact && item.language)).toBe(true)
  expect(ROADBLOCK_MATRIX.map(item => item.roadblock)).toEqual(expect.arrayContaining([
    'Waiting Room admission',
    'Host-controlled feature or permission',
    'Network, firewall, VPN, or security restriction',
    'Privacy, recording, confidentiality, or proceeding-policy question',
  ]))
  expect(ESCALATION_REQUIREMENTS.map(item => item.label)).toEqual([
    'Issue Description',
    'Support Call Date and Time',
    'Arbitrator’s Name',
    'Preferred Contact Method',
    'Merits Hearing Date and Time',
  ])
})


it('keeps caller-facing roadblock guidance on the approved referral and Alaga paths', () => {
  const callerFacing = ROADBLOCK_MATRIX.map(item => `${item.contact}\n${item.language}`).join('\n')
  expect(callerFacing).not.toMatch(/odflexmassarbs@ogletreedeakins\.com/i)
  expect(callerFacing).not.toMatch(/contact your organization.?s (?:IT|Zoom administrator)/i)

  expect(ROADBLOCK_MATRIX.find(item => item.roadblock === 'Zoom account, sign-in, license, role, or administrative permission')?.contact)
    .toMatch(/Alaga escalation/i)
  expect(ROADBLOCK_MATRIX.find(item => item.roadblock === 'Unable to join after approved basic joining troubleshooting')?.contact)
    .toMatch(/device manufacturer or internet service provider/i)
})


it('keeps the Host roadblock drawer and reference matrix on the same approved roadblock inventory', () => {
  expect(HOST_ROADBLOCKS.map(item => item.title)).toEqual(ROADBLOCK_MATRIX.map(item => item.roadblock))
})
