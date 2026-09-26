import { HOST_ROADBLOCKS } from './arbitratorHostSupport'

const CATEGORY_ROADBLOCKS = {
  join: [
    ['roadblock-meeting-details', 'The remaining problem may be the meeting link, ID, passcode, date, or time rather than the Zoom app itself.'],
    ['roadblock-unable-to-join', 'All approved joining checks may be complete, but the arbitrator still cannot enter the hearing.'],
    ['roadblock-account-permission', 'The remaining step may require account, sign-in, license, role, or locked account-level access.'],
    ['roadblock-network-security', 'The join failure may now depend on internet, VPN, firewall, proxy, or another network/security restriction outside approved basic checks.'],
  ],
  audio: [
    ['roadblock-device-hardware', 'The microphone, speaker, headset, or other audio device may not be recognized by the device or operating system itself.'],
    ['roadblock-managed-permission', 'Zoom may be blocked by a device-level or managed microphone/audio permission that Tier 1 must not bypass.'],
    ['roadblock-zoom-product', 'The approved Zoom audio checks may be exhausted while the device is recognized and permissions are available.'],
  ],
  video: [
    ['roadblock-device-hardware', 'The camera may not be recognized by the device or operating system itself after the approved basic checks.'],
    ['roadblock-managed-permission', 'Zoom may be blocked by a device-level or managed camera permission that Tier 1 must not bypass.'],
    ['roadblock-zoom-product', 'The camera is recognized and allowed, but the issue may remain after the approved Zoom video checks.'],
  ],
  controls: [
    ['roadblock-host-controlled-feature', 'The requested meeting control may depend on a host-controlled meeting permission or feature.'],
    ['roadblock-account-permission', 'The control may be unavailable because of role, license, sign-in, or a locked account-level setting.'],
    ['roadblock-zoom-product', 'The expected control should be available for the current role/platform, but it still does not work after approved checks.'],
  ],
  sharing: [
    ['roadblock-host-controlled-feature', 'Screen sharing may be limited by the current meeting-level host sharing permission.'],
    ['roadblock-managed-permission', 'The operating system or managed device may be blocking screen-recording or screen-sharing permission.'],
    ['roadblock-account-permission', 'The remaining limitation may be a locked account-level sharing setting that Tier 1 must not bypass.'],
  ],
  devices: [
    ['roadblock-device-hardware', 'The remaining issue may be with the device or hardware itself rather than Zoom.'],
    ['roadblock-managed-permission', 'A managed-device permission or security restriction may be blocking the approved action.'],
    ['roadblock-zoom-product', 'The approved device/app troubleshooting may be complete and the remaining behavior may be a Zoom product limitation or issue.'],
  ],
  support: [
    ['roadblock-account-permission', 'The remaining action may require account, role, license, administrator, or locked-setting access.'],
    ['roadblock-network-security', 'The remaining action may require advanced network, VPN, firewall, or security changes outside Tier 1.'],
    ['roadblock-zoom-product', 'All approved basic troubleshooting may be exhausted with the issue still unresolved.'],
  ],
}

