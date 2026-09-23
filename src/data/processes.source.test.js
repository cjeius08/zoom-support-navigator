import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { cwd } from 'node:process'
import { describe, expect, it } from 'vitest'
import { PROCESSES } from './processes'

const SOURCE_HASHES = {
  'troubleshooting-when-you-cant-join-a-zoom-meeting': '10a83fc40a6a75f1c57de38f7c1203795adbd4f2441501e95c83163e82d9009f',
  'adjusting-the-volume-of-a-zoom-meeting': '0137a7233cae3468c47e7798379e01a9e731576eca1346d40d723e225710926c',
  'automatically-joining-meetings-with-computer-audio': 'd427d9bed221d9492b4d6138c82c39341d2218289e81f5b945a0ca6ba2df8ec6',
  'chatting-in-a-zoom-meeting': 'cbc538ec8a8e438ed81f56b5b9b858251c3b486f25585f5440234c0031cd2efa',
  'enabling-and-managing-multiple-audio-input-channels-in-zoom': '2969bacb85bf3d2c17f73a6e33e5ec27315c82af0e6fad8d538e5dbba52f85c0',
  'joining-a-zoom-meeting': '5b92faf92dfa8100efe652457e4addf9f588aa41194163506adfd5dbf4fb846c',
  'locate-describe-guide-confirm': '95914ed268a4716a83a8939720db642a3cd35e4551c3d44e7cebfa000eed278b',
  'muting-your-microphone-when-joining-a-zoom-meeting': 'a82beaa3f9e120015b97d3850c2f386ee7052e02e774b73d4c134ade850f593d',
  'setting-your-video-to-stay-on-or-off-when-joining-meetings-and-webinars': '1373469beb217e05f0a529cfd728f388b2e58a8e3120c14699206591462d808a',
  'sharing-your-screen-desktop-or-content-in-zoom': '1cc4edf5f961636d9559840ace05c4267cbe872ece56da3ea9d2d95df3143575',
  'showing-and-hiding-your-video-in-a-zoom-meeting': '8bd70caf7d2499fb6aba60c322f2153053cfac1c42091c1d75f82fd891cfc405',
  'testing-your-audio-settings-for-zoom-meetings': '29b06af9dd57fafe0a4a883e354cee363d8cb7e5ec1dec72fd1e58e6fa40d3d1',
  'testing-your-video-in-zoom': '52b04a35a5aa5ab1c2ecbcc936982ca807415d829ba5251a1b199a4520d9df7e',
  'transferring-meetings-and-webinars-between-devices': '609d135cd08a8a1eddbef0ddac666f893b1fcc0e073f11830b9ff757261fc62d',
  'troubleshooting-speaker-or-microphone-issues-in-the-zoom-desktop-app': '3f4af6ea133c3b4c155fa3ad2cd4885874cb8680e02207eab36428212cd2fcdb',
  'troubleshooting-speaker-or-microphone-issues-on-a-mobile-device': 'd1ee93551034ee474adca5ea87dd3b5222c78b30e909904aa754928dd45efd49',
  'uninstalling-and-reinstalling-the-zoom-application': '16030f7ead00f3d7af89cbdb9d63293467c799108554ed0dde1ef95f9b19d73a',
  'using-bluetooth-headphones-with-zoom-on-android-ios': '6b1a6ae6918ed193cae51f6325699f90616e2b9d4d6eec8777d0bbf3e279aaee',
  'using-non-verbal-feedback-and-meeting-reactions': 'd3d16d2288d2d6a50a9bcc95754fb362719cdca187273c3d378cac1af51ec150',
  'using-participant-controls-in-a-zoom-meeting': '98efb5e70c8408e30b6002afe85d7da50d4807af04769ff5ac1ac497193d7300',
  'viewing-participants-already-in-a-meeting-before-joining': 'c46aea88a7a72703a629305c16f7b4c3d21ebddde435d8593c3a21c03c6c2283',
  'waiting-for-the-host-to-start-a-meeting-or-webinar': '34433047c4cebd31631a01ef7c2369a585e946835fc11cc8c139d742936dfa52',
  'zoom-audio-troubleshooting': '5f133dd2a42540e7855f83c68899959594fbf913211fac1a16ec60f60c81613b',
  'zoom-basic-support-boundaries-decision-path-referral-process': '5ebf1b6249da96f0e2882ccc3604cffc74591c07217115bfd722a17962d2b4b2',
  'zoom-camera-troubleshooting-during-a-meeting': '9b5358eb8fc05d9f0ce36cd0f498ee7f852a59446a4d4b7f465b222c57414c20',
  'zoom-error-unable-to-establish-secure-connection-to-zoom': '0d12daef7685ef67e108385d25a29e7f4e2ca2ce6397cd119347cd08118db2af',
  'zoom-meeting-controls-icons': '8470bd5fd2098e70c6a80ba208c2ae79250e7a6c261e2582be3176ea30b03c8b',
}

const normalize = (text) => text.replace(/\s+/g, ' ').trim()
const hash = (text) => createHash('sha256').update(normalize(text)).digest('hex')

describe('source-backed process content', () => {
  it('matches the complete content of all 27 approved source documents', () => {
    expect(PROCESSES).toHaveLength(27)
    expect(Object.keys(SOURCE_HASHES)).toHaveLength(27)
    for (const process of PROCESSES) expect(hash(process.sourceText ?? process.text), process.id).toBe(SOURCE_HASHES[process.id])
  })

  it('keeps source-page assets in document order and available to the viewer', () => {
    for (const process of PROCESSES) {
      const pages = process.images ?? []
      expect(pages.length, process.id).toBeGreaterThan(0)
      const pageNumbers = pages.map(image => Number(image.match(/-page-(\d+)\.png$/)?.[1]))
      expect(pageNumbers, process.id).toEqual(pages.map((_, index) => index + 1))
      for (const image of pages) {
        expect(existsSync(resolve(cwd(), 'public', image)), `${process.id}: ${image}`).toBe(true)
      }
    }
  })
})
