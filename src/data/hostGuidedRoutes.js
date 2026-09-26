import { HOST_ROADBLOCKS } from './arbitratorHostSupport'

const roadblockIds = new Set(HOST_ROADBLOCKS.map(item => item.id))

export const HOST_GUIDED_ROUTE_SOURCE_POLICY = {
  clientSource: 'Zoom Basic Support Boundaries, Decision Path, and Referral for Additional Assistance',
  zoomSourceRule: 'Use current official Zoom Support only for product behavior, UI labels, and basic troubleshooting steps that stay within the client-approved Tier 1 boundary.',
  conflictRule: 'If generic Zoom capability conflicts with the client-approved program rule, follow the client-approved program rule.',
  unknownRule: 'If neither the client process nor official Zoom Support supports the action, do not invent a step. Mark it as a coverage gap.',
}

export const HOST_GUIDED_ROUTES = [
  {
    id: 'host-start-hearing-guided',
    topicId: 'host-start-hearing',
    title: 'Start or join the hearing as host',
    sourceStatus: 'client+zoom-verified',
    sourceRefs: {
      clientSections: ['Scope of Support', 'Host and Meeting-Level Controls', 'Roadblock Matrix'],
      zoom: [{
        articleId: 'KB0061821',
        title: 'Starting or joining a meeting as the host',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0061821',
      }],
    },
    confirmBeforeProceeding: [
      {
        id: 'assigned-signin',
        prompt: 'Is the arbitrator signed in to Zoom using the assigned credentials for the hearing?',
        yes: { next: 'identify-platform' },
        no: { next: 'guide-assigned-signin' },
        unsure: { next: 'guide-assigned-signin' },
      },
      {
        id: 'identify-platform',
        prompt: 'Which Zoom platform is the arbitrator using?',
        options: ['Windows/macOS desktop app', 'Zoom Web App', 'Android/iOS mobile app'],
      },
      {
        id: 'scheduled-meeting-visible',
        prompt: 'After signing in, can the arbitrator see the scheduled hearing in Home, Meetings, or Calendar?',
        yes: { next: 'start-scheduled-hearing' },
        no: { next: 'roadblock', roadblockId: 'roadblock-account-permission' },
      },
    ],
    steps: [
      {
        id: 'guide-assigned-signin',
        instruction: 'Guide the arbitrator to sign in with the assigned Zoom credentials before trying to start the hearing.',
        confirm: 'After signing in, can they see Home, Meetings, or Calendar and the scheduled hearing?',
        no: { next: 'roadblock', roadblockId: 'roadblock-account-permission' },
      },
      {
        id: 'start-scheduled-hearing',
        platformInstructions: {
          desktop: 'Open Home, Meetings, or Calendar, select the scheduled hearing, then choose Start.',
          web: 'In the Zoom Web App, open Home, Meetings, or Calendar, select the scheduled hearing, then choose Start.',
          mobile: 'Open Home, Meetings, or Calendar, locate the scheduled hearing, then tap Start.',
        },
        confirm: 'Did the hearing open and do host-level controls appear?',
        yes: { next: 'resolved' },
        no: { next: 'host-control-check' },
      },
      {
        id: 'host-control-check',
        instruction: 'Confirm again that the arbitrator is signed in with the assigned account and entered the correct scheduled hearing.',
        confirm: 'Do host controls appear after confirming the sign-in and hearing?',
        yes: { next: 'resolved' },
        no: { next: 'roadblock', roadblockId: 'roadblock-account-permission' },
      },
    ],
    scripts: {
      opening: 'Let’s first confirm you’re signed in with the Zoom credentials assigned for this hearing, then we’ll locate the scheduled meeting and start it.',
      resolved: 'You’re now in the scheduled hearing with the host controls available.',
      boundary: 'We confirmed the assigned sign-in and the scheduled hearing, but the remaining issue appears to require account, role, license, or administrative review.',
    },
    documentation: {
      resolved: 'Confirmed assigned Zoom sign-in, located the scheduled hearing, and verified host controls were available.',
      roadblock: 'Confirmed assigned Zoom sign-in and attempted to access the scheduled hearing; host/account access issue remained and Tier 1 boundary was reached.',
    },
  },
  {
    id: 'host-meeting-id-guided',
    topicId: 'host-meeting-id-passcode',
    title: 'Meeting link, ID, or passcode is not working',
    sourceStatus: 'client+zoom-verified',
    sourceRefs: {
      clientSections: ['Incorrect/uncertain meeting link, ID, passcode, date, or time', 'Unable to join after approved basic joining troubleshooting'],
      zoom: [
        {
          articleId: 'KB0068841',
          title: 'Troubleshooting invalid Zoom meeting ID',
          url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0068841',
        },
        {
          articleId: 'KB0065196',
          title: 'Frequently asked questions about meeting and webinar IDs',
          url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0065196',
        },
      ],
    },
    confirmBeforeProceeding: [
      {
        id: 'exact-error',
        prompt: 'What exact error or message does Zoom show?',
        captureAs: 'errorMessage',
      },
      {
        id: 'provided-details',
        prompt: 'Is the arbitrator using the link, Meeting ID, and passcode exactly as provided in their hearing/welcome information?',
        yes: { next: 'manual-entry' },
        no: { next: 'review-provided-details' },
        unsure: { next: 'review-provided-details' },
      },
    ],
    steps: [
      {
        id: 'review-provided-details',
        instruction: 'Review only the details the arbitrator already received. Do not create, modify, or independently validate hearing details.',
        confirm: 'Do the link, Meeting ID, and passcode now match the information they were provided?',
        yes: { next: 'manual-entry' },
        no: { next: 'roadblock', roadblockId: 'roadblock-meeting-details' },
      },
      {
        id: 'manual-entry',
        platformInstructions: {
          desktop: 'Open Zoom, choose Join, enter the Meeting ID, choose Join, then enter the passcode when prompted.',
          mobile: 'Open Zoom, choose Join, enter the Meeting ID, tap Join, then enter the passcode.',
          web: 'Use the provided meeting link or the supported Zoom join page; do not independently create or change meeting details.',
        },
        confirm: 'Does Zoom accept the Meeting ID and passcode?',
        yes: { next: 'resolved' },
        no: { next: 'host-validity-check' },
      },
      {
        id: 'host-validity-check',
        instruction: 'Because the caller is the arbitrator/host, confirm whether the scheduled hearing appears in their Zoom meeting list while signed in with the assigned account.',
        confirm: 'Does the scheduled hearing appear in the assigned account?',
        yes: { next: 'roadblock', roadblockId: 'roadblock-meeting-details' },
        no: { next: 'roadblock', roadblockId: 'roadblock-account-permission' },
      },
    ],
    scripts: {
      opening: 'Let’s compare the meeting details you received and try the Meeting ID and passcode manually without changing any hearing information.',
      resolved: 'Zoom accepted the meeting information and you can continue into the hearing.',
      boundary: 'We can review the information you received, but we cannot independently change or verify proceeding details. The remaining issue needs additional review.',
    },
    documentation: {
      resolved: 'Reviewed provided hearing details and successfully joined using the supplied Meeting ID/passcode.',
      roadblock: 'Reviewed provided hearing details and attempted manual entry; issue remained and required meeting/account verification outside Tier 1 scope.',
    },
  },
  {
    id: 'host-controls-guided',
    topicId: 'host-controls-missing',
    title: 'Host controls are missing',
    sourceStatus: 'client+zoom-verified',
    sourceRefs: {
      clientSections: ['Host-controlled feature or permission', 'Quick Guide / Host meeting control'],
      zoom: [{
        articleId: 'KB0065164',
        title: 'Using host and co-host controls in a meeting',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0065164',
      }],
    },
    confirmBeforeProceeding: [
      {
        id: 'signed-in',
        prompt: 'Is the arbitrator signed in with the assigned Zoom credentials?',
        yes: { next: 'inside-hearing' },
        no: { next: 'sign-in-first' },
        unsure: { next: 'sign-in-first' },
      },
      {
        id: 'inside-hearing',
        prompt: 'Is the arbitrator already inside the correct hearing?',
        yes: { next: 'control-name' },
        no: { next: 'host-start-hearing-guided' },
      },
      {
        id: 'control-name',
        prompt: 'Which host control is missing or unavailable?',
        captureAs: 'requestedControl',
      },
    ],
    steps: [
      {
        id: 'sign-in-first',
        instruction: 'Have the arbitrator sign in with the assigned credentials, then re-enter the correct scheduled hearing.',
        confirm: 'Are host-level controls now visible?',
        yes: { next: 'resolved' },
        no: { next: 'roadblock', roadblockId: 'roadblock-account-permission' },
      },
      {
        id: 'locate-toolbar',
        instruction: 'In a host session, locate the meeting controls toolbar. Hosts have additional meeting-management controls beyond standard participant controls.',
        confirm: 'Can the arbitrator now see and use the requested meeting-level control?',
        yes: { next: 'resolved' },
        no: { next: 'roadblock', roadblockId: 'roadblock-account-permission' },
      },
    ],
    scripts: {
      opening: 'As the meeting host, you should have the available host controls when signed in with your assigned credentials. Let’s verify the sign-in and the specific control you need.',
      resolved: 'The host control is available and working at the meeting level.',
      boundary: 'The control remains unavailable after confirming the assigned sign-in. This appears to require account, role, license, or locked-setting review.',
    },
    documentation: {
      resolved: 'Confirmed assigned sign-in and located the requested host meeting control.',
      roadblock: 'Confirmed assigned sign-in and correct hearing; requested host control remained unavailable, indicating an account/role/permission roadblock.',
    },
  },
  {
    id: 'host-waiting-room-guided',
    topicId: 'host-waiting-room',
    title: 'Admit a participant from the Waiting Room',
    sourceStatus: 'client+zoom-verified',
    sourceRefs: {
      clientSections: ['Waiting Room admission'],
      zoom: [{
        articleId: 'KB0063329',
        title: 'Using waiting room during a meeting',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0063329',
      }],
    },
    programRules: [
      'Waiting Room is OFF by default for this program.',
      'If the arbitrator enabled Waiting Room, Tier 1 may guide the signed-in arbitrator through admitting participants.',
      'Do not change locked account-level settings.',
    ],
    confirmBeforeProceeding: [
      {
        id: 'signed-in-host',
        prompt: 'Is the arbitrator signed in with assigned credentials and showing host controls?',
        yes: { next: 'waiting-room-enabled' },
        no: { next: 'host-controls-guided' },
      },
      {
        id: 'waiting-room-enabled',
        prompt: 'Is Waiting Room enabled for this hearing, and does the arbitrator see someone waiting?',
        yes: { next: 'admit-participant' },
        no: { next: 'clarify-waiting-room' },
        unsure: { next: 'clarify-waiting-room' },
      },
    ],
    steps: [
      {
        id: 'clarify-waiting-room',
        instruction: 'Explain that Waiting Room is off by default for this program. If the arbitrator turned it on for the current meeting, locate Participants and check for a Waiting Room section.',
        confirm: 'Is a Waiting Room section visible with the participant listed?',
        yes: { next: 'admit-participant' },
        no: { next: 'roadblock', roadblockId: 'roadblock-account-permission' },
      },
      {
        id: 'admit-participant',
        platformInstructions: {
          desktop: 'Click Participants. In the Waiting Room section, choose Admit next to the intended participant, or Admit all only if the arbitrator intends to admit everyone.',
          web: 'Click Participants, then choose Admit for the waiting participant.',
          mobile: 'Tap Participants, then tap Admit next to the intended participant. Admit all is also available when appropriate.',
        },
        confirm: 'Did the intended participant enter the hearing?',
        yes: { next: 'resolved' },
        no: { next: 'roadblock', roadblockId: 'roadblock-account-permission' },
      },
    ],
    scripts: {
      opening: 'Waiting Room is off by default. If you enabled it, let’s confirm you’re signed in as host and locate the participant waiting to be admitted.',
      resolved: 'The participant has been admitted from the Waiting Room.',
      boundary: 'We confirmed the host sign-in and Waiting Room controls, but the remaining behavior appears to be controlled outside the meeting-level access we support.',
    },
    documentation: {
      resolved: 'Confirmed host sign-in and guided the arbitrator through admitting the participant from Waiting Room.',
      roadblock: 'Confirmed host sign-in and checked Waiting Room; meeting/account permission issue remained outside Tier 1 meeting-level control.',
    },
  },
  {
    id: 'host-mute-unmute-guided',
    topicId: 'host-mute-unmute-participants',
    title: 'Mute a participant or ask them to unmute',
    sourceStatus: 'client+zoom-verified',
    sourceRefs: {
      clientSections: ['Zoom Interface and Meeting Controls', 'Host and Meeting-Level Controls'],
      zoom: [{
        articleId: 'KB0066716',
        title: 'Muting or unmuting participants in a meeting',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0066716',
      }],
    },
    confirmBeforeProceeding: [
      {
        id: 'signed-in-host',
        prompt: 'Is the arbitrator in the hearing as host and able to open Participants?',
        yes: { next: 'audio-action' },
        no: { next: 'host-controls-guided' },
      },
      {
        id: 'audio-action',
        prompt: 'What do they need to do?',
        options: ['Mute one participant', 'Mute all participants', 'Ask one participant to unmute', 'Ask all participants to unmute'],
      },
    ],
    steps: [
      {
        id: 'open-participants',
        instruction: 'Open Participants and locate the intended participant or the meeting-level controls at the bottom of the participant list.',
        confirm: 'Is the needed Mute, Ask to Unmute, Mute all, or Ask all to unmute option visible?',
        yes: { next: 'perform-audio-action' },
        no: { next: 'roadblock', roadblockId: 'roadblock-account-permission' },
      },
      {
        id: 'perform-audio-action',
        instruction: 'Guide the arbitrator to use Mute or Ask to Unmute for an individual, or the corresponding all-participant option. Direct unmute is only available when the participant has already given the required consent.',
        confirm: 'Did the mute take effect or did the participant receive the unmute prompt?',
        yes: { next: 'resolved' },
        no: { next: 'roadblock', roadblockId: 'roadblock-account-permission' },
      },
    ],
    scripts: {
      opening: 'Let’s open Participants and identify whether you want to mute someone or ask them to unmute.',
      resolved: 'The participant audio control worked as expected.',
      boundary: 'The expected meeting-level control is unavailable after confirming host access, so the remaining issue needs permission/account review.',
    },
    documentation: {
      resolved: 'Guided the host through participant audio controls and confirmed the requested mute/unmute action or prompt.',
      roadblock: 'Host access was confirmed but the required participant audio control remained unavailable due to a permission/account roadblock.',
    },
  },
  {
    id: 'host-screen-share-guided',
    topicId: 'host-screen-share',
    title: 'Share the host screen or allow a participant to share',
    sourceStatus: 'client+zoom-verified',
    sourceRefs: {
      clientSections: ['Zoom Interface and Meeting Controls', 'Host-controlled feature or permission'],
      zoom: [{
        articleId: 'KB0058641',
        title: 'Allowing or preventing your meeting participants from screen sharing',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0058641',
      }],
    },
    confirmBeforeProceeding: [
      {
        id: 'share-who',
        prompt: 'Who needs to share?',
        options: ['The arbitrator/host', 'A participant'],
      },
      {
        id: 'host-status',
        prompt: 'Is the arbitrator signed in as host and able to see the Share control?',
        yes: { next: 'share-path' },
        no: { next: 'host-controls-guided' },
      },
    ],
    steps: [
      {
        id: 'share-path',
        instruction: 'If the host is sharing, use the normal Share control. If a participant needs permission, use the current meeting-level host sharing controls.',
        confirm: 'Is this a current-meeting sharing action, rather than a request to change the permanent/default account setting?',
        yes: { next: 'meeting-level-share' },
        no: { next: 'roadblock', roadblockId: 'roadblock-account-permission' },
      },
      {
        id: 'meeting-level-share',
        platformInstructions: {
          desktop: 'Next to Share, click the up arrow, open Host tools for share, and set Who can share? to All participants when the arbitrator intends to allow participant sharing for this session.',
          web: 'Next to Share, click the up arrow, open Advanced Sharing Options, and set Who can share? to All Participants when appropriate for this session.',
          mobile: 'Open More > Host tools > Participants and use the Share screen participant permission for the current meeting when available.',
        },
        confirm: 'Can the intended person now start sharing?',
        yes: { next: 'resolved' },
        no: { next: 'roadblock', roadblockId: 'roadblock-account-permission' },
      },
    ],
    scripts: {
      opening: 'Let’s first confirm whether you need to share your own screen or allow a participant to share, then we’ll use only the current meeting-level control.',
      resolved: 'Screen sharing is now working for the intended person in this meeting.',
      boundary: 'The current meeting-level sharing controls are not enough; the remaining change appears to require a locked or administrator-controlled setting.',
    },
    documentation: {
      resolved: 'Confirmed host access and guided current-meeting screen sharing/participant-sharing permission successfully.',
      roadblock: 'Current-meeting sharing controls were checked; the remaining screen-sharing restriction appeared to require account/admin-level access.',
    },
  },
  {
    id: 'host-audio-guided',
    topicId: 'host-audio',
    title: 'Host microphone, speaker, or headset problem',
    sourceStatus: 'client+zoom-verified',
    sourceRefs: {
      clientSections: ['Audio and Video Troubleshooting', 'Microphone, speaker, or camera not recognized by the device itself'],
      zoom: [
        {
          articleId: 'KB0060836',
          title: 'Troubleshooting speaker or microphone issues in the desktop app',
          url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0060836',
        },
        {
          articleId: 'KB0062765',
          title: 'Testing your audio settings for Zoom meetings',
          url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062765',
        },
        {
          articleId: 'KB0066222',
          title: 'Troubleshooting speaker or microphone issues on your mobile device',
          url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0066222',
        },
      ],
    },
    confirmBeforeProceeding: [
      {
        id: 'symptom',
        prompt: 'What is the exact audio problem?',
        options: ['Arbitrator cannot hear others', 'Others cannot hear the arbitrator', 'Both directions', 'Bluetooth/headset issue'],
      },
      {
        id: 'audio-device',
        prompt: 'What audio device are they using?',
        options: ['Built-in microphone/speaker', 'Wired headset', 'USB headset/device', 'Bluetooth headset/device'],
      },
      {
        id: 'os-detects-device',
        prompt: 'Does the computer or mobile device itself recognize the microphone/speaker/headset?',
        yes: { next: 'zoom-audio-checks' },
        no: { next: 'roadblock', roadblockId: 'roadblock-device-hardware' },
        unsure: { next: 'basic-connection-check' },
      },
    ],
    steps: [
      {
        id: 'basic-connection-check',
        instruction: 'Confirm the device is connected, powered on, and not physically muted. For Bluetooth, confirm it is turned on and connected to the same device running Zoom.',
        confirm: 'Does the operating system/device now recognize the audio hardware?',
        yes: { next: 'zoom-audio-checks' },
        no: { next: 'roadblock', roadblockId: 'roadblock-device-hardware' },
      },
      {
        id: 'zoom-audio-checks',
        platformInstructions: {
          desktop: 'In Zoom Settings > Audio, test/select the intended Speaker and Microphone. During a meeting, the up arrow beside Mute can also be used to change the active microphone or speaker.',
          mobile: 'Confirm Zoom audio is connected, device volume is up, the microphone is not muted, and Zoom has the basic microphone permission supported by the device.',
          web: 'Use only the basic audio controls visibly available in the Zoom Web App. If browser/device permission becomes the blocker and cannot be resolved with approved basic checks, stop at the appropriate device/permission boundary.',
        },
        confirm: 'Can the arbitrator hear the test/output and does Zoom detect microphone input?',
        yes: { next: 'resolved' },
        no: { next: 'permission-check' },
      },
      {
        id: 'permission-check',
        instruction: 'Confirm Zoom has normal microphone access on the device. Do not bypass managed-device or security restrictions.',
        confirm: 'Is the issue resolved with normal Zoom/device permission enabled?',
        yes: { next: 'resolved' },
        no: { next: 'roadblock', roadblockId: 'roadblock-managed-permission' },
      },
    ],
    scripts: {
      opening: 'Let’s identify whether this is the speaker, microphone, or headset, then confirm the device itself can see the hardware before we change anything in Zoom.',
      resolved: 'The correct audio device is selected and Zoom audio is working.',
      boundary: 'The approved Zoom audio checks are complete, but the remaining issue is at the device, managed-permission, or hardware level.',
    },
    documentation: {
      resolved: 'Confirmed audio hardware connection, selected/tested the correct Zoom speaker/microphone, and verified audio operation.',
      roadblock: 'Completed approved Zoom audio/device checks; hardware or device-level permission remained unresolved outside Tier 1 scope.',
    },
  },
  {
    id: 'host-camera-guided',
    topicId: 'host-camera',
    title: 'Host camera is not working',
    sourceStatus: 'client+zoom-verified',
    sourceRefs: {
      clientSections: ['Audio and Video Troubleshooting', 'Microphone, speaker, or camera not recognized by the device itself'],
      zoom: [
        {
          articleId: 'KB0068908',
          title: 'Troubleshooting camera issues during a meeting',
          url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0068908',
        },
        {
          articleId: 'KB0061836',
          title: 'Testing your video',
          url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0061836',
        },
      ],
    },
    confirmBeforeProceeding: [
      {
        id: 'video-state',
        prompt: 'Is video simply turned off, or is Zoom trying to use a camera but showing no image?',
        options: ['Video is off', 'No image/black preview', 'Wrong camera selected', 'Camera missing from Zoom'],
      },
      {
        id: 'os-detects-camera',
        prompt: 'Does the device or operating system recognize the camera?',
        yes: { next: 'zoom-camera-check' },
        no: { next: 'roadblock', roadblockId: 'roadblock-device-hardware' },
        unsure: { next: 'zoom-camera-check' },
      },
    ],
    steps: [
      {
        id: 'zoom-camera-check',
        platformInstructions: {
          desktop: 'In the meeting, use the arrow next to Start/Stop Video > Video Settings. If more than one camera is available, select the intended camera and check the preview.',
          web: 'Use the camera selector/permission controls exposed by the Zoom Web App and browser. If the device or managed browser blocks camera access beyond basic permission checks, stop at the permission boundary.',
          mobile: 'Use the Zoom mobile video control and normal device camera permission. Do not bypass managed-device restrictions.',
        },
        confirm: 'Does the intended camera now show a preview or live video?',
        yes: { next: 'resolved' },
        no: { next: 'camera-permission-check' },
      },
      {
        id: 'camera-permission-check',
        instruction: 'Confirm Zoom has normal camera access and that another application is not actively blocking the camera. Do not bypass managed security controls.',
        confirm: 'Does the camera now work in Zoom?',
        yes: { next: 'resolved' },
        no: { next: 'roadblock', roadblockId: 'roadblock-managed-permission' },
      },
    ],
    scripts: {
      opening: 'Let’s confirm whether Zoom can see the camera and whether the correct camera is selected.',
      resolved: 'The correct camera is selected and video is working in Zoom.',
      boundary: 'Zoom still cannot use the camera after the approved checks, so the remaining issue is at the device or permission level.',
    },
    documentation: {
      resolved: 'Confirmed camera availability, selected/tested the intended camera in Zoom, and verified video.',
      roadblock: 'Completed approved Zoom camera checks; device recognition or permission issue remained outside Tier 1 scope.',
    },
  },
  {
    id: 'host-recording-guided',
    topicId: 'host-recording-basic',
    title: 'Recording indicator or request to stop/change recording',
    sourceStatus: 'client-rule-overrides-generic-zoom-capability',
    sourceRefs: {
      clientSections: ['Recording-Related Basic Checks', 'Privacy, recording, confidentiality, or proceeding-policy question'],
      zoom: [
        {
          articleId: 'KB0067954',
          title: 'Enabling and disabling automatic recording',
          url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0067954',
        },
        {
          articleId: 'KB0062627',
          title: 'Starting a cloud recording',
          url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062627',
        },
      ],
    },
    programRules: [
      'The program requires/uses automatic recording as defined by the client process.',
      'Tier 1 may identify the recording indicator and explain basic Zoom controls.',
      'Tier 1 must not change required recording settings or interpret recording/privacy/confidentiality policy.',
      'Generic Zoom documentation may show pause/stop or automatic-recording settings, but those actions are not an instruction for this program when they conflict with the client rule.',
    ],
    confirmBeforeProceeding: [
      {
        id: 'recording-question-type',
        prompt: 'What is the arbitrator asking?',
        options: ['What does the recording indicator mean?', 'Can I stop/pause/change the recording?', 'Is recording allowed?', 'Privacy/confidentiality question'],
        optionBranches: {
          'What does the recording indicator mean?': { next: 'indicator-only' },
          'Can I stop/pause/change the recording?': { next: 'roadblock', roadblockId: 'roadblock-proceeding-policy' },
          'Is recording allowed?': { next: 'roadblock', roadblockId: 'roadblock-proceeding-policy' },
          'Privacy/confidentiality question': { next: 'roadblock', roadblockId: 'roadblock-proceeding-policy' },
        },
      },
    ],
    steps: [
      {
        id: 'indicator-only',
        instruction: 'If the question is only about the interface, identify the recording indicator and explain the current recording state shown by Zoom.',
        confirm: 'Is the question fully answered without changing recording settings or interpreting policy?',
        yes: { next: 'resolved' },
        no: { next: 'roadblock', roadblockId: 'roadblock-proceeding-policy' },
      },
      {
        id: 'change-or-policy-request',
        instruction: 'Do not guide the arbitrator to disable required automatic recording or interpret recording/privacy/confidentiality policy.',
        confirm: 'Does the request require a recording-setting change or a policy/authorization decision?',
        yes: { next: 'roadblock', roadblockId: 'roadblock-proceeding-policy' },
        no: { next: 'indicator-only' },
      },
    ],
    scripts: {
      opening: 'I can help identify what Zoom is showing for the recording, but I can’t change required recording settings or interpret recording/privacy policy.',
      resolved: 'The recording indicator/current state was explained without changing required settings.',
      boundary: 'This request requires a recording-setting change or policy decision outside Tier 1 Zoom support.',
    },
    documentation: {
      resolved: 'Explained the Zoom recording indicator/current recording state; no recording settings were changed.',
      roadblock: 'Recording question required a setting change or policy interpretation outside Tier 1 scope; advised next-step referral/escalation per approved process.',
    },
  },
]