const ROUTE_OVERRIDES = {
  'cant-join': CATEGORY_ROADBLOCKS.join,
  'waiting-entry': [
    ['roadblock-host-controlled-feature', 'The waiting state may now require a meeting-level host action such as starting the hearing or admitting the participant.'],
    ['roadblock-meeting-details', 'The displayed meeting date, time, link, ID, or passcode may need verification outside Tier 1.'],
    ['roadblock-account-permission', 'The arbitrator may be signed in under the wrong account or the remaining action may require locked account-level access.'],
  ],
  'cant-hear': CATEGORY_ROADBLOCKS.audio,
  'cant-be-heard': [
    ['roadblock-device-hardware', 'The microphone may not be recognized by the device or operating system itself.'],
    ['roadblock-managed-permission', 'A device-level microphone permission may be blocking Zoom.'],
    ['roadblock-host-controlled-feature', 'If the caller is participating rather than hosting, the meeting host may be controlling whether the participant can unmute.'],
    ['roadblock-zoom-product', 'Zoom detects the microphone and approved checks are complete, but the issue remains.'],
  ],
  'camera-not-working': CATEGORY_ROADBLOCKS.video,
  'cant-share': CATEGORY_ROADBLOCKS.sharing,
  chat: [
    ['roadblock-host-controlled-feature', 'The host may have limited who participants can chat with during this meeting.'],
    ['roadblock-account-permission', 'The remaining issue may be a locked account-level chat setting or role limitation.'],
    ['roadblock-zoom-product', 'The expected chat control should be available, but it remains unavailable after the approved checks.'],
  ],
  'meeting-controls': CATEGORY_ROADBLOCKS.controls,
  reactions: [
    ['roadblock-account-permission', 'Meeting reactions may be disabled by an account/admin setting or unavailable for the current configuration.'],
    ['roadblock-zoom-product', 'The expected reactions control remains unavailable after the approved meeting-control checks.'],
  ],
  invite: [
    ['roadblock-meeting-details', 'The request may require changing or independently validating meeting details rather than simply using Zoom’s existing invite controls.'],
    ['roadblock-account-permission', 'The invite option may depend on role, account, calendar/contact integration, or another locked setting.'],
  ],
  'secure-connection': [
    ['roadblock-network-security', 'The secure-connection error may now require firewall, VPN, proxy, security, or network changes outside approved basic checks.'],
    ['roadblock-managed-permission', 'A managed-device or security restriction may block the approved recovery path.'],
    ['roadblock-zoom-product', 'The official Zoom recovery steps are complete and the known product issue may still remain.'],
  ],
  'bluetooth-headset': [
    ['roadblock-device-hardware', 'The headset may not be connected to or recognized by the device itself.'],
    ['roadblock-managed-permission', 'A device-level Bluetooth or nearby-device permission may be blocking Zoom.'],
    ['roadblock-zoom-product', 'The headset is recognized and selected, but Zoom behavior remains unresolved after approved checks.'],
  ],
  'transfer-device': [
    ['roadblock-account-permission', 'Transfer may be unavailable because the devices are not signed in to the same account or the feature is restricted by account settings.'],
    ['roadblock-zoom-product', 'The official transfer requirements are met but the Switch/transfer behavior remains unavailable.'],
  ],
  'join-muted': [
    ['roadblock-account-permission', 'The expected join-audio preference may be unavailable or locked by account/admin settings.'],
  ],
  'join-video-preference': [
    ['roadblock-account-permission', 'The expected video-join preference may be unavailable or locked by account/admin settings.'],
  ],
  'meeting-volume': [
    ['roadblock-device-hardware', 'The remaining sound problem may be at the device speaker/headphone level rather than the Zoom meeting-volume control.'],
    ['roadblock-zoom-product', 'The Zoom volume controls are available and the device output is recognized, but the issue remains after approved checks.'],
  ],
  'auto-computer-audio': [
    ['roadblock-account-permission', 'Zoom states this setting may be disabled by an administrator, which makes it a locked setting rather than a Tier 1 workaround.'],
  ],
  'multiple-audio-input-channels': [
    ['roadblock-device-hardware', 'Zoom only exposes specific audio input channels when the selected device is recognized and has at least three detected input channels.'],
    ['roadblock-account-permission', 'The required audio setting may be unavailable because of an account/admin restriction.'],
    ['roadblock-zoom-product', 'The hardware meets the documented requirements but Zoom still does not expose or apply the expected channel behavior.'],
  ],
  'participants-before-join': [
    ['roadblock-account-permission', 'The pre-join participant view depends on an eligible account plus Zoom Calendar and calendar integration; missing eligibility or configuration is not a basic meeting-control fix.'],
    ['roadblock-zoom-product', 'The documented requirements are met but the participant preview still does not appear.'],
  ],
}

function roadblockById(id) {
  return HOST_ROADBLOCKS.find(item => item.id === id) || null
}

export function possibleRoadblocksForProcess(process, { sourceRouteId = null } = {}) {
  const candidates = ROUTE_OVERRIDES[sourceRouteId] || CATEGORY_ROADBLOCKS[process?.category] || CATEGORY_ROADBLOCKS.support

  return candidates
    .map(([id, why]) => {
      const roadblock = roadblockById(id)
      if (!roadblock) return null
      return {
        id,
        title: roadblock.title,
        why,
        agentBoundary: roadblock.agentBoundary,
        nextAction: roadblock.nextAction,
      }
    })
    .filter(Boolean)
}
