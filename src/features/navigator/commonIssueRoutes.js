import { normalizeSearchText, searchProcesses } from './smartSearch'

export const COMMON_ISSUE_VERIFIED_AT = 'September 23, 2026'

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
      title: 'Troubleshooting when you can’t join a Zoom meeting',
      url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0068749',
    },
    supportingSources: [
      {
        title: 'Joining a Zoom meeting',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0060732',
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
    discrepancy: 'The approved “Can’t Join” Process Document lists reinstall early in its sequence. The training instructions separately state that uninstall/reinstall is not the first solution. The workspace therefore keeps reinstall out of this fast route and leaves it in the full approved process pending document review.',
    visuals: [
      {
        title: 'Join from Zoom Workplace without signing in',
        src: 'assets/visual-references/join-meeting.png',
        alt: 'Zoom Workplace join screen showing the Join a meeting option',
        note: 'Use this visual when guiding a caller to join from Zoom Workplace without first signing in. Enter the meeting ID or use the invitation link, then continue to the preview, waiting screen, or meeting.',
        sourceLabel: 'Visual reference matched to the approved Joining a Zoom Meeting process',
        sourceUrl: 'https://support.palcs.org/hc/en-us/articles/38306094116627-Zoom-sign-in-options-removal-blank-screen',
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
    discrepancy: 'Current official Zoom Support articles use different labels for the mobile internet-audio choice: the mobile troubleshooting article says “Call Over Internet,” while the audio-testing article says “Wifi or Cellular Data.” The workspace therefore tells agents to use the internet-audio option actually shown on the caller’s device instead of treating either label as universal.',
    visuals: [
      {
        title: 'Select and test the correct speaker',
        src: 'assets/visual-references/audio-settings.png',
        alt: 'Zoom Audio settings showing the speaker selector, Test Speaker control, and volume controls',
        note: 'Use the Speaker section to choose the intended output device, run Test Speaker, and confirm the caller can hear Zoom.',
        sourceLabel: 'Real Zoom audio settings screen matched to the approved audio process',
        sourceUrl: 'https://www.rcmusic.com/learning/examinations/remote-exams/help-with-remote-practical-exams/remote-examination-zoom-guide',
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
      'they dont hear me',
      'they do not hear me',
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
    discrepancy: 'The approved mobile microphone Process Document says “Call Over Internet.” Current official Zoom Support articles are themselves inconsistent: the mobile troubleshooting article also says “Call Over Internet,” while the audio-testing article says “Wifi or Cellular Data.” The workspace keeps the approved process unchanged and tells agents to use the internet-audio option actually shown on the caller’s device.',
    visuals: [
      {
        title: 'Select and test the correct microphone',
        src: 'assets/visual-references/audio-settings.png',
        alt: 'Zoom Audio settings showing the microphone selector and microphone test controls',
        note: 'Use the Microphone section to choose the intended input device and confirm Zoom detects the caller’s voice before moving to permissions or deeper troubleshooting.',
        sourceLabel: 'Real Zoom audio settings screen matched to the approved audio process',
        sourceUrl: 'https://www.rcmusic.com/learning/examinations/remote-exams/help-with-remote-practical-exams/remote-examination-zoom-guide',
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
    supportedDevices: ['Windows', 'Mac', 'iPhone', 'Android'],
    unsupportedDeviceNote: 'The approved Guided Process coverage for camera troubleshooting is currently limited to the Zoom desktop and mobile apps. Browser-specific camera troubleshooting is not covered by an approved internal Process Guide yet.',
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
    ],
    visuals: [
      {
        title: 'Confirm the selected camera and preview',
        src: 'assets/visual-references/video-settings.png',
        alt: 'Zoom Video settings showing the selected camera and video preview',
        note: 'Use the Camera selector and preview to confirm Zoom is using the intended camera before moving to permissions or reinstall steps.',
        sourceLabel: 'Real Zoom video settings screen matched to the approved camera process',
        sourceUrl: 'https://marketing.prodigyems.com/blog-posts/how-to-maximize-your-zoom-recordings',
      },
    ],
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
        roleActions: {
          Participant: 'Wait for the host to start the session. If the scheduled time seems wrong or the wait is unexpected, contact the host/organizer.',
          Host: 'If you are the scheduled host, sign in to the correct Zoom account and start the scheduled meeting. If Zoom does not recognize your host access, stop and verify the organizer/account rather than troubleshooting participant audio or video.',
        },
      },
      {
        title: 'Waiting Room',
        badge: 'Host controls admission',
        body: 'The participant is being held in the meeting’s Waiting Room. The host controls admission; the support agent cannot admit the participant.',
        action: 'Participant: remain in the Waiting Room or contact the meeting organizer if needed. Host: open Participants and select Admit next to the participant, or Admit all when appropriate.',
        roleActions: {
          Participant: 'Remain in the Waiting Room until the host admits you. Contact the organizer if admission is unexpectedly delayed.',
          Host: 'Open Participants. In the Waiting Room section, select Admit next to the participant or Admit all when appropriate.',
        },
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
    visuals: [
      {
        title: 'Recognize the waiting-for-host state',
        src: 'assets/visual-references/waiting-for-host.png',
        alt: 'Zoom Workplace waiting screen showing Waiting for the host to start the meeting',
        note: 'This visual is specifically the Waiting for host state: the caller has connected to Zoom and must wait for the host to start the session. Do not confuse this with a host-controlled Waiting Room.',
        sourceLabel: 'Real Zoom Workplace waiting screen matched to the approved process',
        sourceUrl: 'https://utelecon.adm.u-tokyo.ac.jp/en/zoom/join/',
      },
    ],
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
        roles: ['Participant'],
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
    discrepancy: 'Current Zoom documentation can place Start share under More on mobile while the dedicated screen-sharing article refers to Share in the meeting controls. The workspace therefore guides by the visible Share / Start share label and checks More before calling the control missing.',
    visuals: [
      {
        title: 'Choose what to share',
        src: 'assets/visual-references/screen-share.png',
        alt: 'Zoom Share Screen dialog showing available screens or application windows',
        note: 'Use this visual after locating Share / Start share. Select the intended screen or window and enable Share sound only when needed.',
        sourceLabel: 'Real Zoom Share Screen dialog matched to the approved sharing process',
        sourceUrl: 'https://answers.communitybiblestudy.org/knowledge-base/group-leaders-how-to-show-the-weekly-teaching-video-in-zoom/',
      },
    ],
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
    visuals: [
      {
        title: 'Locate the in-meeting Chat control',
        src: 'assets/visual-references/workplace-controls.png',
        alt: 'Zoom Workplace meeting toolbar showing the in-meeting controls including Chat',
        note: 'Use the meeting toolbar to locate Chat, then confirm the intended recipient before sending. Chat availability can still depend on host or administrator settings.',
        sourceLabel: 'Current Zoom Workplace toolbar reference matched to the approved chat process',
        sourceUrl: 'https://uit.stanford.edu/service/zoom/release',
      },
    ],
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
    visuals: [
      {
        title: 'Locate the main meeting controls',
        src: 'assets/visual-references/meeting-controls.png',
        alt: 'Zoom meeting interface showing Audio, Video, Participants, Chat, Reactions, Share, More, and Leave or End controls',
        note: 'Use this as a control map. Exact order and availability can vary by platform, role, window size, and meeting settings, so check More before declaring a control missing.',
        sourceLabel: 'Zoom meeting-controls visual matched to the approved controls process',
        sourceUrl: 'https://zoom.us/fr/pricing/education',
      },
    ],
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
    visuals: [
      {
        title: 'Locate React and Raise Hand',
        src: 'assets/visual-references/workplace-controls.png',
        alt: 'Zoom Workplace meeting toolbar showing the React control among the in-meeting controls',
        note: 'Open React / Reactions to find available reactions or Raise Hand. On smaller or mobile interfaces, the option may appear under More.',
        sourceLabel: 'Current Zoom Workplace toolbar reference matched to the approved reactions process',
        sourceUrl: 'https://uit.stanford.edu/service/zoom/release',
      },
    ],
  },
  {
    id: 'invite',
    group: 'HOST / MEETING ENTRY',
    categoryId: 'controls',
    title: 'Invite someone / copy invite link',
    subtitle: 'Bring someone into the current meeting or copy the current invitation',
    classification: 'Active-meeting invitation request',
    classificationNote: 'Use the actual invitation/link shown by Zoom or supplied by the organizer. Technical support can explain where the control is, but cannot decide who is authorized to join the proceeding.',
    guideCoverageNotes: {
      Windows: 'The current approved Participant Controls Process covers Android/iOS and the Zoom Web App, not desktop invitation controls. Do not apply the mobile/Web guide to Windows; use the official Zoom source and the host/organizer boundary until a desktop internal Process Guide is approved.',
      Mac: 'The current approved Participant Controls Process covers Android/iOS and the Zoom Web App, not desktop invitation controls. Do not apply the mobile/Web guide to macOS; use the official Zoom source and the host/organizer boundary until a desktop internal Process Guide is approved.',
    },
    searchPhrases: [
      'invite someone', 'invite person', 'invite participant', 'copy invite link', 'copy invitation', 'send zoom link',
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
        instruction: 'Open Participants. On mobile, reveal the meeting controls and use Participants wherever it appears; if it is not visible, check More. Then use Invite or the available add-participant control when the caller’s role and meeting allow it.',
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
    discrepancy: 'Current official Zoom Support articles differ on mobile placement of Participants during a meeting: the invitation article shows Participants in the meeting controls toolbar, while the participant-controls article places Participants under More. The workspace therefore tells agents to reveal the mobile controls, use Participants wherever it appears, and check More when it is not visible.',
    visuals: [
      {
        title: 'Start from Participants to invite someone',
        src: 'assets/visual-references/workplace-controls.png',
        alt: 'Zoom Workplace meeting toolbar showing the Participants control',
        note: 'Open Participants first, then use the available Invite control to copy or share the current meeting invitation. Exact placement can vary with role and interface.',
        sourceLabel: 'Current Zoom Workplace toolbar reference matched to the approved participant-controls process',
        sourceUrl: 'https://uit.stanford.edu/service/zoom/release',
      },
    ],
  },

  {
    id: 'secure-connection',
    group: 'JOIN & ACCESS',
    categoryId: 'join',
    title: 'Zoom says “Unable to establish secure connection”',
    subtitle: 'Known macOS connection error with a specific approved recovery path',
    classification: 'Specific macOS secure-connection error',
    classificationNote: 'Use this route only when the caller reports the exact “Unable to establish secure connection to Zoom” message on a Mac. Do not treat every connection problem as this known macOS error.',
    supportedDevices: ['Mac'],
    unsupportedDeviceNote: 'This approved secure-connection route is macOS-specific. For Windows, iPhone, Android, or Browser callers, return to Can’t join the meeting and classify the exact error instead.',
    searchPhrases: [
      'unable to establish secure connection', 'secure connection error', 'zoom secure connection error',
      'cant establish secure connection', 'cannot establish secure connection', 'secure connection to zoom',
      'mac secure connection zoom', 'zoom wont connect on mac', 'known mac zoom error',
    ],
    confirm: [
      'Does the caller see the exact message “Unable to establish secure connection to Zoom”?',
      'Are they using the Zoom desktop app on macOS?',
      'Can the Zoom app still open far enough to check for an update?',
    ],
    checks: [
      {
        title: 'Confirm the exact error and platform',
        instruction: 'Use this route only for the exact secure-connection message on macOS. If the caller is on another platform or describes a different connection symptom, return to the general Can’t Join route instead.',
        expected: 'The agent confirms this is the documented macOS secure-connection error rather than a generic join failure.',
      },
      {
        title: 'Update Zoom first when the app can still open',
        instruction: 'Follow the approved internal process: if the Zoom app opens normally enough to update, install the available Zoom update before moving to removal and reinstall steps.',
        expected: 'Zoom is current, or the caller confirms that updating is not available or does not resolve the error.',
      },
      {
        title: 'Use the approved complete uninstall and reinstall path',
        instruction: 'If the error continues, follow the approved Uninstalling and Reinstalling the Zoom Application process for macOS. Restart the Mac and reinstall Zoom from Zoom’s official download source.',
        expected: 'A fresh Zoom installation opens without the secure-connection error, or the error remains after the approved reinstall path.',
      },
      {
        title: 'Check calendar/contact integration only within the support boundary',
        instruction: 'Zoom’s current guidance includes deleting and reconfiguring an existing Calendar and Contact Integration. Only guide this when the caller is authorized to manage that integration. Otherwise refer to their Zoom administrator or IT team.',
        expected: 'The integration is either safely reconfigured by an authorized caller or correctly referred without changing managed settings.',
      },
      {
        title: 'Finish with macOS updates and restart',
        instruction: 'If the error remains, check for available macOS system updates and restart the device. Stop and refer when organization-managed settings, security software, network controls, or admin access are required.',
        expected: 'The Mac is restarted and current, or the remaining blocker is clearly outside basic Zoom support.',
      },
    ],
    success: 'Zoom opens and connects without the secure-connection error.',
    unresolved: 'If the error remains after the approved update/reinstall/system-update path, or the fix requires managed calendar integration, security, network, or administrator access, refer to the caller’s IT/Zoom administrator.',
    script: '“That exact message has a specific Mac troubleshooting path. I’ll keep us to the approved steps, and I won’t change any managed settings without the right access.”',
    processIds: [
      'zoom-error-unable-to-establish-secure-connection-to-zoom',
      'uninstalling-and-reinstalling-the-zoom-application',
      'zoom-basic-support-boundaries-decision-path-referral-process',
    ],
    primarySource: {
      title: 'Zoom error message “Unable to establish secure connection to Zoom”',
      url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0067093',
    },
    supportingSources: [
      { title: 'Changing settings in the Zoom Workplace desktop and mobile app', url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0060612' },
    ],
    discrepancy: 'The approved internal process starts with updating Zoom when the app can still open, while Zoom’s current public article presents complete uninstall/reinstall earlier in its troubleshooting sequence. The workspace keeps the approved internal order and surfaces this sequence difference instead of silently rewriting it.',
    visuals: [
      {
        title: 'Recognize the exact secure-connection error',
        src: 'assets/visual-references/secure-connection-error.png',
        alt: 'Zoom on macOS showing the Unable to establish secure connection to Zoom error',
        note: 'Use this image only to confirm the exact error before following the Mac-specific recovery path.',
        sourceLabel: 'Zoom Community — real Zoom error screen matched to the approved process',
        sourceUrl: 'https://community.zoom.com/meetings-2/error-unable-to-establish-secure-connection-to-zoom-error-code-205digicert-26586',
      },
    ],
  },
  {
    id: 'bluetooth-headset',
    group: 'AUDIO',
    categoryId: 'audio',
    title: 'My Bluetooth headset isn’t working',
    subtitle: 'Headphones are connected but Zoom is using the wrong speaker or microphone',
    classification: 'Bluetooth audio-device selection or connection symptom',
    classificationNote: 'First separate device pairing from Zoom device selection. A headset can be paired to the computer or phone but still not be selected as Zoom’s active speaker and microphone.',
    supportedDevices: ['Windows', 'Mac', 'iPhone', 'Android'],
    unsupportedDeviceNote: 'This approved Bluetooth route covers the Zoom desktop and mobile apps. For Browser callers, use the general speaker/microphone route and the browser’s available audio-device controls instead of applying app-specific Bluetooth steps.',
    searchPhrases: [
      'bluetooth headset not working', 'bluetooth headphones not working', 'airpods not working zoom',
      'zoom not using bluetooth', 'cant hear through bluetooth', 'they cant hear me bluetooth',
      'wrong bluetooth mic', 'wrong bluetooth speaker', 'headset connected but zoom not using it',
      'bluetooth audio zoom', 'zoom headset problem',
    ],
    confirm: [
      'Are the headphones already paired and connected to the same device running Zoom?',
      'Is the problem hearing others, being heard, or both?',
      'Are they using desktop, Android, or iPhone/iPad?',
    ],
    checks: [
      {
        title: 'Confirm the headset is connected to the device first',
        instruction: 'Before changing Zoom settings, confirm the Bluetooth headphones are paired and connected to the computer or mobile device. If they are connected to multiple devices, disconnect them from the other devices while testing.',
        expected: 'The operating system shows the headset as connected to the device being used for Zoom.',
      },
      {
        title: 'Select the headset as both speaker and microphone',
        devices: ['Windows', 'Mac'],
        instruction: 'Desktop: next to Mute/Unmute, open the audio-device choices and select the Bluetooth headset under both Microphone and Speaker. If it is not listed, reconnect the headset before continuing.',
        expected: 'Zoom shows the Bluetooth headset as the selected microphone and speaker.',
      },
      {
        title: 'Use the mobile Bluetooth audio path',
        devices: ['iPhone', 'Android'],
        instruction: 'Android/iOS: join meeting audio using the internet-audio option shown on the device, then use the Bluetooth indicator when available to confirm the headset is selected. If the Bluetooth indicator is missing, reconnect the headset while in the meeting.',
        expected: 'Meeting audio routes through the Bluetooth headset on the mobile device.',
      },
      {
        title: 'Test before escalating',
        instruction: 'Use Zoom’s audio test or a Zoom test meeting when available. Close other apps that are actively using audio and retry. Do not jump straight to reinstall or driver changes.',
        expected: 'The caller can hear and be heard through the intended Bluetooth headset, or the remaining problem is isolated to the device/headset.',
      },
    ],
    success: 'Zoom uses the Bluetooth headset for the intended speaker and microphone path.',
    unresolved: 'If the headset cannot stay connected, requires managed driver/device changes, or still fails outside Zoom, refer to device or IT support. Use reinstall only when the approved process specifically calls for it.',
    script: '“Let’s confirm the headset is connected to this device first, then we’ll make sure Zoom is using it for both the speaker and microphone.”',
    processIds: [
      'using-bluetooth-headphones-with-zoom-on-android-ios',
      'testing-your-audio-settings-for-zoom-meetings',
      'zoom-basic-support-boundaries-decision-path-referral-process',
    ],
    primarySource: {
      title: 'Using Bluetooth headphones with Zoom',
      url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0058146',
    },
    supportingSources: [
      { title: 'Changing settings in the Zoom Workplace desktop and mobile app', url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0060612' },
    ],
    visuals: [
      {
        title: 'Zoom audio device selectors',
        src: 'assets/visual-references/audio-settings.png',
        alt: 'Zoom audio settings showing speaker and microphone device selectors and audio test controls',
        note: 'This desktop reference shows where to select the intended speaker and microphone. For Bluetooth, choose the headset under both device selectors when available.',
        sourceLabel: 'Real Zoom audio settings screen matched to approved audio processes',
        sourceUrl: 'https://www.rcmusic.com/learning/examinations/remote-exams/help-with-remote-practical-exams/remote-examination-zoom-guide',
      },
    ],
  },
  {
    id: 'transfer-device',
    group: 'DEVICES & APP',
    categoryId: 'devices',
    title: 'I need to switch this meeting to another device',
    subtitle: 'Transfer an active meeting or webinar without manually leaving and rejoining',
    classification: 'Active meeting/device transfer request',
    classificationNote: 'The standard device-transfer path requires the user to be signed in to the same Zoom account on both devices and the transfer feature to be available for the account. Some meeting data does not carry over.',
    searchPhrases: [
      'switch meeting to another device', 'transfer meeting to phone', 'transfer zoom to laptop',
      'move zoom meeting to phone', 'move meeting to another device', 'switch devices zoom',
      'continue meeting on another device', 'transfer active meeting', 'switch zoom from phone to computer',
      'take meeting on another device',
    ],
    confirm: [
      'Are they already inside an active meeting or webinar on one device?',
      'Are both devices signed in to the same Zoom account?',
      'Are they switching to another personal device or to a Zoom Room?',
    ],
    checks: [
      {
        title: 'Confirm transfer requirements before looking for Switch',
        instruction: 'For the standard device-to-device path, confirm the caller is signed in to the same Zoom account on both devices and that meeting transfer is available for the account.',
        expected: 'The caller is signed in correctly on both devices and is eligible to use the transfer feature.',
      },
      {
        title: 'Open the in-progress meeting on the second device',
        instruction: 'On the second signed-in device, locate the meeting or webinar that is already in progress. When transfer is available, Zoom shows Switch in place of the normal Start/Join action.',
        expected: 'The second device shows the in-progress session with a Switch action.',
      },
      {
        title: 'Switch and confirm the first device disconnects',
        instruction: 'Choose Switch. After the second device joins successfully, confirm the original device disconnects from the meeting automatically.',
        expected: 'The meeting continues on the second device and the original device is no longer connected.',
      },
      {
        title: 'Set expectations about what does not transfer',
        instruction: 'Explain that items such as previously sent chat messages, raised-hand state, active local recording, captions, submitted Q&A, or full-transcription view may not transfer with the session.',
        expected: 'The caller understands the transfer is successful even if some session-local state does not carry over.',
      },
    ],
    success: 'The active meeting or webinar continues on the second signed-in device and the original device disconnects.',
    unresolved: 'If Switch is unavailable because the account setting is disabled or managed, refer to the account owner/admin. For Zoom Room transfer or pairing, open the full approved Process Guide rather than improvising.',
    script: '“We’ll first make sure both devices are signed in to the same Zoom account. If transfer is available, the second device should show Switch for the meeting that’s already in progress.”',
    processIds: [
      'transferring-meetings-and-webinars-between-devices',
      'zoom-basic-support-boundaries-decision-path-referral-process',
    ],
    primarySource: {
      title: 'Transferring meetings and webinars between devices',
      url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062024',
    },
    supportingSources: [],
    visuals: [
      {
        title: 'Find the in-progress meeting and select Switch',
        src: 'assets/visual-references/switch-device.png',
        alt: 'Zoom Workplace showing an in-progress meeting with the Switch action for moving the session to another device',
        note: 'On the second device signed in to the same Zoom account, Switch replaces Start or Join for an eligible in-progress session.',
        sourceLabel: 'Real Zoom Workplace device-transfer view matched to the approved process',
        sourceUrl: 'https://utelecon.adm.u-tokyo.ac.jp/en/zoom/misc/app/',
      },
    ],
  },
  {
    id: 'join-muted',
    group: 'AUDIO',
    categoryId: 'audio',
    title: 'I want to join with my microphone muted',
    subtitle: 'Set mute-on-join or choose not to connect audio for one meeting',
    classification: 'Pre-join microphone/audio preference',
    classificationNote: 'Keep “join muted” separate from “don’t connect to audio.” Joining muted still connects the caller to meeting audio; Don’t connect to audio prevents the Zoom audio connection for that join.',
    guideCoverageNotes: {
      iPhone: 'The approved Process Document lists iOS as applicable, but its current step-by-step section contains desktop instructions only. Ozzie will not substitute desktop setting labels on iPhone until a mobile internal path is approved.',
      Android: 'The approved Process Document lists Android as applicable, but its current step-by-step section contains desktop instructions only. Ozzie will not substitute desktop setting labels on Android until a mobile internal path is approved.',
    },
    supportedDevices: ['Windows', 'Mac', 'iPhone', 'Android'],
    unsupportedDeviceNote: 'This approved mute-on-join route covers the Zoom desktop and mobile apps. Do not apply these app-setting labels to a Browser caller.',
    searchPhrases: [
      'join muted', 'always join muted', 'mute microphone when joining', 'mic muted on join',
      'keep my microphone muted', 'always mute my mic', 'dont connect to audio', 'join without audio',
      'enter zoom muted', 'start zoom muted', 'mute before joining',
    ],
    confirm: [
      'Do they want to stay connected to meeting audio but enter muted, or do they want no Zoom audio connection at all?',
      'Do they want this behavior for every meeting or only the next meeting?',
      'Are they using desktop or mobile?',
    ],
    checks: [
      {
        title: 'For every desktop meeting, enable Keep my microphone muted',
        devices: ['Windows', 'Mac'],
        instruction: 'Desktop: sign in to Zoom, open Settings, choose Meetings & webinars, then under the join settings enable Keep my microphone muted.',
        expected: 'Future meetings start with the caller connected to audio but muted.',
      },
      {
        title: 'For mobile, use the platform mute-on-join setting',
        devices: ['iPhone', 'Android'],
        instruction: 'Android/iOS: open Zoom Settings → Meetings and enable the mute-on-join option shown on that device, such as Always Mute My Microphone or Mute My Microphone.',
        expected: 'Future mobile meetings start with the microphone muted.',
      },
      {
        title: 'For one meeting with no Zoom audio, use Don’t connect to audio',
        instruction: 'If the caller does not want Zoom audio connected for one meeting, use the Don’t connect to audio option before joining. Explain that this is different from simply entering muted.',
        expected: 'The caller joins with the intended audio behavior instead of confusing mute state with audio connection state.',
      },
    ],
    success: 'The caller’s next meeting uses the intended mute or audio-connection behavior.',
    unresolved: 'If the setting is unavailable or locked by organization policy, refer to the Zoom administrator. Do not change managed policy to force the option.',
    script: '“Do you want to join connected to audio but muted, or do you want Zoom not to connect to audio at all? Those are two different settings.”',
    processIds: [
      'muting-your-microphone-when-joining-a-zoom-meeting',
      'zoom-basic-support-boundaries-decision-path-referral-process',
    ],
    primarySource: {
      title: 'Muting your microphone when joining a meeting',
      url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062614',
    },
    supportingSources: [
      { title: 'Changing settings in the Zoom Workplace desktop and mobile app', url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0060612' },
    ],
    visuals: [
      {
        title: 'Keep the microphone muted when joining',
        src: 'assets/visual-references/join-experience-settings.png',
        alt: 'Zoom Workplace Join experience settings showing the Keep my microphone muted option',
        note: 'Use Keep my microphone muted for the default mute-on-join behavior. This is different from Don’t connect to audio for a single join.',
        sourceLabel: 'Recent real Zoom Workplace Join experience settings matched to the approved process',
        sourceUrl: 'https://zapier.com/blog/zoom-tips/',
      },
    ],
  },
  {
    id: 'join-video-preference',
    group: 'VIDEO',
    categoryId: 'video',
    title: 'I want my camera on/off when I join',
    subtitle: 'Set the default camera state or change video for one meeting before joining',
    classification: 'Pre-join camera preference',
    classificationNote: 'First determine whether the caller wants a default for future meetings or only wants to change the next join. The desktop and mobile setting labels differ.',
    supportedDevices: ['Windows', 'Mac', 'iPhone', 'Android'],
    unsupportedDeviceNote: 'This approved camera-on-join route covers the Zoom desktop and mobile apps. Do not apply these app-setting labels to a Browser caller.',
    searchPhrases: [
      'camera off when joining', 'camera on when joining', 'video off when joining', 'video on when joining',
      'always join camera off', 'always join video off', 'keep my camera off', 'turn off my video join',
      'start meeting camera off', 'join with video', 'join without video', 'camera default zoom',
    ],
    confirm: [
      'Do they want the camera preference to apply to every meeting or only the next meeting?',
      'Do they want the camera on or off when they enter?',
      'Are they using desktop or mobile?',
    ],
    checks: [
      {
        title: 'Set the desktop default with Keep my camera off',
        devices: ['Windows', 'Mac'],
        instruction: 'Desktop: sign in to Zoom, open Settings → Meetings & webinars, then use Keep my camera off under the join experience. Enable it to join with camera off by default; disable it to allow camera-on joining.',
        expected: 'The desktop default reflects the caller’s preferred camera state for future joins.',
      },
      {
        title: 'Set the mobile default with Turn off my video',
        devices: ['iPhone', 'Android'],
        instruction: 'Android/iOS: open Zoom Settings → Meetings and use Turn off my video. Enable it to join with video off by default; disable it when the caller wants video available on join.',
        expected: 'The mobile default reflects the caller’s intended video behavior.',
      },
      {
        title: 'Change only the next meeting in the Join options',
        instruction: 'For a one-time choice, open Join and use Turn off my video before entering. Selected means the camera joins off; cleared means the camera can join on. If a video preview appears, use Join with Video or Join without Video as appropriate.',
        expected: 'Only the current join uses the selected camera state without unnecessarily changing the caller’s default.',
      },
    ],
    success: 'The caller joins with the intended camera state and understands whether the change is one-time or the new default.',
    unresolved: 'If the camera option is unavailable because of organization policy or another permission boundary, refer to the appropriate Zoom administrator rather than bypassing it.',
    script: '“Is this how you want every meeting to start, or only this next meeting? I’ll take you to the right option so we don’t change more than you intended.”',
    processIds: [
      'setting-your-video-to-stay-on-or-off-when-joining-meetings-and-webinars',
      'showing-and-hiding-your-video-in-a-zoom-meeting',
      'zoom-basic-support-boundaries-decision-path-referral-process',
    ],
    primarySource: {
      title: 'Setting your video to stay on or off when joining meetings and webinars',
      url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062043',
    },
    supportingSources: [
      { title: 'Previewing your video before joining', url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0061118' },
      { title: 'Changing settings in the Zoom Workplace desktop and mobile app', url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0060612' },
    ],
    visuals: [
      {
        title: 'Choose the camera behavior before joining',
        src: 'assets/visual-references/join-experience-settings.png',
        alt: 'Zoom Workplace Join experience settings showing the Keep my camera off option',
        note: 'Use Keep my camera off for the desktop default. For a one-time join, use the video option shown on the Join screen instead of changing the default.',
        sourceLabel: 'Recent real Zoom Workplace Join experience settings matched to the approved process',
        sourceUrl: 'https://zapier.com/blog/zoom-tips/',
      },
    ],
  },

  {
    id: 'meeting-volume',
    group: 'AUDIO',
    categoryId: 'audio',
    title: 'The meeting is too loud / too quiet',
    subtitle: 'Adjust Zoom speaker volume before or during a meeting',
    classification: 'Meeting-volume / speaker-output request',
    classificationNote: 'First determine whether the entire Zoom meeting is too loud or too quiet, or whether only one participant sounds different. Zoom does not provide a per-participant volume control.',
    guideCoverageNotes: {
      iPhone: 'The approved Process Document states that mobile users should use the device’s physical or system volume controls, but its detailed Guided Process steps are desktop-only. Ozzie will not show desktop Audio Settings as an iPhone path.',
      Android: 'The approved Process Document states that mobile users should use the device’s physical or system volume controls, but its detailed Guided Process steps are desktop-only. Ozzie will not show desktop Audio Settings as an Android path.',
    },
    supportedDevices: ['Windows', 'Mac', 'iPhone', 'Android'],
    unsupportedDeviceNote: 'This approved route covers Zoom desktop-app volume controls and mobile device volume controls. Do not apply the desktop Audio Settings steps to a Browser caller.',
    searchPhrases: [
      'meeting too loud', 'meeting too quiet', 'zoom too loud', 'zoom too quiet',
      'turn zoom volume up', 'turn zoom volume down', 'change zoom volume',
      'adjust zoom volume', 'speaker volume zoom', 'zoom volume slider',
      'make zoom louder', 'make zoom quieter', 'only zoom volume', 'volume mixer zoom',
    ],
    confirm: [
      'Is the whole meeting too loud or too quiet, or is only one participant affected?',
      'Are they using desktop or mobile?',
      'Do they want to change Zoom volume only, or the entire device volume?',
    ],
    checks: [
      {
        title: 'Adjust Zoom speaker volume on desktop',
        devices: ['Windows', 'Mac'],
        instruction: 'Open Zoom Settings → Audio and adjust the Speaker volume slider. During a meeting, open the arrow next to Mute/Unmute → Audio Settings.',
        expected: 'The overall Zoom meeting volume changes to a comfortable level.',
      },
      {
        title: 'Adjust volume with the mobile device controls',
        devices: ['iPhone', 'Android'],
        instruction: 'On iPhone or Android, use the device’s physical/system volume controls to adjust the Zoom meeting volume.',
        expected: 'The mobile meeting volume changes to a comfortable level.',
      },
      {
        title: 'Use Test Speaker before or after adjusting',
        devices: ['Windows', 'Mac'],
        instruction: 'On desktop, use Test Speaker when helpful to hear the current output level before returning to the meeting.',
        expected: 'The caller hears the test tone at a comfortable level through the intended speaker.',
      },
      {
        title: 'For Windows only, adjust Zoom separately in Volume Mixer',
        devices: ['Windows'],
        instruction: 'If the caller wants Zoom louder or quieter without changing other apps, open Windows Volume Mixer and adjust the Zoom Meetings app entry. If multiple Zoom entries appear, test them to identify the active meeting audio.',
        expected: 'Zoom’s meeting volume changes while the rest of the Windows device volume remains unchanged.',
      },
      {
        title: 'Do not promise per-participant volume control',
        instruction: 'If only one participant is too quiet or too loud, explain that Zoom does not provide individual participant volume adjustment. A quiet participant may need to check their microphone instead.',
        expected: 'The caller understands whether the issue is local meeting volume or another participant’s microphone.',
      },
    ],
    success: 'The caller hears the meeting at a comfortable level using the appropriate Zoom or device volume control.',
    unresolved: 'If the device cannot produce usable audio even after the correct speaker/output path and volume controls are confirmed, continue with the approved audio troubleshooting route. Do not install third-party volume software as part of basic support.',
    script: '“Is the whole Zoom meeting too loud or too quiet, or is it just one person? That tells us whether to adjust your Zoom volume or troubleshoot that participant’s microphone.”',
    processIds: [
      'adjusting-the-volume-of-a-zoom-meeting',
      'testing-your-audio-settings-for-zoom-meetings',
      'zoom-basic-support-boundaries-decision-path-referral-process',
    ],
    primarySource: {
      title: 'Adjusting the volume of a Zoom meeting',
      url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0057968',
    },
    supportingSources: [
      { title: 'Testing your audio settings for Zoom meetings', url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062765' },
    ],
    visuals: [
      {
        title: 'Find the speaker test and volume controls',
        src: 'assets/visual-references/audio-settings.png',
        alt: 'Zoom audio settings showing the selected speaker, Test Speaker, and speaker volume controls',
        note: 'Use the Speaker section to test the current output and adjust the meeting volume on desktop.',
        sourceLabel: 'Real Zoom audio settings screen matched to the approved process',
        sourceUrl: 'https://www.rcmusic.com/learning/examinations/remote-exams/help-with-remote-practical-exams/remote-examination-zoom-guide',
      },
    ],
  },
  {
    id: 'auto-computer-audio',
    group: 'AUDIO',
    categoryId: 'audio',
    title: 'I want Zoom to connect to computer audio automatically',
    subtitle: 'Skip the audio-method prompt for future desktop joins',
    classification: 'Desktop join-audio preference',
    classificationNote: 'Use this only when the caller regularly wants the computer speaker and microphone to connect automatically. It is a desktop app setting for Windows, macOS, or Linux and may be controlled by an administrator.',
    supportedDevices: ['Windows', 'Mac'],
    unsupportedDeviceNote: 'Automatically connect to computer audio is an approved desktop-app route. On iPhone, Android, or Browser, do not apply these desktop Join experience steps.',
    searchPhrases: [
      'automatically connect to computer audio', 'auto connect computer audio',
      'automatically join with computer audio', 'skip audio prompt', 'stop asking how to join audio',
      'always use computer audio', 'always connect speaker and mic', 'auto join audio',
      'connect audio automatically', 'computer audio automatically',
    ],
    confirm: [
      'Are they using the Zoom desktop app on Windows, macOS, or Linux?',
      'Do they normally want to use the same computer speaker and microphone for Zoom?',
      'Do they sometimes need another audio type, such as telephone audio?',
    ],
    checks: [
      {
        title: 'Open the desktop Join experience settings',
        instruction: 'Sign in to the Zoom desktop app. Open Settings → Meetings & webinars. Under Join experience, locate When joining meetings and webinars.',
        expected: 'The caller reaches the desktop join-experience settings.',
      },
      {
        title: 'Enable Automatically connect to computer audio',
        instruction: 'Turn on Automatically connect to computer audio. Zoom saves the setting automatically.',
        expected: 'The setting is enabled for future desktop joins.',
      },
      {
        title: 'Test with a meeting',
        instruction: 'Join a meeting and confirm that Zoom connects directly to the computer speaker and microphone without showing the usual audio-method prompt.',
        expected: 'The meeting connects to computer audio automatically.',
      },
      {
        title: 'Stop at an admin-controlled setting',
        instruction: 'If the option is missing or cannot be changed, explain that an administrator may control it. Do not bypass or alter managed policy.',
        expected: 'The caller either has the setting enabled or knows the appropriate administrator owns the next action.',
      },
    ],
    success: 'Future eligible desktop meetings connect directly to computer audio without asking the caller to choose an audio method first.',
    unresolved: 'If the setting is unavailable or locked, refer to the Zoom administrator. If the caller sometimes needs another audio type, leave the setting off so Zoom can offer the available audio methods.',
    script: '“If you usually use the same computer speaker and microphone, we can have Zoom connect to computer audio automatically so you don’t have to choose it every time.”',
    processIds: [
      'automatically-joining-meetings-with-computer-audio',
      'zoom-basic-support-boundaries-decision-path-referral-process',
    ],
    primarySource: {
      title: 'Automatically joining meetings with computer audio',
      url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0060983',
    },
    supportingSources: [],
    visuals: [
      {
        title: 'Automatically connect to computer audio',
        src: 'assets/visual-references/join-experience-settings.png',
        alt: 'Zoom Workplace Join experience settings showing Automatically connect to computer audio',
        note: 'Enable this desktop setting when the caller wants Zoom to use the computer speaker and microphone automatically for future joins.',
        sourceLabel: 'Recent real Zoom Workplace Join experience settings matched to the approved process',
        sourceUrl: 'https://zapier.com/blog/zoom-tips/',
      },
    ],
  },
  {
    id: 'multiple-audio-input-channels',
    group: 'AUDIO',
    categoryId: 'audio',
    title: 'I need to choose specific audio input channels',
    subtitle: 'Select channels from a multi-channel audio interface',
    classification: 'Multi-channel audio-interface configuration',
    classificationNote: 'This is a specialized desktop-audio path. Zoom shows the specific input-channel controls only when the selected input device is detected with three or more audio channels.',
    supportedDevices: ['Windows', 'Mac'],
    unsupportedDeviceNote: 'Specific audio input channels is supported by Zoom’s Windows and macOS desktop apps. Do not apply this route to iPhone, Android, or Browser callers.',
    searchPhrases: [
      'specific audio input channels', 'multiple audio input channels', 'choose audio channels',
      'select input channels zoom', 'multi channel audio interface', 'audio interface channels zoom',
      'zoom sees multiple channels', 'which microphone channels zoom uses', '3 audio channels zoom',
      'three input channels zoom', 'channel selection zoom microphone',
    ],
    confirm: [
      'Are they using the Zoom desktop app on Windows or macOS?',
      'Is a multi-channel microphone or audio interface connected and recognized by the operating system?',
      'Does the selected input device expose at least three input channels?',
    ],
    checks: [
      {
        title: 'Select the connected audio interface',
        instruction: 'Open Zoom Settings → Audio. Under Microphone, select the connected multi-channel audio interface or input device.',
        expected: 'Zoom uses the intended interface as the active microphone device.',
      },
      {
        title: 'Confirm that specific input channels appear',
        instruction: 'If Zoom detects three or more input channels on the selected device, Use specific audio input channels should become available and Audio input channels should show the enabled channel count.',
        expected: 'The channel-selection controls appear for the eligible device.',
      },
      {
        title: 'Choose the channels to use',
        instruction: 'Next to Audio input channels, open the channel count. Select the checkbox for one or more channels the caller wants Zoom to use.',
        expected: 'Only the intended input channels are selected.',
      },
      {
        title: 'Save before testing',
        instruction: 'Click Save. The selected channels do not take effect in a live meeting or webinar until the selection is saved.',
        expected: 'The chosen channels are applied and can be tested in a live meeting or webinar.',
      },
    ],
    success: 'Zoom uses the saved input channels from the selected multi-channel audio interface.',
    unresolved: 'If the channel option does not appear, confirm the Zoom version and that the operating system and Zoom detect at least three channels. Hardware, driver, routing, or managed-device issues belong to device/IT support.',
    script: '“This option only appears when Zoom detects at least three input channels from the selected audio interface. We’ll confirm the device first, choose the channels, then save before testing.”',
    processIds: [
      'enabling-and-managing-multiple-audio-input-channels-in-zoom',
      'zoom-basic-support-boundaries-decision-path-referral-process',
    ],
    primarySource: {
      title: 'Managing multiple audio channels',
      url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0057961',
    },
    supportingSources: [],
    visuals: [
      {
        title: 'Choose and save specific audio input channels',
        src: 'assets/visual-references/multiple-audio-input-channels.svg',
        alt: 'Source-verified Zoom visual guide showing Audio settings, Use specific audio input channels, Audio input channels, channel checkboxes, and Save',
        note: 'The channel controls appear only when Zoom detects an eligible input device with 3 or more channels. Select one or more channels, then Save before testing.',
        sourceLabel: 'Guide verified against current Zoom Support — Managing multiple audio channels',
        sourceUrl: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0057961',
      },
    ],
  },
  {
    id: 'participants-before-join',
    group: 'MEETING CONTROLS',
    categoryId: 'controls',
    title: 'Who is already in the meeting?',
    subtitle: 'View participants in an eligible scheduled meeting before joining',
    classification: 'Pre-join participant-view request',
    classificationNote: 'This feature is not a universal participant list. Zoom currently requires an eligible Pro, Business, Enterprise, or Education account, the desktop app, Zoom Calendar enabled, and an integrated calendar service.',
    supportedDevices: ['Windows', 'Mac'],
    unsupportedDeviceNote: 'This pre-join participant view is a Zoom desktop-app feature. Do not promise this Home/Calendar participant preview on iPhone, Android, or Browser.',
    searchPhrases: [
      'who is already in the meeting', 'see who is in meeting before joining',
      'see participants before joining', 'view participants before joining',
      'who joined already', 'who is inside zoom meeting', 'check attendees before joining',
      'participants already joined', 'see invitees before joining', 'check meeting attendance before join',
    ],
    confirm: [
      'Are they trying to check a scheduled meeting before they enter it?',
      'Are they using the Zoom desktop app with Zoom Calendar enabled?',
      'Is a supported calendar service integrated with Zoom, and is the account Pro, Business, Enterprise, or Education?',
    ],
    checks: [
      {
        title: 'Use Home when the meeting is visible there',
        instruction: 'Sign in to the Zoom desktop app → Home. Find the scheduled meeting and open its details. Under Host, look for participant initials or profile pictures already shown for the active meeting.',
        expected: 'The meeting details show the people Zoom reports as already joined.',
      },
      {
        title: 'Use Calendar and Invitees',
        instruction: 'Open Calendar, select the scheduled meeting, then under Invitees use the forward arrow to view the participants who have already joined.',
        expected: 'Zoom shows the joined participants from the calendar event card.',
      },
      {
        title: 'Check the feature requirements before troubleshooting',
        instruction: 'If participant information is not displayed, confirm the eligible account, Zoom Calendar, calendar integration, and correct scheduled meeting. Do not assume the meeting is empty simply because the pre-join participant display is unavailable.',
        expected: 'The caller either sees the joined participants or identifies a missing requirement for the feature.',
      },
    ],
    success: 'The caller can see the participants Zoom reports as already joined before entering the eligible scheduled meeting.',
    unresolved: 'If all stated requirements are met but participant information remains unavailable, follow the organization’s Zoom Calendar/escalation path. Do not change account or calendar integration settings outside the caller’s authorization.',
    script: '“Before we assume nobody is there, let’s confirm whether your account and Zoom Calendar setup support the pre-join participant view.”',
    processIds: [
      'viewing-participants-already-in-a-meeting-before-joining',
      'zoom-basic-support-boundaries-decision-path-referral-process',
    ],
    primarySource: {
      title: 'Viewing participants already in a meeting before joining',
      url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0083311',
    },
    supportingSources: [],
    visuals: [
      {
        title: 'See who has already joined before you enter',
        src: 'assets/visual-references/participants-before-join.svg',
        alt: 'Source-verified Zoom visual guide showing joined participants under Host on Home and under Invitees in Zoom Calendar before joining',
        note: 'Use Home or Calendar only after confirming the account, Zoom Calendar, and calendar-integration requirements. A missing participant preview does not prove the meeting is empty.',
        sourceLabel: 'Guide verified against current Zoom Support — Viewing participants already in a meeting before joining',
        sourceUrl: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0083311',
      },
    ],
  },
]

const COMMON_ISSUE_PROCESS_ROUTING = {
  'cant-join': {
    Windows: 'troubleshooting-when-you-cant-join-a-zoom-meeting',
    Mac: 'troubleshooting-when-you-cant-join-a-zoom-meeting',
    Browser: 'troubleshooting-when-you-cant-join-a-zoom-meeting',
    iPhone: 'joining-a-zoom-meeting',
    Android: 'joining-a-zoom-meeting',
  },
  'cant-hear': {
    Windows: 'troubleshooting-speaker-or-microphone-issues-in-the-zoom-desktop-app',
    Mac: 'troubleshooting-speaker-or-microphone-issues-in-the-zoom-desktop-app',
    iPhone: 'troubleshooting-speaker-or-microphone-issues-on-a-mobile-device',
    Android: 'troubleshooting-speaker-or-microphone-issues-on-a-mobile-device',
    default: 'zoom-audio-troubleshooting',
  },
  'cant-be-heard': {
    Windows: 'troubleshooting-speaker-or-microphone-issues-in-the-zoom-desktop-app',
    Mac: 'troubleshooting-speaker-or-microphone-issues-in-the-zoom-desktop-app',
    iPhone: 'troubleshooting-speaker-or-microphone-issues-on-a-mobile-device',
    Android: 'troubleshooting-speaker-or-microphone-issues-on-a-mobile-device',
    default: 'zoom-audio-troubleshooting',
  },
  'camera-not-working': {
    Windows: 'zoom-camera-troubleshooting-during-a-meeting',
    Mac: 'zoom-camera-troubleshooting-during-a-meeting',
    iPhone: 'testing-your-video-in-zoom',
    Android: 'testing-your-video-in-zoom',
  },
  'waiting-entry': {
    'Waiting for host': 'waiting-for-the-host-to-start-a-meeting-or-webinar',
    'Waiting Room': 'joining-a-zoom-meeting',
    'Scheduled for a different date or time': 'waiting-for-the-host-to-start-a-meeting-or-webinar',
  },
  'cant-share': { default: 'sharing-your-screen-desktop-or-content-in-zoom' },
  chat: { default: 'chatting-in-a-zoom-meeting' },
  'meeting-controls': {
    Windows: 'zoom-meeting-controls-icons',
    Mac: 'zoom-meeting-controls-icons',
    iPhone: 'using-participant-controls-in-a-zoom-meeting',
    Android: 'using-participant-controls-in-a-zoom-meeting',
    Browser: 'using-participant-controls-in-a-zoom-meeting',
  },
  reactions: { default: 'using-non-verbal-feedback-and-meeting-reactions' },
  invite: {
    Windows: null,
    Mac: null,
    iPhone: 'using-participant-controls-in-a-zoom-meeting',
    Android: 'using-participant-controls-in-a-zoom-meeting',
    Browser: 'using-participant-controls-in-a-zoom-meeting',
  },
  'secure-connection': { default: 'zoom-error-unable-to-establish-secure-connection-to-zoom' },
  'bluetooth-headset': { default: 'using-bluetooth-headphones-with-zoom-on-android-ios' },
  'transfer-device': { default: 'transferring-meetings-and-webinars-between-devices' },
  'join-muted': {
    Windows: 'muting-your-microphone-when-joining-a-zoom-meeting',
    Mac: 'muting-your-microphone-when-joining-a-zoom-meeting',
    iPhone: null,
    Android: null,
  },
  'join-video-preference': { default: 'setting-your-video-to-stay-on-or-off-when-joining-meetings-and-webinars' },
  'meeting-volume': {
    Windows: 'adjusting-the-volume-of-a-zoom-meeting',
    Mac: 'adjusting-the-volume-of-a-zoom-meeting',
    iPhone: null,
    Android: null,
  },
  'auto-computer-audio': { default: 'automatically-joining-meetings-with-computer-audio' },
  'multiple-audio-input-channels': { default: 'enabling-and-managing-multiple-audio-input-channels-in-zoom' },
  'participants-before-join': { default: 'viewing-participants-already-in-a-meeting-before-joining' },
}

export function recommendedProcessForRoute(route, { device = null, state = null } = {}) {
  if (!route) return null
  const routing = COMMON_ISSUE_PROCESS_ROUTING[route.id]

  let processId = null
  if (routing && state && Object.prototype.hasOwnProperty.call(routing, state)) processId = routing[state]
  else if (routing && device && Object.prototype.hasOwnProperty.call(routing, device)) processId = routing[device]
  else if (routing && Object.prototype.hasOwnProperty.call(routing, 'default')) processId = routing.default
  else processId = route.processIds?.[0] || null

  if (!processId || !route.processIds?.includes(processId)) return null
  return processId
}

export function routeDecisionExplanation(route, { device = null, state = null, processId = null, role = null } = {}) {
  if (!route || !processId) return null

  const routing = COMMON_ISSUE_PROCESS_ROUTING[route.id] || {}
  const deviceValues = Object.entries(routing)
    .filter(([key, value]) => key !== 'default' && value)
    .map(([, value]) => value)
  const deviceChangesProcess = new Set(deviceValues).size > 1
  const stateMatched = Boolean(state && Object.prototype.hasOwnProperty.call(routing, state))
  const deviceMatched = Boolean(device && Object.prototype.hasOwnProperty.call(routing, device))

  let matchReason = `Symptom matched: ${route.classification}.`
  if (stateMatched) {
    matchReason = `Exact screen state matched: ${state}.`
  } else if (deviceMatched && deviceChangesProcess) {
    matchReason = `Device-specific match: ${device}. This symptom uses a different approved guide for this device path.`
  } else if (deviceMatched) {
    matchReason = `Device confirmed: ${device}. The approved guide stays the same, and the device is carried into its supported path.`
  } else if (device) {
    matchReason = `Device retained: ${device}. This reviewed symptom maps to the same approved guide across its supported devices.`
  }

  const source = orderedSourcesForRoute(route, { device, processId, state })[0] ?? route.primarySource ?? null

  return {
    matchReason,
    sourceTitle: source?.title ?? null,
    contextNote: role
      ? `${role} is retained as call context; caller role did not change this recommendation.`
      : null,
  }
}

const COMMON_ISSUE_SOURCE_PREFERENCES = {
  'cant-join': {
    byDevice: {
      Windows: 'KB0068749',
      Mac: 'KB0068749',
      Browser: 'KB0068749',
      iPhone: 'KB0060732',
      Android: 'KB0060732',
    },
    byProcess: {
      'troubleshooting-when-you-cant-join-a-zoom-meeting': 'KB0068749',
      'joining-a-zoom-meeting': 'KB0060732',
    },
  },
  'cant-hear': {
    byDevice: {
      Windows: 'KB0060836',
      Mac: 'KB0060836',
      iPhone: 'KB0066222',
      Android: 'KB0066222',
      Browser: 'KB0062765',
    },
    byProcess: {
      'troubleshooting-speaker-or-microphone-issues-in-the-zoom-desktop-app': 'KB0060836',
      'troubleshooting-speaker-or-microphone-issues-on-a-mobile-device': 'KB0066222',
      'testing-your-audio-settings-for-zoom-meetings': 'KB0062765',
      'zoom-audio-troubleshooting': 'KB0062765',
    },
  },
  'cant-be-heard': {
    byDevice: {
      Windows: 'KB0060836',
      Mac: 'KB0060836',
      iPhone: 'KB0066222',
      Android: 'KB0066222',
      Browser: 'KB0062765',
    },
    byProcess: {
      'troubleshooting-speaker-or-microphone-issues-in-the-zoom-desktop-app': 'KB0060836',
      'troubleshooting-speaker-or-microphone-issues-on-a-mobile-device': 'KB0066222',
      'zoom-audio-troubleshooting': 'KB0062765',
    },
  },
  'camera-not-working': {
    byDevice: {
      Windows: 'KB0068908',
      Mac: 'KB0068908',
      iPhone: 'KB0061836',
      Android: 'KB0061836',
    },
    byProcess: {
      'zoom-camera-troubleshooting-during-a-meeting': 'KB0068908',
      'testing-your-video-in-zoom': 'KB0061836',
      'showing-and-hiding-your-video-in-a-zoom-meeting': 'KB0061836',
    },
  },
  'waiting-entry': {
    byState: {
      'Waiting for host': 'KB0061476',
      'Waiting Room': 'KB0063329',
      'Scheduled for a different date or time': 'KB0061476',
    },
  },
}

function articleIdFromSource(source) {
  return source?.url?.match(/sysparm_article=(KB\d+)/i)?.[1] ?? null
}

export function orderedSourcesForRoute(route, { device = null, processId = null, state = null } = {}) {
  if (!route) return []

  const sources = [route.primarySource, ...(route.supportingSources || [])]
    .filter(source => source?.url)

  const preferences = COMMON_ISSUE_SOURCE_PREFERENCES[route.id] || {}
  const preferredArticle = preferences.byProcess?.[processId]
    || preferences.byState?.[state]
    || preferences.byDevice?.[device]
    || null

  if (!preferredArticle) return sources

  return [...sources].sort((a, b) => {
    const aPreferred = articleIdFromSource(a) === preferredArticle ? 1 : 0
    const bPreferred = articleIdFromSource(b) === preferredArticle ? 1 : 0
    return bPreferred - aPreferred
  })
}

export function preferredSourceForRoute(route, context = {}) {
  return orderedSourcesForRoute(route, context)[0] ?? null
}

const COMMON_ISSUE_END_PATHS = {
  'cant-join': [
    {
      routeId: 'waiting-entry',
      condition: 'Zoom connected and now shows Waiting Room, Waiting for host, or a scheduled-time message.',
      reason: 'This is now an entry-state issue rather than a join failure.',
    },
    {
      routeId: 'secure-connection',
      devices: ['Mac'],
      condition: 'The exact “Unable to establish secure connection to Zoom” message appears on macOS.',
      reason: 'Use the approved macOS secure-connection route only for that exact error.',
    },
  ],
  'cant-hear': [
    {
      routeId: 'bluetooth-headset',
      condition: 'The caller is using Bluetooth headphones or a Bluetooth headset.',
      reason: 'Bluetooth connection and Zoom speaker selection have their own approved path.',
    },
    {
      routeId: 'meeting-volume',
      condition: 'Audio is working, but the whole meeting is simply too loud or too quiet.',
      reason: 'That is a volume-control symptom, not a no-audio symptom.',
    },
  ],
  'cant-be-heard': [
    {
      routeId: 'bluetooth-headset',
      condition: 'The caller is using a Bluetooth headset or Bluetooth microphone.',
      reason: 'Bluetooth microphone selection has its own approved device path.',
    },
    {
      routeId: 'multiple-audio-input-channels',
      devices: ['Windows', 'Mac'],
      condition: 'The caller specifically needs to choose among three or more audio input channels.',
      reason: 'Use the approved multi-input-channel process only when that feature is actually involved.',
    },
  ],
  'camera-not-working': [
    {
      routeId: 'join-video-preference',
      condition: 'The camera works, but the concern is whether video starts on or off when joining.',
      reason: 'That is a join preference rather than a camera failure.',
    },
  ],
  'waiting-entry': [
    {
      routeId: 'cant-join',
      condition: 'The caller is not actually reaching a Waiting Room/host-waiting screen and instead gets a join error.',
      reason: 'Return to the join-failure route when Zoom never reaches the waiting state.',
    },
  ],
  'cant-share': [
    {
      routeId: 'meeting-controls',
      condition: 'The problem is only locating the Share control or meeting toolbar.',
      reason: 'Use the controls route when sharing has not actually started yet.',
    },
  ],
  chat: [
    {
      routeId: 'meeting-controls',
      condition: 'Several meeting controls are missing or the caller cannot reveal the toolbar.',
      reason: 'Use the broader controls route when the problem is not specific to Chat.',
    },
  ],
  'meeting-controls': [
    {
      routeId: 'chat',
      condition: 'The missing control is specifically Chat or sending a message.',
      reason: 'Chat has its own approved symptom route.',
    },
    {
      routeId: 'reactions',
      condition: 'The caller specifically needs Raise Hand or meeting reactions.',
      reason: 'Reactions have their own approved route and availability checks.',
    },
    {
      routeId: 'cant-share',
      condition: 'The caller can see the controls but cannot start screen sharing.',
      reason: 'Use the screen-sharing route for an actual sharing problem.',
    },
    {
      routeId: 'invite',
      condition: 'The caller specifically needs to invite someone or copy the current meeting invitation.',
      reason: 'Invitation controls have their own approved route and role boundary.',
    },
  ],
  reactions: [
    {
      routeId: 'meeting-controls',
      condition: 'The caller cannot reveal or locate multiple meeting controls, not just Reactions.',
      reason: 'Use the broader controls route when the symptom is no longer reaction-specific.',
    },
  ],
  invite: [
    {
      routeId: 'meeting-controls',
      condition: 'The caller cannot reveal or locate the meeting controls at all.',
      reason: 'Use the broader controls route before treating Invite as the only missing control.',
    },
  ],
  'secure-connection': [
    {
      routeId: 'cant-join',
      condition: 'The secure-connection message is gone, but the caller still cannot join for a different reason.',
      reason: 'Reclassify as a general join failure once the exact secure-connection error no longer applies.',
    },
  ],
  'bluetooth-headset': [
    {
      routeId: 'cant-hear',
      condition: 'Bluetooth is connected, but the caller still cannot hear meeting audio.',
      reason: 'Continue with the approved audio-output symptom route.',
    },
    {
      routeId: 'cant-be-heard',
      condition: 'Bluetooth is connected, but other participants still cannot hear the caller.',
      reason: 'Continue with the approved microphone-input symptom route.',
    },
  ],
  'join-muted': [
    {
      routeId: 'cant-be-heard',
      condition: 'The join-muted preference is correct, but the microphone still does not transmit after unmuting.',
      reason: 'That is now a microphone-input symptom rather than a join preference.',
    },
  ],
  'join-video-preference': [
    {
      routeId: 'camera-not-working',
      condition: 'The join preference is correct, but the camera still shows no usable video.',
      reason: 'That is now a camera-function symptom.',
    },
  ],
  'meeting-volume': [
    {
      routeId: 'cant-hear',
      condition: 'There is no meeting audio at all rather than audio that is merely too loud or too quiet.',
      reason: 'Use the no-audio route when volume controls are not the actual issue.',
    },
  ],
  'auto-computer-audio': [
    {
      routeId: 'cant-hear',
      condition: 'Zoom connects to meeting audio, but the caller cannot hear anyone.',
      reason: 'The connection preference worked; continue with audio-output troubleshooting.',
    },
    {
      routeId: 'cant-be-heard',
      condition: 'Zoom connects to meeting audio, but other participants cannot hear the caller.',
      reason: 'The connection preference worked; continue with microphone-input troubleshooting.',
    },
  ],
  'multiple-audio-input-channels': [
    {
      routeId: 'cant-be-heard',
      condition: 'The multi-channel setup is not the issue and Zoom simply is not detecting the caller’s microphone.',
      reason: 'Use the standard microphone-input symptom route.',
    },
  ],
  'participants-before-join': [
    {
      routeId: 'waiting-entry',
      condition: 'The caller has started joining and is now waiting for the host or in the Waiting Room.',
      reason: 'Use the entry-state route once the caller is already in the join flow.',
    },
  ],
}

export function approvedEndPathsForProcess(processId, { sourceRouteId = null, device = null } = {}) {
  const basisRoutes = sourceRouteId
    ? COMMON_ISSUE_ROUTES.filter(route => route.id === sourceRouteId && route.processIds?.includes(processId))
    : COMMON_ISSUE_ROUTES.filter(route => route.processIds?.includes(processId))

  const seen = new Set()
  const output = []

  for (const basisRoute of basisRoutes) {
    for (const option of COMMON_ISSUE_END_PATHS[basisRoute.id] || []) {
      if (option.routeId === sourceRouteId || seen.has(option.routeId)) continue
      if (option.devices?.length && (!device || !option.devices.includes(device))) continue

      const target = COMMON_ISSUE_ROUTES.find(route => route.id === option.routeId)
      if (!target) continue
      if (target.supportedDevices?.length && device && !target.supportedDevices.includes(device)) continue

      seen.add(option.routeId)
      output.push({
        ...option,
        route: target,
        fromRouteId: basisRoute.id,
      })
    }
  }

  return output.slice(0, 4)
}

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
  const normalizedQuery = normalizeSearchText(query)

  const exactPhraseMatches = normalizedQuery
    ? COMMON_ISSUE_ROUTES.filter(route => (
        normalizeSearchText(route.title) === normalizedQuery
        || route.searchPhrases.some(phrase => normalizeSearchText(phrase) === normalizedQuery)
      ))
    : []

  const rankedMatches = searchProcesses(routeSearchDocs, query)
    .map(result => routesById.get(result.id))
    .filter(Boolean)

  const seen = new Set()
  return [...exactPhraseMatches, ...rankedMatches].filter(route => {
    if (seen.has(route.id)) return false
    seen.add(route.id)
    return true
  })
}
