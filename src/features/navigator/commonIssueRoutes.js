import { searchProcesses } from './smartSearch'

export const COMMON_ISSUE_ROUTES = [
  {
    id: 'cant-join',
    group: 'JOIN & ACCESS',
    categoryId: 'join',
    title: 'Can’t join the meeting',
    subtitle: 'Link, Meeting ID/passcode, browser, or app entry',
    classification: 'Joining / access symptom',
    classificationNote: 'Confirm the exact screen state before troubleshooting. A Waiting for host screen or Waiting Room is a different route, not a failed join.',
    searchPhrases: [
      'cant join',
      'cannot join meeting',
      'cant jion',
      'meeting link not working',
      'invalid meeting id',
      'meeting id invalid',
      'passcode not working',
      'join from browser',
      'link wont let me in',
    ],
    confirm: [
      'Are they outside the meeting, or do they already see a Zoom waiting screen?',
      'Are they using the invite link, a Meeting ID/passcode, the Zoom Workplace app, or a browser?',
      'What exact message is on the screen? Read it back before choosing the next step.',
    ],
    redirectNotes: [
      { label: 'Waiting for host / Waiting Room', routeId: 'waiting-entry', note: 'If the screen says either of these, stop the join-failure path and identify the exact waiting state.' },
    ],
    checks: [
      {
        title: 'Try the approved meeting details directly',
        instruction: 'If the invite link is not working, open Zoom Workplace or join.zoom.us and enter the Meeting ID exactly as provided by the host/organizer. Enter the passcode if prompted.',
        expected: 'Zoom accepts the meeting details and moves the participant into the meeting or an expected waiting state.',
      },
      {
        title: 'If Zoom says the Meeting ID is invalid',
        instruction: 'Re-check the digits exactly as provided. If Zoom still reports the Meeting ID as invalid, the host/organizer must confirm or resend the correct meeting information. Do not guess or modify the Meeting ID.',
        expected: 'The meeting details are either accepted or confirmed as needing organizer correction.',
      },
      {
        title: 'If they want to join from a browser',
        instruction: 'The Join from your browser link is controlled by the host’s setting. If the link is not offered, use the Zoom Workplace app or have the participant contact the host/organizer about the meeting option.',
        expected: 'The participant uses an available supported join method without changing meeting-owner settings.',
      },
    ],
    success: 'The participant reaches the meeting, Waiting Room, or Waiting for host screen using the correct meeting information.',
    unresolved: 'If approved joining checks are complete and the participant still cannot enter, open the approved troubleshooting process. Stop and refer when the remaining issue requires host/meeting access, managed device permission, network/security changes, or organization-level access.',
    script: '“Let’s first confirm exactly where Zoom is stopping you. I’ll use the message on your screen to choose the correct joining path.”',
    processIds: [
      'troubleshooting-when-you-cant-join-a-zoom-meeting',
      'joining-a-zoom-meeting',
      'zoom-basic-support-boundaries-decision-path-referral-process',
    ],
    primarySource: {
      title: 'Joining a Zoom meeting',
      url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0060732',
    },
    supportingSources: [
      {
        title: 'Troubleshooting when you can’t join a Zoom meeting',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0068749',
      },
      {
        title: 'Troubleshooting invalid Zoom meeting ID',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0068841',
      },
      {
        title: 'Joining a Zoom meeting without an account',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0059553',
      },
    ],
    discrepancy: 'The approved “Can’t Join” Process Document lists reinstall early in its sequence. The training instructions separately state that uninstall/reinstall is not the first solution. OGCon therefore keeps reinstall out of this fast route and leaves it in the full approved process pending document review.',
    visuals: [
      {
        title: 'Zoom Home control',
        src: 'https://assets.zoom.us/generic-images/common-buttons-and-icons/outline/home-button.png',
        alt: 'Official Zoom Home icon',
        note: 'Official Zoom asset referenced by the current Joining a Zoom meeting article.',
      },
    ],
  },
  {
    id: 'cant-hear',
    group: 'AUDIO',
    categoryId: 'audio',
    title: 'I can’t hear anyone',
    subtitle: 'Speaker / audio-output path',
    classification: 'Audio-output symptom',
    classificationNote: 'Treat this as an audio-output symptom first—not a connection diagnosis. If they are inside the meeting and the meeting itself is stable, stay on the speaker/audio path.',
    searchPhrases: [
      'i cant hear anyone',
      'i cant hear you',
      'cant hear them',
      'cant hear anybody',
      'no sound',
      'speaker not working',
      'audio output',
      'cant hear zoom',
    ],
    confirm: [
      'Are they already inside the meeting and able to see the meeting interface or other participants?',
      'Do they see Join Audio, or are they already connected to meeting audio?',
      'Are they using the device speaker, wired headphones, USB audio, or Bluetooth?',
    ],
    redirectNotes: [
      { label: 'Can’t join the meeting', routeId: 'cant-join', note: 'If they are not actually inside the meeting, troubleshoot joining first.' },
    ],
    checks: [
      {
        title: 'Confirm they joined meeting audio',
        instruction: 'If Zoom is showing Join Audio, connect to meeting audio first. On mobile, Zoom may offer WiFi or Cellular Data for internet audio.',
        expected: 'The meeting shows the normal microphone/audio control instead of an unjoined-audio state.',
      },
      {
        title: 'Check the speaker or headphones',
        instruction: 'Make sure the speaker/headphones are connected, not muted, and the device volume is turned up. If using Bluetooth, confirm the headset is connected to the same device running Zoom.',
        expected: 'The correct output device is active and audible at the device level.',
      },
      {
        title: 'Test and select the Zoom speaker',
        instruction: 'On the desktop app, open Settings → Audio to test the speaker and select the correct output device. During a meeting, the arrow beside Mute/Unmute can also be used to change the speaker.',
        expected: 'They hear Zoom’s test sound or can hear the meeting through the selected speaker.',
      },
    ],
    success: 'The participant hears Zoom’s test sound or can hear other participants normally.',
    unresolved: 'If the meeting itself is reconnecting, dropping, or not loading, stop treating this as an audio-only symptom. If the meeting is stable but there is still no sound, continue with the approved Zoom Audio Troubleshooting process.',
    script: '“Since you’re already in the meeting, let’s check the audio path first. We’ll make sure Zoom is connected to the correct speaker before we look anywhere else.”',
    processIds: [
      'zoom-audio-troubleshooting',
      'testing-your-audio-settings-for-zoom-meetings',
      'troubleshooting-speaker-or-microphone-issues-in-the-zoom-desktop-app',
      'troubleshooting-speaker-or-microphone-issues-on-a-mobile-device',
    ],
    primarySource: {
      title: 'Troubleshooting speaker or microphone issues in the desktop app',
      url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0060836',
    },
    supportingSources: [
      {
        title: 'Testing your audio settings for Zoom meetings',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062765',
      },
      {
        title: 'Troubleshooting speaker or microphone issues on your mobile device',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0066222',
      },
    ],
    visuals: [
      {
        title: 'Audio-device menu indicator',
        src: 'https://assets.zoom.us/generic-images/common-buttons-and-icons/outline/up-arrow-button.png',
        alt: 'Official Zoom upward arrow icon beside the audio control',
        note: 'Official Zoom asset used in the current desktop audio troubleshooting article.',
      },
    ],
  },
  {
    id: 'cant-be-heard',
    group: 'AUDIO',
    categoryId: 'audio',
    title: 'They can’t hear me',
    subtitle: 'Microphone / audio-input path',
    classification: 'Microphone / audio-input symptom',
    classificationNote: 'Do not treat this as a speaker problem or a connection problem unless the meeting itself is unstable. First confirm mute state, selected microphone, and microphone access.',
    searchPhrases: [
      'they cant hear me',
      'nobody can hear me',
      'people cant hear me',
      'mic not working',
      'microphone not working',
      'my mic doesnt work',
      'cannot be heard',
    ],
    confirm: [
      'Are they already inside the meeting?',
      'Do they see Join Audio, or are they already connected to meeting audio?',
      'Does the Zoom microphone control show that they are muted?',
      'Are they using the built-in microphone, a headset, USB microphone, or Bluetooth?',
    ],
    checks: [
      {
        title: 'Check Zoom mute and any physical mute switch',
        instruction: 'Unmute in Zoom if muted. Also check the headset or microphone for a physical mute button or switch. If Zoom will not allow the participant to unmute, the host may need to allow or unmute them; the support agent cannot override host controls.',
        expected: 'Zoom shows the microphone as unmuted and the physical device is not muted.',
      },
      {
        title: 'Confirm the participant joined meeting audio',
        instruction: 'If Zoom is showing Join Audio, connect to meeting audio before testing the microphone. On current Zoom mobile guidance, internet audio is shown as Wifi or Cellular Data.',
        expected: 'The meeting shows the normal microphone/audio control and Zoom is connected to meeting audio.',
      },
      {
        title: 'Select and test the correct microphone',
        instruction: 'On the desktop app, use the arrow beside Mute/Unmute or Settings → Audio to select the intended microphone and test it.',
        expected: 'Zoom detects the voice during the microphone test or playback.',
      },
      {
        title: 'Check microphone permission when Zoom cannot detect it',
        instruction: 'If the microphone does not appear or Zoom cannot access it, confirm that the operating system allows microphone access for Zoom. Do not bypass organization-managed permissions.',
        expected: 'Zoom is allowed to use a microphone that the device itself recognizes.',
      },
    ],
    success: 'Zoom detects microphone input and the other participants can hear the caller.',
    unresolved: 'If the device or operating system itself does not recognize the microphone after basic connection checks, stop Zoom-only troubleshooting and refer to the appropriate IT/device support contact. If Zoom detects the microphone but the issue remains, continue the approved microphone troubleshooting process.',
    script: '“Let’s check the microphone side first. We’ll confirm you’re unmuted, then make sure Zoom is listening to the correct microphone.”',
    processIds: [
      'troubleshooting-speaker-or-microphone-issues-in-the-zoom-desktop-app',
      'troubleshooting-speaker-or-microphone-issues-on-a-mobile-device',
      'zoom-audio-troubleshooting',
      'zoom-basic-support-boundaries-decision-path-referral-process',
    ],
    primarySource: {
      title: 'Troubleshooting speaker or microphone issues in the desktop app',
      url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0060836',
    },
    supportingSources: [
      {
        title: 'Troubleshooting speaker or microphone issues on your mobile device',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0066222',
      },
      {
        title: 'Testing your audio settings for Zoom meetings',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062765',
      },
    ],
    discrepancy: 'The approved mobile microphone Process Document uses the older wording “Call Over Internet.” Current official Zoom Support uses “Wifi or Cellular Data” for internet audio on mobile. OGCon shows the current Zoom wording while keeping the approved source unchanged and flags this difference for document review.',
    visuals: [
      {
        title: 'Muted microphone control',
        src: 'https://assets.zoom.us/generic-images/common-buttons-and-icons/filled/audio-off-button.png',
        alt: 'Official Zoom muted microphone icon',
        note: 'Official Zoom asset referenced by the current desktop audio troubleshooting article.',
      },
      {
        title: 'Open audio-device choices',
        src: 'https://assets.zoom.us/generic-images/common-buttons-and-icons/outline/up-arrow-button.png',
        alt: 'Official Zoom upward arrow icon beside Mute or Unmute',
        note: 'Use the arrow beside Mute/Unmute to change the microphone or speaker during a desktop meeting.',
      },
    ],
  },
  {
    id: 'camera-not-working',
    group: 'VIDEO',
    categoryId: 'video',
    title: 'My camera isn’t working',
    subtitle: 'Video off, black, or wrong camera',
    classification: 'Camera / video symptom',
    classificationNote: 'First distinguish “video is simply off” from “Zoom is trying to use a camera but no usable image appears.” Do not assume a network problem from a camera-only symptom.',
    searchPhrases: [
      'camera not working',
      'camra not working',
      'camera black',
      'black camera',
      'video not showing',
      'my video is black',
      'cant see my camera',
    ],
    confirm: [
      'Are they already inside the meeting and can they see the Zoom meeting controls?',
      'Does the control say Start Video, or is video already on but the image is black/missing?',
      'Does the device have more than one camera or another app using the camera?',
    ],
    checks: [
      {
        title: 'If video is simply off, start it',
        instruction: 'If Zoom shows Start Video, turn video on first. If video is on but there is still no usable image, continue with camera troubleshooting.',
        expected: 'A camera image appears, or the issue is confirmed as a camera-selection/access problem.',
      },
      {
        title: 'Select the correct camera',
        instruction: 'During a desktop meeting, use the arrow beside Start/Stop Video and open Video Settings. If multiple cameras are available, select the intended camera.',
        expected: 'The selected camera produces a preview or meeting video.',
      },
      {
        title: 'Confirm Zoom can access the camera',
        instruction: 'If Zoom cannot use the camera, check device or security permissions and close other applications that may already be using the camera. Do not bypass organization-managed restrictions.',
        expected: 'Zoom can access a camera that the device itself recognizes.',
      },
      {
        title: 'Test video',
        instruction: 'Use Zoom video settings or a Zoom test meeting to verify the camera before returning to deeper recovery steps.',
        expected: 'The user sees their camera preview in Zoom.',
      },
    ],
    success: 'The camera preview or meeting video appears from the intended camera.',
    unresolved: 'If the device itself does not recognize the camera, refer to IT/device support. If Zoom can access the camera but the issue remains, continue the approved camera troubleshooting process; reinstall is a later recovery step, not the first check.',
    script: '“First let’s see whether your video is just turned off or whether Zoom is having trouble with the camera itself.”',
    processIds: [
      'zoom-camera-troubleshooting-during-a-meeting',
      'testing-your-video-in-zoom',
      'showing-and-hiding-your-video-in-a-zoom-meeting',
      'zoom-basic-support-boundaries-decision-path-referral-process',
    ],
    primarySource: {
      title: 'Troubleshooting camera issues during a meeting',
      url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0068908',
    },
    supportingSources: [
      {
        title: 'Testing your video',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0061836',
      },
      {
        title: 'Zoom frequently asked questions',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0063407',
      },
    ],
    visuals: [],
  },
  {
    id: 'waiting-entry',
    group: 'JOIN & ACCESS',
    categoryId: 'join',
    title: 'I’m waiting to get in',
    subtitle: 'Waiting for host vs Waiting Room',
    classification: 'Meeting-entry state',
    classificationNote: 'Read the exact message on screen. Waiting for host and Waiting Room are different states with different owners and next actions.',
    searchPhrases: [
      'waiting for host',
      'host hasnt started',
      'host has not started',
      'waiting room',
      'stuck waiting room',
      'waiting to get in',
      'please wait for host',
      'host will let you in soon',
    ],
    confirm: [
      'What exact waiting message is displayed?',
      'Is the caller a participant or the host?',
      'If a scheduled date/time is shown, does it match the invitation they received?',
    ],
    states: [
      {
        title: 'Waiting for host',
        badge: 'Host has not started the session',
        body: 'Zoom’s current guidance says this means the participant has successfully connected to Zoom, but the host has not started the meeting/webinar yet.',
        action: 'Do not start audio, video, network, or reinstall troubleshooting solely because this screen appears. The participant can wait for the host or contact the host/organizer if the timing seems wrong.',
      },
      {
        title: 'Waiting Room',
        badge: 'Host controls admission',
        body: 'The participant is being held in the meeting’s Waiting Room. The host controls admission; the support agent cannot admit the participant.',
        action: 'Participant: remain in the Waiting Room or contact the meeting organizer if needed. Host: open Participants and select Admit next to the participant, or Admit all when appropriate.',
      },
      {
        title: 'Scheduled for a different date or time',
        badge: 'Verify the invitation',
        body: 'Zoom may show the scheduled date/time when the meeting is not currently expected to start.',
        action: 'Check the date, start time, and timezone shown against the invitation. If the details are uncertain, the invitation sender/meeting organizer must confirm them.',
      },
    ],
    checks: [],
    success: 'The agent identifies the exact waiting state and gives the correct owner-specific next action without unnecessary troubleshooting.',
    unresolved: 'If the screen is not one of these expected states or another error appears, return to the joining route and classify the exact message before troubleshooting.',
    script: '“Please read the exact message you see on the Zoom screen. That will tell us whether we’re waiting for the host to start the meeting or waiting for the host to admit you.”',
    processIds: [
      'waiting-for-the-host-to-start-a-meeting-or-webinar',
      'joining-a-zoom-meeting',
      'zoom-basic-support-boundaries-decision-path-referral-process',
    ],
    primarySource: {
      title: 'Waiting for the host to start meeting/webinar',
      url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0061476',
    },
    supportingSources: [
      {
        title: 'Using waiting room during a meeting',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0063329',
      },
    ],
    visuals: [],
  },
]

const routeSearchDocs = COMMON_ISSUE_ROUTES.map(route => ({
  id: route.id,
  title: route.title,
  keywords: [...route.searchPhrases, route.subtitle, route.classification].join(' '),
  purpose: route.subtitle,
  text: [
    route.classificationNote,
    ...route.confirm,
    ...route.checks.flatMap(check => [check.title, check.instruction, check.expected]),
    ...(route.states ?? []).flatMap(state => [state.title, state.badge, state.body, state.action]),
  ].join(' '),
  category: route.categoryId,
}))

const routesById = new Map(COMMON_ISSUE_ROUTES.map(route => [route.id, route]))

export function routeById(id) {
  return routesById.get(id) ?? null
}

export function searchCommonIssueRoutes(query) {
  return searchProcesses(routeSearchDocs, query)
    .map(result => routesById.get(result.id))
    .filter(Boolean)
}
