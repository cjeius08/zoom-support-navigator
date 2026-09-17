import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { PROCESSES } from './processes'

const SOURCE_HASHES = {
  'troubleshooting-when-you-cant-join-a-zoom-meeting': '10a83fc40a6a75f1c57de38f7c1203795adbd4f2441501e95c83163e82d9009f',
  'adjusting-the-volume-of-a-zoom-meeting': '0137a7233cae3468c47e7798379e01a9e731576eca1346d40d723e225710926c',
  'automatically-joining-meetings-with-computer-audio': 'd427d9bed221d9492b4d6138c82c39341d2218289e81f5b945a0ca6ba2df8ec6',
  'chatting-in-a-zoom-meeting': 'dd6662d6ed2950980f0b4c56ef6aaa81c9d6672fcffa0a507cda24822bdb2ffe',
  'enabling-and-managing-multiple-audio-input-channels-in-zoom': 'c6e2d9e602b06de9baab800c7a59134408cf30bd9acc29e45ceb411da3eba8ad',
  'joining-a-zoom-meeting': '8d418880ea7858f58a452c9d6d86eb04bcd729fc41b0f061708602b434364a28',
  'locate-describe-guide-confirm': 'e0cdbe5f6cae1ac8c6854e0e1d7d57c6174a5b0ce719a57132e238e9af25ae1f',
  'muting-your-microphone-when-joining-a-zoom-meeting': 'a82beaa3f9e120015b97d3850c2f386ee7052e02e774b73d4c134ade850f593d',
  'setting-your-video-to-stay-on-or-off-when-joining-meetings-and-webinars': '1373469beb217e05f0a529cfd728f388b2e58a8e3120c14699206591462d808a',
  'sharing-your-screen-desktop-or-content-in-zoom': 'e4addc87925daba6ef2565da92acf8b61feb4947b487d27f883c503df9418078',
  'showing-and-hiding-your-video-in-a-zoom-meeting': '8bd70caf7d2499fb6aba60c322f2153053cfac1c42091c1d75f82fd891cfc405',
  'testing-your-audio-settings-for-zoom-meetings': '29b06af9dd57fafe0a4a883e354cee363d8cb7e5ec1dec72fd1e58e6fa40d3d1',
  'testing-your-video-in-zoom': '02607a4086958e7b2956e99ce60ac797269d3f747663bd5d95bf24d6ba435c1a',
  'transferring-meetings-and-webinars-between-devices': 'fbca13beae286831942cbcba6caab5ab7e0c359f5a6124ff0c79d8f7b523db98',
  'troubleshooting-speaker-or-microphone-issues-in-the-zoom-desktop-app': '3f4af6ea133c3b4c155fa3ad2cd4885874cb8680e02207eab36428212cd2fcdb',
  'troubleshooting-speaker-or-microphone-issues-on-a-mobile-device': 'd1ee93551034ee474adca5ea87dd3b5222c78b30e909904aa754928dd45efd49',
  'uninstalling-and-reinstalling-the-zoom-application': '48a4ea8f4986b10d413086efaa9f827b0d023104679ebb0b0ee7d334d95d5d50',
  'using-bluetooth-headphones-with-zoom-on-android-ios': 'bf776ac669c10556ef8f9307dbd071541243656d6ef5e9cf20c7e9ea58df54e2',
  'using-non-verbal-feedback-and-meeting-reactions': 'd8b90ae0be45c838e7c2cb8b8e0e96c222aea7bae8f70d08fe11da4dbad499ee',
  'using-participant-controls-in-a-zoom-meeting': 'efa5c62f50ca3685a9362cb5c40c2edb13d9aba1e6d511deaf6c646eac987b06',
  'viewing-participants-already-in-a-meeting-before-joining': '1eefd111d9c1829d8be62610ff53c6d1185f15c05bfecb2997abdd09efa6ef45',
  'waiting-for-the-host-to-start-a-meeting-or-webinar': '52906e359950b53c61f5b2398582bf3a49b0550b82fd9b0652e7999bbc623349',
  'zoom-audio-troubleshooting': '5f133dd2a42540e7855f83c68899959594fbf913211fac1a16ec60f60c81613b',
  'zoom-basic-support-boundaries-decision-path-referral-process': '1c35411435b5466e15f336e646fe3bd4c0f7a85d5fb12567ab88a7d934405a37',
  'zoom-camera-troubleshooting-during-a-meeting': 'f9f2d72a3b6192c3a9ec0b493c34fd0ed05ee0f6fb919a5091f229e047c02f9b',
  'zoom-error-unable-to-establish-secure-connection-to-zoom': 'cc5602d65a9862cbc19c0d70eefb8b426dedd2a7d5a72cfba84f2de011540e5a',
  'zoom-meeting-controls-icons': '48fd65a4293d5fdddab424280cecd42fe81a673d40b163f56ebf3d0b32ef4632',
}

const normalize = (text) => text.replace(/\s+/g, ' ').trim()
const hash = (text) => createHash('sha256').update(normalize(text)).digest('hex')

describe('source-backed process content', () => {
  it('matches all 27 approved source documents without omissions', () => {
    expect(PROCESSES).toHaveLength(27)
    expect(Object.keys(SOURCE_HASHES)).toHaveLength(27)
    for (const process of PROCESSES) expect(hash(process.text), process.id).toBe(SOURCE_HASHES[process.id])
  })
})
