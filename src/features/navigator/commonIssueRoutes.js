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
        instruction: 'If the invite link is not working, open Zoom Workplace or zoom.us/join and enter the Meeting ID exactly as provided by the host/organizer. Enter the passcode if prompted.',
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
        instruction: 'If Zoom is showing Join Audio, connect to meeting audio first. On mobile, choose the internet-audio option shown on the device before continuing.',
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
    discrepancy: 'Current official Zoom Support articles use different labels for the mobile internet-audio choice: the mobile troubleshooting article says “Call Over Internet,” while the audio-testing article says “Wifi or Cellular Data.” OGCon therefore tells agents to use the internet-audio option actually shown on the caller’s device instead of treating either label as universal.',
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
        instruction: 'If Zoom is showing Join Audio, connect to meeting audio before testing the microphone. On mobile, choose the internet-audio option shown on the device before continuing.',
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
    discrepancy: 'The approved mobile microphone Process Document says “Call Over Internet.” Current official Zoom Support articles are themselves inconsistent: the mobile troubleshooting article also says “Call Over Internet,” while the audio-testing article says “Wifi or Cellular Data.” OGCon keeps the approved process unchanged and tells agents to use the internet-audio option actually shown on the caller’s device.',
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

  {
    id: 'cant-share',
    group: 'SCREEN SHARING',
    categoryId: 'sharing',
    title: 'Can’t share my screen',
    subtitle: 'Share / Start share is missing, disabled, or not working',
    classification: 'Screen-sharing symptom or permission boundary',
    classificationNote: 'First determine whether the control is simply hidden or moved, whether the host allows participant sharing, or whether the device/browser is blocking screen capture. Do not bypass host- or organization-controlled permissions.',
    searchPhrases: [
      'cant share', 'cant share screen', 'cannot share screen', 'share button missing', 'start share missing',
      'screen share disabled', 'screen sharing not working', 'wont let me share', 'cannot present', 'cant present',
    ],
    confirm: [
      'Which platform are they using: desktop app, mobile app, or Zoom Web App?',
      'Do they see Share or Start share anywhere in the meeting controls or under More?',
      'Are they a participant, host, or co-host, and are participants allowed to share in this meeting?',
    ],
    checks: [
      {
        title: 'Locate Share / Start share before treating it as missing',
        instruction: 'Reveal the meeting controls. On desktop or web, look for Share / Share Screen and check additional controls if needed. On mobile, tap the meeting screen and check More when Start share is not on the visible toolbar.',
        expected: 'The caller either locates the sharing control or confirms that the option is genuinely unavailable.',
      },
      {
        title: 'Confirm the host allows participant sharing',
        instruction: 'If the caller is a participant and sharing is unavailable or blocked, explain that the host can control whether participants may share. Do not bypass the host restriction.',
        expected: 'The issue is correctly identified as either a usable sharing control or a host-controlled permission.',
      },
      {
        title: 'Start only the intended share',
        instruction: 'Choose the intended screen, window, tab, document, or other supported content. Enable Share sound only when needed. Follow any operating-system or browser screen-capture prompt, then start the share.',
        expected: 'Zoom shows an active sharing state and participants can see the selected content.',
      },
    ],
    success: 'The caller starts the intended share, or the remaining blocker is clearly identified as a host/device/browser permission boundary.',
    unresolved: 'If a managed device, browser policy, or operating-system permission blocks sharing, refer to the caller’s IT/device support. If participant sharing is disabled, the host/organizer owns the next action.',
    script: '“Let’s first find the Share control and confirm whether this is a hidden control or a meeting permission. We won’t change or bypass anything controlled by the host.”',
    processIds: [
      'sharing-your-screen-desktop-or-content-in-zoom',
      'using-participant-controls-in-a-zoom-meeting',
      'zoom-basic-support-boundaries-decision-path-referral-process',
    ],
    primarySource: {
      title: 'Sharing your screen or desktop on Zoom',
      url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0060596',
    },
    supportingSources: [
      { title: 'Participant controls in a meeting', url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062674' },
      { title: 'Using host and co-host controls in a meeting', url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0065164' },
    ],
    discrepancy: 'Current Zoom documentation can place Start share under More on mobile while the dedicated screen-sharing article refers to Share in the meeting controls. OGCon therefore guides by the visible Share / Start share label and checks More before calling the control missing.',
    visuals: [],
  },
  {
    id: 'chat',
    group: 'MEETING CONTROLS',
    categoryId: 'controls',
    title: 'Can’t find chat / can’t send a message',
    subtitle: 'Chat is missing, restricted, or the intended recipient is unavailable',
    classification: 'Meeting-chat control or permission symptom',
    classificationNote: 'A missing private-chat option may be a host/admin restriction rather than an app failure. Confirm the intended recipient before sending so a private message is not accidentally sent to everyone.',
    searchPhrases: [
      'cant find chat', 'can’t find chat', 'chat missing', 'chat disabled', 'cant send message',
      'cannot send chat', 'private chat missing', 'zoom chat not working', 'where is chat', 'message everyone',
    ],
    confirm: [
      'Are they trying to message everyone, the host, or one specific participant?',
      'Do they see Chat anywhere in the meeting controls or under More?',
      'Are they using the desktop app, mobile app, or Zoom Web App?',
    ],
    checks: [
      {
        title: 'Locate meeting Chat',
        instruction: 'Reveal the meeting controls and select Chat when available. On mobile, tap the meeting screen first and check the available controls or More.',
        expected: 'The meeting chat panel or mobile chat view opens.',
      },
      {
        title: 'Confirm the recipient before sending',
        instruction: 'For a meeting-wide message, use the main/everyone chat. For a private message when allowed, select the intended participant before typing and sending.',
        expected: 'The message is addressed to the intended meeting conversation or private recipient.',
      },
      {
        title: 'Treat missing chat options as a permission check',
        instruction: 'If Chat, private chat, or a needed recipient is unavailable, confirm whether the host or administrator has limited meeting chat. Do not attempt to bypass that restriction.',
        expected: 'The caller can distinguish a meeting permission from a Zoom malfunction.',
      },
    ],
    success: 'The caller opens meeting chat and sends to the intended recipient, or the remaining limitation is correctly identified as host/admin controlled.',
    unresolved: 'If the needed chat option is restricted by the meeting host or organization, direct the caller to the host/organizer or organization support. Do not change meeting-owner policy.',
    script: '“Let’s first find the meeting Chat control, then we’ll confirm exactly who the message should go to before you send anything.”',
    processIds: [
      'chatting-in-a-zoom-meeting',
      'using-participant-controls-in-a-zoom-meeting',
      'zoom-basic-support-boundaries-decision-path-referral-process',
    ],
    primarySource: {
      title: 'Chatting in a Zoom meeting',
      url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0064400',
    },
    supportingSources: [
      { title: 'Participant controls in a meeting', url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062674' },
    ],
    visuals: [],
  },
  {
    id: 'meeting-controls',
    group: 'MEETING CONTROLS',
    categoryId: 'controls',
    title: 'Can’t find a meeting control',
    subtitle: 'Mute, Video, Participants, Chat, Share, React, More, or Leave is hard to locate',
    classification: 'Navigation / meeting-control location symptom',
    classificationNote: 'Do not troubleshoot a feature until you establish whether the control is simply hidden, moved, placed under More, or genuinely unavailable. Placement can vary by platform, role, settings, and supported features.',
    searchPhrases: [
      'find a meeting control', 'cant find meeting control', 'zoom buttons disappeared', 'controls missing',
      'meeting controls missing', 'toolbar disappeared', 'cant find mute', 'cant find participants',
      'cant find more', 'where are zoom controls', 'where is mute button', 'zoom toolbar missing', 'buttons missing',
    ],
    confirm: [
      'Which exact control are they trying to find?',
      'Are they on the desktop app, mobile app, or Zoom Web App?',
      'Can they currently see any meeting toolbar at all?',
    ],
    checks: [
      {
        title: 'Reveal the meeting controls',
        instruction: 'Desktop/Web: move the pointer over the meeting window when controls are hidden. Mobile: tap once on the meeting screen to reveal controls.',
        expected: 'The meeting toolbar becomes visible.',
      },
      {
        title: 'Check the visible toolbar, then More',
        instruction: 'Look for the requested control in the visible meeting toolbar. If it is not shown, check More or the available additional controls before treating it as missing.',
        expected: 'The caller locates the requested control or confirms that it is unavailable in the current meeting.',
      },
      {
        title: 'Identify permission or support boundaries',
        instruction: 'If the feature is genuinely absent, determine whether the caller’s role, host/admin settings, plan, device, or organization policy controls availability. Do not bypass restrictions.',
        expected: 'The remaining issue has a clear owner instead of becoming random troubleshooting.',
      },
    ],
    success: 'The caller locates the requested control or the agent identifies why it is not available.',
    unresolved: 'If the control is unavailable because of host/admin settings or managed organization policy, refer to the appropriate owner. If the issue is device/app specific, open the relevant approved Process Guide.',
    script: '“Tell me the exact control you’re looking for. We’ll reveal the toolbar first, then check the visible controls and More before we assume anything is missing.”',
    processIds: [
      'zoom-meeting-controls-icons',
      'using-participant-controls-in-a-zoom-meeting',
      'zoom-basic-support-boundaries-decision-path-referral-process',
    ],
    primarySource: {
      title: 'Participant controls in a meeting',
      url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062674',
    },
    supportingSources: [
      { title: 'Using host and co-host controls in a meeting', url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0065164' },
    ],
    visuals: [],
  },
  {
    id: 'reactions',
    group: 'MEETING CONTROLS',
    categoryId: 'controls',
    title: 'Raise hand / reactions',
    subtitle: 'Raise or lower a hand, send feedback, or find meeting reactions',
    classification: 'Meeting reaction / non-verbal feedback request',
    classificationNote: 'Raise Hand and persistent non-verbal feedback stay active until removed, while ordinary emoji reactions are temporary. Availability can depend on meeting/account settings.',
    searchPhrases: [
      'raise hand', 'how to raise hand', 'lower hand', 'reactions missing', 'where are reactions',
      'thumbs up zoom', 'non verbal feedback', 'slow down reaction', 'speed up reaction', 'react button',
    ],
    confirm: [
      'Are they trying to raise their hand, lower it, or send another reaction?',
      'Are they using desktop, mobile, or the Zoom Web App?',
      'Do they see React, Reactions, or More in the meeting controls?',
    ],
    checks: [
      {
        title: 'Open reactions / feedback',
        instruction: 'Desktop/Web: select React / Reactions. Mobile: tap More, then choose the available reaction or feedback control.',
        expected: 'The reaction/feedback choices become visible.',
      },
      {
        title: 'Raise or lower the hand',
        instruction: 'Choose Raise Hand when needed. To remove it, use Lower Hand when shown. Hosts can also lower a participant’s hand from Participants.',
        expected: 'The raised-hand indicator appears and remains until it is lowered.',
      },
      {
        title: 'Keep ordinary reactions separate from Raise Hand',
        instruction: 'Explain that ordinary emoji reactions are temporary, while Raise Hand or other persistent feedback stays until removed. Do not confuse OS-level gesture effects with Zoom reactions.',
        expected: 'The caller uses the intended feedback type and understands its behavior.',
      },
    ],
    success: 'The intended reaction/feedback appears and persistent feedback can be removed correctly.',
    unresolved: 'If reactions are unavailable because they are disabled by the host/account administrator, stop at that permission boundary and direct the caller to the appropriate meeting owner.',
    script: '“Let’s open the reactions menu first. If you’re raising your hand, I’ll also show you how to lower it afterward because that one stays active until it’s cleared.”',
    processIds: [
      'using-non-verbal-feedback-and-meeting-reactions',
      'using-participant-controls-in-a-zoom-meeting',
      'zoom-basic-support-boundaries-decision-path-referral-process',
    ],
    primarySource: {
      title: 'Using non-verbal feedback and meeting reactions',
      url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0063323',
    },
    supportingSources: [
      { title: 'Participant controls in a meeting', url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062674' },
    ],
    visuals: [],
  },
  {
    id: 'invite',
    group: 'HOST / MEETING ENTRY',
    categoryId: 'controls',
    title: 'Invite someone / copy invite link',
    subtitle: 'Bring someone into the current meeting or copy the current invitation',
    classification: 'Active-meeting invitation request',
    classificationNote: 'Use the actual invitation/link shown by Zoom or supplied by the organizer. Technical support can explain where the control is, but cannot decide who is authorized to join the proceeding.',
    searchPhrases: [
      'invite someone', 'invite participant', 'copy invite link', 'copy invitation', 'send zoom link',
      'how do i invite someone', 'bring someone into meeting', 'meeting invitation', 'invite another participant',
    ],
    confirm: [
      'Are they inviting someone to a meeting that is already in progress, or sharing details for a scheduled meeting?',
      'Are they using the desktop app, mobile app, or Zoom Web App?',
      'Do they need only the join link or the full invitation text?',
    ],
    checks: [
      {
        title: 'Open the active-meeting invite controls',
        instruction: 'Open Participants. Use Invite or the available add/invite control when the caller’s role and meeting allow it.',
        expected: 'Zoom opens the current meeting’s invitation options.',
      },
      {
        title: 'Copy the current link or invitation',
        instruction: 'Use Copy invite link or Copy invitation when shown, then paste it only into the caller’s approved communication method. Do not alter the meeting details.',
        expected: 'The current Zoom meeting invitation/link is copied exactly as provided by Zoom.',
      },
      {
        title: 'Stop at role or proceeding boundaries',
        instruction: 'If Invite is unavailable because of role/meeting policy, or if the caller is asking whether someone should be invited, direct them to the host/organizer or designated proceeding contact.',
        expected: 'The agent explains the technical control without making an authorization decision.',
      },
    ],
    success: 'The caller obtains the current meeting invitation/link using an allowed Zoom invite control.',
    unresolved: 'If role or meeting policy prevents inviting, the host/organizer owns the next action. If the question is about who may attend, refer to the designated proceeding contact rather than deciding it.',
    script: '“I can show you where Zoom’s invite control is and how to copy the current meeting link. We’ll use the invitation Zoom provides without changing any meeting details.”',
    processIds: [
      'using-participant-controls-in-a-zoom-meeting',
      'joining-a-zoom-meeting',
      'zoom-basic-support-boundaries-decision-path-referral-process',
    ],
    primarySource: {
      title: 'Inviting others to join a meeting',
      url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0063688',
    },
    supportingSources: [
      { title: 'Participant controls in a meeting', url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062674' },
      { title: 'Using host and co-host controls in a meeting', url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0065164' },
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