export function guidedRouteById(id) {
  return HOST_GUIDED_ROUTES.find(route => route.id === id) || null
}

export function validateHostGuidedRoutes() {
  const errors = []
  for (const route of HOST_GUIDED_ROUTES) {
    if (!route.confirmBeforeProceeding?.length) errors.push(`${route.id}: missing confirmation gates`)
    if (!route.steps?.length) errors.push(`${route.id}: missing steps`)
    if (!route.documentation?.resolved || !route.documentation?.roadblock) errors.push(`${route.id}: missing documentation handoff text`)
    const routeStepIds = new Set((route.steps || []).map(step => step.id))
    const validateBranch = branch => {
      if (!branch) return
      if (branch.roadblockId && !roadblockIds.has(branch.roadblockId)) errors.push(`${route.id}: unknown roadblock ${branch.roadblockId}`)
      if (branch.next && !['resolved', 'roadblock'].includes(branch.next) && !routeStepIds.has(branch.next) && !HOST_GUIDED_ROUTES.some(item => item.id === branch.next)) {
        errors.push(`${route.id}: unknown next target ${branch.next}`)
      }
    }
    for (const gate of route.confirmBeforeProceeding || []) {
      for (const branch of [gate.yes, gate.no, gate.unsure].filter(Boolean)) validateBranch(branch)
      for (const branch of Object.values(gate.optionBranches || {})) validateBranch(branch)
    }
    for (const step of route.steps || []) {
      for (const branch of [step.yes, step.no].filter(Boolean)) validateBranch(branch)
    }
  }
  return errors
}
