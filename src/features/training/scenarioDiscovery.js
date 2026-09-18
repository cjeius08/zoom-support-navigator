function option(value, label) {
  return { value, label }
}

const O = option

function pending(config, answers) {
  const unanswered = config.questions.filter(question => !answers[question.id])
  if (!unanswered.length) return null
  return {
    state: 'collecting',
    title: unanswered.length === 1 ? 'One answer left' : 'Keep discovering',
    text: `Select ${unanswered.length === 1 ? 'the remaining answer' : `${unanswered.length} more answers`} to narrow the next approved step.`,
  }
}

function ready(title, text, route = null) {
  return { state: 'ready', title, text, route }
}

export const SCENARIO_DISCOVERY = {
  'cant-join': {
    questions: [
      { id: 'state', promptIndex: 0, options: [O('outside', 'Outside the meeting'), O('waiting-host', 'Waiting for host'), O('waiting-room', 'Waiting Room'), O('other', 'Another screen / error')] },
      { id: 'method', promptIndex: 1, options: [O('link', 'Invite link'), O('meeting-id', 'Meeting ID + passcode'), O('app', 'Zoom app'), O('browser', 'Browser')] },
      { id: 'message', promptIndex: 2, options: [O('invalid-id', 'Invalid Meeting ID'), O('passcode', 'Passcode problem'), O('no-error', 'No error message'), O('other', 'Another message')] },
    ],
    resolve(answers) {
      if (answers.state === 'waiting-host' || answers.state === 'waiting-room') {
        return ready('Switch to the waiting-entry path', 'The caller has already reached a Zoom waiting state. Stop treating this as a failed join and use the Waiting to Get In scenario.', 'waiting-entry')
      }
      if (answers.message === 'invalid-id') {
        return ready('Verify the meeting details', 'Re-check the Meeting ID exactly as provided. If Zoom still says it is invalid, the host or organizer must confirm or resend the correct meeting information.')
      }
      if (answers.method === 'link') {
        return ready('Try the meeting details directly', 'If the invitation link is not working, open Zoom Workplace or zoom.us/join and enter the Meeting ID and passcode exactly as provided.')
      }
      if (answers.method === 'browser') {
        return ready('Use the available supported browser path', 'Use Join from your browser only when Zoom offers it. If that option is unavailable, use the Zoom app or ask the organizer about the meeting setting.')
      }
      return null
    },
  },
  'waiting-entry': {
    questions: [
      { id: 'message', promptIndex: 0, options: [O('waiting-host', 'Waiting for host'), O('waiting-room', 'Waiting Room'), O('other', 'Different message')] },
      { id: 'role', promptIndex: 1, options: [O('participant', 'Participant'), O('host', 'Host')] },
      { id: 'time', promptIndex: 2, options: [O('matches', 'Date/time matches invite'), O('mismatch', 'Date/time does not match'), O('unsure', 'Not sure')] },
    ],
    resolve(answers) {
      if (answers.message === 'other') return ready('Reclassify the screen', 'This is not one of the two expected waiting states. Read the exact message and return to the appropriate join or error route.')
      if (answers.time === 'mismatch') return ready('Verify the invitation first', 'Confirm the caller is using the correct meeting invitation and scheduled time before troubleshooting anything else.')
      if (answers.message === 'waiting-room') return ready('Host admission controls the next step', 'The caller is already connected and waiting for the host or organizer to admit them. Basic support cannot admit participants.')
      if (answers.message === 'waiting-host') return ready('The host must start the session', answers.role === 'host' ? 'Confirm the host is signed in to the correct account and starting the intended scheduled meeting.' : 'The participant can wait or contact the host or organizer if the meeting should already be running.')
      return null
    },
  },
  'cant-hear': {
    questions: [
      { id: 'inside', promptIndex: 0, options: [O('yes', 'Inside the meeting'), O('no', 'Not inside yet')] },
      { id: 'audio', promptIndex: 1, options: [O('joined', 'Joined meeting audio'), O('not-joined', 'Shows Join Audio'), O('unsure', 'Not sure')] },
      { id: 'output', promptIndex: 2, options: [O('speaker', 'Device speaker'), O('wired', 'Wired headphones'), O('usb', 'USB audio'), O('bluetooth', 'Bluetooth')] },
    ],
    resolve(answers) {
      if (answers.inside === 'no') return ready('Fix joining first', 'Do not troubleshoot speaker output until the caller is actually inside the meeting.', 'cant-join')
      if (answers.audio === 'not-joined') return ready('Join meeting audio first', 'Use Join Audio and the internet-audio option shown on the device before changing speaker settings.')
      if (answers.output === 'bluetooth') return ready('Use the Bluetooth headset path', 'Confirm the headset is connected to this device, then verify Zoom is using it as the active speaker.', 'bluetooth-headset')
      if (answers.audio === 'joined') return ready('Test the selected speaker', 'Open Zoom Audio settings or the meeting audio-device menu, select the intended output, and run Test Speaker when available.')
      return null
    },
  },
  'cant-be-heard': {
    questions: [
      { id: 'inside', promptIndex: 0, options: [O('yes', 'Inside the meeting'), O('no', 'Not inside yet')] },
      { id: 'audio', promptIndex: 1, options: [O('joined', 'Joined meeting audio'), O('not-joined', 'Shows Join Audio'), O('unsure', 'Not sure')] },
      { id: 'muted', promptIndex: 2, options: [O('muted', 'Muted'), O('unmuted', 'Unmuted'), O('unsure', 'Not sure')] },
    ],
    resolve(answers) {
      if (answers.inside === 'no') return ready('Fix joining first', 'Do not troubleshoot microphone input until the caller is actually inside the meeting.', 'cant-join')
      if (answers.audio === 'not-joined') return ready('Join meeting audio first', 'Connect to meeting audio before testing or changing microphone settings.')
      if (answers.muted === 'muted') return ready('Unmute before deeper checks', 'Unmute in Zoom and also check any physical mute switch on the headset or microphone.')
      if (answers.muted === 'unmuted' && answers.audio === 'joined') return ready('Select and test the microphone', 'Use the arrow beside Mute/Unmute or Zoom Audio settings to choose the intended microphone and test whether Zoom detects the caller’s voice.')
      return null
    },
  },
  'camera-not-working': {
    questions: [
      { id: 'inside', promptIndex: 0, options: [O('yes', 'Inside the meeting'), O('no', 'Not inside yet')] },
      { id: 'video-state', promptIndex: 1, options: [O('start-video', 'Button says Start Video'), O('black', 'Video on but black / missing'), O('wrong', 'Wrong camera selected')] },
      { id: 'conflict', promptIndex: 2, options: [O('yes', 'Multiple cameras / another app'), O('no', 'No known conflict'), O('unsure', 'Not sure')] },
    ],
    resolve(answers) {
      if (answers.inside === 'no') return ready('Use the join/video-preview path first', 'Confirm the caller has reached the meeting or the approved pre-join video controls before troubleshooting an in-meeting camera symptom.')
      if (answers['video-state'] === 'start-video') return ready('Start video first', 'Select Start Video once. Only continue to camera troubleshooting if no usable image appears.')
      if (answers['video-state'] === 'wrong') return ready('Select the intended camera', 'Open the video-device choices or Video Settings and choose the camera the caller intends to use.')
      if (answers['video-state'] === 'black') return ready('Check camera access and conflicts', 'Confirm Zoom has camera permission and close another app that may already be using the camera. Do not bypass managed permissions.')
      return null
    },
  },
  'cant-share': {
    questions: [
      { id: 'meeting', promptIndex: 0, options: [O('inside', 'Inside the meeting'), O('not-inside', 'Not inside')] },
      { id: 'share-control', promptIndex: 1, options: [O('visible', 'Share is visible'), O('missing', 'Share is missing'), O('disabled', 'Share is disabled')] },
      { id: 'result', promptIndex: 2, options: [O('opens', 'Share picker opens'), O('blocked', 'Permission / host block'), O('system', 'OS/browser blocks capture')] },
    ],
    resolve(answers) {
      if (answers.meeting === 'not-inside') return ready('Join the meeting first', 'Screen sharing is an in-meeting control. Resolve meeting entry before troubleshooting Share.', 'cant-join')
      if (answers['share-control'] === 'disabled' || answers.result === 'blocked') return ready('Host permission may control sharing', 'Do not bypass participant-sharing restrictions. Ask the host or organizer to confirm whether participant sharing is allowed.')
      if (answers.result === 'system') return ready('Use the approved device permission path', 'Follow the operating-system or browser screen-capture permission path for the caller’s device. Do not change managed security policy.')
      if (answers['share-control'] === 'visible') return ready('Open Share and choose only the intended content', 'Select Share or Share Screen, then choose the exact screen, application, or window the caller intends to show.')
      return null
    },
  },
  'meeting-controls': {
    questions: [
      { id: 'device', promptIndex: 0, options: [O('desktop', 'Windows / Mac'), O('mobile', 'iPhone / Android'), O('browser', 'Browser')] },
      { id: 'role', promptIndex: 1, options: [O('participant', 'Participant'), O('host', 'Host / co-host'), O('unsure', 'Not sure')] },
      { id: 'state', promptIndex: 2, options: [O('hidden', 'Controls are hidden'), O('missing', 'Specific control is missing'), O('visible', 'Control is visible')] },
    ],
    resolve(answers) {
      if (answers.state === 'hidden') return ready('Reveal the controls first', answers.device === 'mobile' ? 'Tap the meeting screen to reveal the mobile controls, then check More when the control is not on the main toolbar.' : 'Move the pointer inside the meeting window to reveal the desktop controls.')
      if (answers.state === 'missing') return ready('Check role and meeting permissions', 'A missing control can depend on the caller’s role, host settings, account settings, or device. Do not try to bypass a permission boundary.')
      if (answers.state === 'visible') return ready('Open the visible control', 'Use the control that is already present and confirm the expected option appears.')
      return null
    },
  },
  chat: {
    questions: [
      { id: 'visible', promptIndex: 0, options: [O('yes', 'Chat is visible'), O('no', 'Chat is missing / disabled')] },
      { id: 'recipient', promptIndex: 1, options: [O('everyone', 'Everyone / group'), O('private', 'Specific person'), O('unsure', 'Not sure')] },
      { id: 'permission', promptIndex: 2, options: [O('allowed', 'Option is allowed'), O('disabled', 'Option is disabled'), O('unsure', 'Not sure')] },
    ],
    resolve(answers) {
      if (answers.visible === 'no' || answers.permission === 'disabled') return ready('Stop at the meeting permission boundary', 'If Chat or the requested chat type is disabled by the host or account administrator, basic support cannot enable it.')
      if (answers.visible === 'yes') return ready('Open Chat and verify the recipient', `Before sending, make sure the recipient is set to ${answers.recipient === 'private' ? 'the intended individual' : answers.recipient === 'everyone' ? 'the intended group or Everyone' : 'the intended recipient'}.`)
      return null
    },
  },
  reactions: {
    questions: [
      { id: 'visible', promptIndex: 0, options: [O('yes', 'Reactions visible'), O('no', 'Reactions not visible')] },
      { id: 'action', promptIndex: 1, options: [O('raise', 'Raise Hand'), O('reaction', 'Send a reaction'), O('lower', 'Lower Hand')] },
      { id: 'permission', promptIndex: 2, options: [O('allowed', 'Available'), O('disabled', 'Disabled / unavailable'), O('unsure', 'Not sure')] },
    ],
    resolve(answers) {
      if (answers.permission === 'disabled') return ready('Stop at the meeting permission boundary', 'If reactions are disabled by the host or account administrator, basic support should not try to bypass that setting.')
      if (answers.visible === 'no') return ready('Reveal the reactions menu', 'On mobile, check More when Reactions is not on the main controls. On desktop, reveal the meeting toolbar first.')
      if (answers.action === 'lower') return ready('Lower the active hand', 'Open Reactions and choose Lower Hand so the persistent raised-hand status is cleared.')
      if (answers.visible === 'yes') return ready('Use the intended reaction control', 'Open Reactions and select the caller’s intended reaction or Raise Hand.')
      return null
    },
  },
  'bluetooth-headset': {
    questions: [
      { id: 'connected', promptIndex: 0, options: [O('yes', 'Connected to this device'), O('no', 'Not connected / not sure')] },
      { id: 'symptom', promptIndex: 1, options: [O('hear', 'Can’t hear them'), O('mic', 'They can’t hear me'), O('both', 'Both')] },
      { id: 'device', promptIndex: 2, options: [O('windows', 'Windows'), O('mac', 'Mac'), O('iphone', 'iPhone / iPad'), O('android', 'Android')] },
    ],
    resolve(answers) {
      if (answers.connected === 'no') return ready('Connect the headset before changing Zoom', 'Pair and connect the Bluetooth headset to the same device running Zoom. If it is connected to another device too, disconnect that other connection while testing.')
      if (answers.device === 'iphone' || answers.device === 'android') return ready('Use the mobile Bluetooth audio path', 'Join meeting audio using the internet-audio option shown on the phone or tablet, then confirm the Bluetooth output is selected. Reconnect the headset in the meeting if the Bluetooth indicator is missing.')
      if (answers.symptom === 'hear') return ready('Select the headset as Zoom Speaker', 'On Windows or Mac, choose the Bluetooth headset under Speaker and run Test Speaker when available.')
      if (answers.symptom === 'mic') return ready('Select the headset as Zoom Microphone', 'On Windows or Mac, choose the Bluetooth headset under Microphone and test whether Zoom detects the caller’s voice.')
      if (answers.symptom === 'both') return ready('Select the headset for both Zoom audio paths', 'On Windows or Mac, choose the Bluetooth headset under both Speaker and Microphone, then test both directions before moving deeper.')
      return null
    },
  },
  'secure-connection': {
    questions: [
      { id: 'exact', promptIndex: 0, options: [O('yes', 'Exact secure-connection message'), O('no', 'Different message')] },
      { id: 'platform', promptIndex: 1, options: [O('mac', 'Mac'), O('other', 'Not a Mac')] },
      { id: 'opens', promptIndex: 2, options: [O('yes', 'App opens enough to update'), O('no', 'Cannot reach update controls')] },
    ],
    resolve(answers) {
      if (answers.exact === 'no' || answers.platform === 'other') return ready('Return to the general join/error route', 'This specialized route is only for the exact “Unable to establish secure connection to Zoom” message on macOS.', 'cant-join')
      if (answers.opens === 'yes') return ready('Update Zoom first', 'Follow the approved internal order: install the available Zoom update first, then test again before moving to the complete uninstall/reinstall path.')
      if (answers.opens === 'no') return ready('Use the approved macOS recovery path', 'Follow the approved complete uninstall/reinstall process for macOS, then restart and reinstall from Zoom’s official source.')
      return null
    },
  },
  'transfer-device': {
    questions: [
      { id: 'active', promptIndex: 0, options: [O('yes', 'Already in an active meeting'), O('no', 'Not in an active meeting')] },
      { id: 'account', promptIndex: 1, options: [O('same', 'Same Zoom account on both'), O('different', 'Different / not signed in')] },
      { id: 'target', promptIndex: 2, options: [O('personal', 'Another personal device'), O('room', 'Zoom Room')] },
    ],
    resolve(answers) {
      if (answers.active === 'no') return ready('Use the normal join path', 'The Switch workflow is for an active meeting or webinar. If the session is not active, join normally on the intended device.')
      if (answers.account === 'different') return ready('Sign in to the same Zoom account first', 'The standard device-transfer path requires the same Zoom account on both devices.')
      if (answers.target === 'room') return ready('Open the full Zoom Room transfer process', 'Zoom Room transfer and pairing uses a different approved path. Do not improvise from the personal-device Switch workflow.')
      if (answers.active === 'yes' && answers.account === 'same') return ready('Look for Switch on the second device', 'Open the in-progress meeting on the second device. If transfer is available, Zoom shows Switch instead of the normal Join or Start action.')
      return null
    },
  },
  'join-muted': {
    questions: [
      { id: 'goal', promptIndex: 0, options: [O('muted', 'Connected to audio, but muted'), O('no-audio', 'Do not connect to Zoom audio')] },
      { id: 'scope', promptIndex: 1, options: [O('one', 'Only the next meeting'), O('future', 'Default for future meetings')] },
      { id: 'device', promptIndex: 2, options: [O('desktop', 'Windows / Mac'), O('mobile', 'iPhone / Android'), O('browser', 'Browser')] },
    ],
    resolve(answers) {
      if (answers.device === 'browser') return ready('Do not apply app-only setting labels', 'This route’s saved mute-on-join settings are for the Zoom apps. Use the controls actually offered by the browser join experience.')
      if (answers.goal === 'no-audio') return ready('Use Don’t connect to audio for this join', 'This prevents the Zoom audio connection and is different from simply joining muted.')
      if (answers.goal === 'muted' && answers.scope === 'future') return ready('Enable the mute-on-join preference', answers.device === 'mobile' ? 'Open Zoom mobile Settings → Meetings and enable the mute-on-join option shown on that device.' : 'In the desktop app, open Settings → Meetings & webinars and enable Keep my microphone muted.')
      if (answers.goal === 'muted' && answers.scope === 'one') return ready('Use the one-meeting mute choice', 'Keep the microphone muted on the join screen or immediately on entry without changing the caller’s saved default.')
      return null
    },
  },
  'join-video-preference': {
    questions: [
      { id: 'scope', promptIndex: 0, options: [O('one', 'Only the next meeting'), O('future', 'Default for future meetings')] },
      { id: 'state', promptIndex: 1, options: [O('off', 'Camera off'), O('on', 'Camera on')] },
      { id: 'device', promptIndex: 2, options: [O('desktop', 'Windows / Mac'), O('mobile', 'iPhone / Android'), O('browser', 'Browser')] },
    ],
    resolve(answers) {
      if (answers.device === 'browser') return ready('Use the browser join controls only', 'Do not apply Zoom-app setting labels to a Browser caller. Use the video choice actually shown before joining.')
      if (answers.scope === 'one') return ready('Use the pre-join video choice', `For this meeting only, set video ${answers.state === 'off' ? 'off' : 'on'} on the join screen instead of changing the saved default.`)
      if (answers.scope === 'future' && answers.state === 'off') return ready('Enable the default camera-off preference', 'Use the approved Zoom join setting that keeps the camera off when joining future meetings.')
      if (answers.scope === 'future' && answers.state === 'on') return ready('Leave the camera-off default disabled', 'Keep the saved camera-off preference disabled, then confirm the preview or join screen shows the intended video state.')
      return null
    },
  },
  'meeting-volume': {
    questions: [
      { id: 'scope', promptIndex: 0, options: [O('whole', 'Whole meeting'), O('one-person', 'Only one participant')] },
      { id: 'platform', promptIndex: 1, options: [O('desktop', 'Windows / Mac'), O('mobile', 'iPhone / Android'), O('browser', 'Browser')] },
      { id: 'control', promptIndex: 2, options: [O('zoom-only', 'Change Zoom only'), O('device', 'Change whole device volume')] },
    ],
    resolve(answers) {
      if (answers.scope === 'one-person') return ready('Do not use the meeting-volume path', 'Zoom does not provide per-participant playback volume. A single quiet or loud participant may need microphone troubleshooting.')
      if (answers.platform === 'mobile') return ready('Use the device volume controls', 'On iPhone or Android, adjust the meeting volume with the device’s physical or system volume controls.')
      if (answers.platform === 'browser') return ready('Use the browser/device output controls', 'Do not apply desktop Zoom Audio Settings instructions to the browser.')
      if (answers.control === 'zoom-only') return ready('Adjust Zoom speaker volume', 'On desktop, open Zoom Settings → Audio and adjust Speaker volume. On Windows, Volume Mixer can adjust Zoom separately from other apps when needed.')
      return ready('Adjust the device volume', 'Use the computer’s normal system volume control when the caller wants all audio on the device louder or quieter.')
    },
  },
  'auto-computer-audio': {
    questions: [
      { id: 'platform', promptIndex: 0, options: [O('windows', 'Windows'), O('mac', 'Mac'), O('other', 'iPhone / Android / Browser')] },
      { id: 'same-audio', promptIndex: 1, options: [O('yes', 'Usually same computer audio'), O('no', 'Needs different audio methods')] },
      { id: 'alternate', promptIndex: 2, options: [O('never', 'Rarely / never needs telephone audio'), O('sometimes', 'Sometimes needs another audio type')] },
    ],
    resolve(answers) {
      if (answers.platform === 'other') return ready('Do not apply the desktop setting', 'Automatically connect to computer audio is an approved desktop-app path for Windows and Mac.')
      if (answers['same-audio'] === 'no' || answers.alternate === 'sometimes') return ready('Leave automatic connection off', 'If the caller regularly needs another audio method, keep the setting off so Zoom can continue offering the available choices.')
      if (answers['same-audio'] === 'yes') return ready('Enable Automatically connect to computer audio', 'Open the desktop Join experience settings and enable the option, then test with the next eligible meeting.')
      return null
    },
  },
  'multiple-audio-input-channels': {
    questions: [
      { id: 'platform', promptIndex: 0, options: [O('windows', 'Windows'), O('mac', 'Mac'), O('other', 'iPhone / Android / Browser')] },
      { id: 'recognized', promptIndex: 1, options: [O('yes', 'Interface recognized by OS'), O('no', 'Interface not recognized')] },
      { id: 'channels', promptIndex: 2, options: [O('three-plus', '3 or more input channels'), O('under-three', 'Fewer than 3'), O('unsure', 'Not sure')] },
    ],
    resolve(answers) {
      if (answers.platform === 'other') return ready('Use a supported desktop platform', 'Specific audio input channels is supported by the Zoom desktop app on Windows and Mac.')
      if (answers.recognized === 'no') return ready('Fix device recognition first', 'If the operating system does not recognize the audio interface, hardware or driver support is the next step—not Zoom channel selection.')
      if (answers.channels === 'under-three') return ready('The channel selector will not appear', 'Zoom exposes the specific input-channel controls only when the selected device provides at least three input channels.')
      if (answers.channels === 'three-plus') return ready('Select channels and Save', 'In Zoom Audio settings, select the interface, enable the specific input-channel option, choose one or more channels, then Save before testing.')
      return null
    },
  },
  'participants-before-join': {
    questions: [
      { id: 'scheduled', promptIndex: 0, options: [O('yes', 'Scheduled meeting before joining'), O('no', 'Different situation')] },
      { id: 'calendar', promptIndex: 1, options: [O('yes', 'Desktop + Zoom Calendar enabled'), O('no', 'No Zoom Calendar / not desktop')] },
      { id: 'eligibility', promptIndex: 2, options: [O('yes', 'Eligible account + calendar integration'), O('no', 'Requirement missing'), O('unsure', 'Not sure')] },
    ],
    resolve(answers) {
      if (answers.scheduled === 'no') return ready('Use the in-meeting Participants path instead', 'This specialized route is for viewing eligible scheduled-meeting participants before joining.')
      if (answers.calendar === 'no' || answers.eligibility === 'no') return ready('A required feature condition is missing', 'Do not assume the meeting is empty. The pre-join participant view depends on the supported desktop account and calendar setup.')
      if (answers.calendar === 'yes' && answers.eligibility === 'yes') return ready('Check Home or Calendar', 'Open the scheduled meeting from Zoom Home or Calendar and review the participant or invitee information Zoom shows before joining.')
      return null
    },
  },
  invite: {
    questions: [
      { id: 'context', promptIndex: 0, options: [O('active', 'Meeting already in progress'), O('scheduled', 'Scheduled meeting details')] },
      { id: 'device', promptIndex: 1, options: [O('desktop', 'Desktop app'), O('mobile', 'Mobile app'), O('web', 'Zoom Web App')] },
      { id: 'need', promptIndex: 2, options: [O('link', 'Join link only'), O('full', 'Full invitation text')] },
    ],
    resolve(answers) {
      if (answers.context === 'active') return ready('Open Participants → Invite', `Use the current meeting’s Invite control, then choose ${answers.need === 'full' ? 'Copy invitation' : 'Copy invite link'} when shown. Do not alter the meeting details.`)
      if (answers.context === 'scheduled') return ready('Copy the scheduled meeting details', `Open the scheduled meeting details and copy the ${answers.need === 'full' ? 'full invitation' : 'join link'} exactly as Zoom provides it.`)
      return null
    },
  },
}

export function getScenarioDiscovery(scenarioId, route, answers = {}) {
  const config = SCENARIO_DISCOVERY[scenarioId]
  if (!config) return null

  const questions = config.questions.map(question => ({
    ...question,
    prompt: route?.confirm?.[question.promptIndex] || 'Confirm this detail with the caller.',
  }))

  const direct = config.resolve?.(answers) || null
  return {
    questions,
    recommendation: direct || pending(config, answers) || ready('Use the approved first action', route?.checks?.[0]?.instruction || 'Continue with the linked Common Issue route.'),
  }
}
