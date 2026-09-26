export const HOST_SUPPORT_SCOPE_SOURCE = {
  title: 'Zoom Basic Support Boundaries, Decision Path, and Referral for Additional Assistance',
  role: 'Arbitrator / meeting host',
  principle: 'Resolve what is within approved basic Zoom support and stop when the remaining action requires access, authority, permissions, advanced device/network support, or a proceeding decision.',
}

export const HOST_SUPPORT_TOPICS = [
  {
    id: 'host-start-hearing',
    group: 'JOIN & ACCESS',
    title: 'I need to start or join my hearing as host',
    searchPhrases: ['start hearing', 'start meeting', 'join as host', 'host meeting', 'begin hearing'],
    scope: 'tier1',
    confirmBeforeProceeding: [
      'Is the arbitrator using the assigned Zoom credentials from the welcome email?',
      'Are they trying to start a scheduled hearing or join an already-open meeting?',
      'Which platform are they using: Windows, macOS, Linux, Zoom Web App, Android, or iOS?',
      'What exact screen or message do they see after signing in?',
    ],
    steps: [
      {
        instruction: 'Confirm the arbitrator is signed in with the assigned Zoom account used for the scheduled hearing.',
        confirm: 'Do they now see the scheduled meeting or the option to start it?',
      },
      {
        instruction: 'Guide them to start or join the scheduled meeting from the current Zoom app or web interface.',
        confirm: 'Did the meeting open with host-level controls available?',
      },
    ],
    resolvedWhen: 'The arbitrator enters the correct hearing and host controls are available.',
    stopWhen: [
      'The assigned account, role, license, or meeting ownership appears incorrect.',
      'The meeting details themselves need to be created, changed, or independently validated.',
    ],
    zoomSources: [
      {
        title: 'Starting or joining a meeting as the host',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0061821',
      },
    ],
  },
  {
    id: 'host-meeting-id-passcode',
    group: 'JOIN & ACCESS',
    title: 'The meeting link, ID, or passcode is not working',
    searchPhrases: ['invalid meeting id', 'meeting id not working', 'passcode not working', 'link not working', 'wrong meeting link'],
    scope: 'tier1-with-roadblock',
    confirmBeforeProceeding: [
      'What exact error message appears?',
      'Is the arbitrator using the meeting details exactly as provided in the welcome or hearing information?',
      'Have they already tried entering the Meeting ID and passcode manually?',
      'Have they already contacted the source from which they received their credentials/details?',
    ],
    steps: [
      {
        instruction: 'Review the meeting details the arbitrator already received without creating, modifying, or independently validating proceeding details.',
        confirm: 'Do the link, Meeting ID, and passcode match what the arbitrator was provided?',
      },
      {
        instruction: 'If appropriate, guide the arbitrator to enter the Meeting ID and passcode manually in Zoom.',
        confirm: 'Does Zoom now accept the meeting information?',
      },
    ],
    resolvedWhen: 'Zoom accepts the provided meeting information and the arbitrator reaches the hearing or expected entry state.',
    stopWhen: [
      'The meeting link, ID, passcode, date, or time needs independent verification or modification.',
      'The issue remains after approved basic joining checks and appears related to meeting/account access.',
    ],
    zoomSources: [
      {
        title: 'Troubleshooting invalid Zoom meeting ID',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0068841',
      },
    ],
  },
  {
    id: 'host-controls-missing',
    group: 'HOST CONTROLS',
    title: 'I do not see my host controls',
    searchPhrases: ['no host controls', 'missing host controls', 'not host', 'host tools missing', 'cant manage participants'],
    scope: 'tier1-with-roadblock',
    confirmBeforeProceeding: [
      'Is the arbitrator signed in with the assigned Zoom credentials?',
      'Did they start or join the hearing while signed in, rather than only joining through a link as an unsigned participant?',
      'Which host control are they trying to use?',
      'Is the control missing entirely, disabled, or visible but not working?',
    ],
    steps: [
      {
        instruction: 'Confirm the arbitrator is signed in with the assigned credentials and is in the correct hearing.',
        confirm: 'Do host-level controls now appear?',
      },
      {
        instruction: 'Locate the requested meeting-level control in the current Zoom interface and test only the permitted in-meeting action.',
        confirm: 'Can the arbitrator use the requested meeting-level control?',
      },
    ],
    resolvedWhen: 'The arbitrator is recognized as host and can use the permitted meeting-level control.',
    stopWhen: [
      'The remaining issue involves account role, license, administrative permission, or a locked account-level setting.',
      'Resolving it would require changing credentials or bypassing a locked permission.',
    ],
    zoomSources: [
      {
        title: 'Using host and co-host controls in a meeting',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0065164',
      },
      {
        title: 'Understanding roles in a Zoom meeting',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0064033',
      },
    ],
  },
  {
    id: 'host-waiting-room',
    group: 'HOST CONTROLS',
    title: 'I need to admit someone from the Waiting Room',
    searchPhrases: ['waiting room', 'admit participant', 'admit all', 'participant waiting', 'let someone in'],
    scope: 'tier1-with-roadblock',
    programNotes: [
      'Waiting Room is OFF by default for this program.',
      'If the arbitrator enabled it, Tier 1 can guide the signed-in arbitrator through admitting participants.',
    ],
    confirmBeforeProceeding: [
      'Is the arbitrator signed in with the assigned Zoom credentials and showing host controls?',
      'Did the arbitrator intentionally enable Waiting Room for this hearing?',
      'Do they see the participant in the Waiting Room section of Participants?',
    ],
    steps: [
      {
        instruction: 'Open Participants and locate the Waiting Room section.',
        confirm: 'Is the waiting participant listed there?',
      },
      {
        instruction: 'Guide the arbitrator to use Admit for the intended participant, or Admit all only if that is what the arbitrator intends.',
        confirm: 'Did the participant enter the meeting?',
      },
    ],
    resolvedWhen: 'The intended participant is admitted into the meeting.',
    stopWhen: [
      'The Waiting Room behavior is controlled by a locked account-level setting.',
      'The arbitrator does not have host controls after confirming the assigned sign-in.',
    ],
    zoomSources: [
      {
        title: 'Using waiting room during a meeting',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0063329',
      },
    ],
  },
  {
    id: 'host-mute-unmute-participants',
    group: 'HOST CONTROLS',
    title: 'I need to mute or ask a participant to unmute',
    searchPhrases: ['mute participant', 'unmute participant', 'ask to unmute', 'mute all', 'participant muted'],
    scope: 'tier1',
    confirmBeforeProceeding: [
      'Is the arbitrator signed in as host and able to open Participants?',
      'Are they trying to mute one participant, mute everyone, or ask someone to unmute?',
      'Does the participant appear in the Participants list?',
    ],
    steps: [
      {
        instruction: 'Open Participants and locate the intended participant or the meeting-level Mute all control.',
        confirm: 'Is the expected mute or Ask to Unmute control visible?',
      },
      {
        instruction: 'Guide the arbitrator to Mute or Ask to Unmute as appropriate. Do not assume the host can force-unmute a participant without the required prior consent.',
        confirm: 'Did the participant receive the prompt or did the mute action take effect?',
      },
    ],
    resolvedWhen: 'The requested participant audio action is completed or the participant receives the unmute request.',
    stopWhen: [
      'The requested behavior depends on a locked account-level permission.',
      'The arbitrator asks the agent to take control of the meeting instead of guiding them.',
    ],
    zoomSources: [
      {
        title: 'Muting or unmuting participants in a meeting',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0066716',
      },
      {
        title: 'Managing participants in a meeting',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0065566',
      },
    ],
  },
  {
    id: 'host-screen-share',
    group: 'HOST CONTROLS',
    title: 'I need to share my screen or allow a participant to share',
    searchPhrases: ['share screen', 'participant cant share', 'allow screen share', 'host share', 'screen sharing permission'],
    scope: 'tier1-with-roadblock',
    confirmBeforeProceeding: [
      'Is the arbitrator trying to share their own screen or allow a participant to share?',
      'Is the arbitrator signed in as host and able to see the Share control?',
      'Is the control missing, disabled, or visible but not working?',
      'If a participant cannot share, is this only for the current meeting or does the arbitrator appear to be asking for a permanent/default account change?',
    ],
    steps: [
      {
        instruction: 'For the host sharing their own screen, locate Share and guide the arbitrator through the current meeting-level sharing control.',
        confirm: 'Did the host sharing picker open and can the intended content be selected?',
      },
      {
        instruction: 'For participant sharing, use the current meeting-level host sharing controls to allow participant sharing for this session when permitted.',
        confirm: 'Can the participant now start sharing?',
      },
    ],
    resolvedWhen: 'The intended screen share starts or the participant is allowed to share in the current meeting.',
    stopWhen: [
      'The change requires an account-level default or administrator-controlled screen-sharing setting.',
      'Screen sharing is disabled by a locked permission the agent cannot change.',
    ],
    zoomSources: [
      {
        title: 'Allowing or preventing your meeting participants from screen sharing',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0058641',
      },
    ],
  },
  {
    id: 'host-audio',
    group: 'AUDIO',
    title: 'My microphone, speaker, or headset is not working',
    searchPhrases: ['mic not working', 'microphone', 'speaker', 'headset', 'bluetooth', 'cant hear', 'they cant hear me'],
    scope: 'tier1-with-roadblock',
    confirmBeforeProceeding: [
      'Is the arbitrator already inside the hearing?',
      'Is the issue that they cannot hear others, others cannot hear them, or both?',
      'Are they using built-in audio, a wired headset, USB audio, or Bluetooth?',
      'Does the microphone/speaker appear as an available device in Zoom?',
      'Does the operating system/device itself recognize the hardware?',
    ],
    steps: [
      {
        instruction: 'Confirm the hardware is connected, powered on, and not physically muted. For Bluetooth, confirm it is connected to the same device running Zoom.',
        confirm: 'Does the device now appear in Zoom audio choices?',
      },
      {
        instruction: 'Select and test the intended microphone and speaker in Zoom audio settings.',
        confirm: 'Can the arbitrator hear the test sound and does Zoom detect microphone input?',
      },
    ],
    resolvedWhen: 'The correct audio devices are selected and Zoom audio testing succeeds.',
    stopWhen: [
      'The device or operating system does not recognize the microphone, speaker, or headset after basic connection checks.',
      'The remaining fix requires managed-device permission, driver/hardware repair, or advanced security changes.',
    ],
    zoomSources: [
      {
        title: 'Troubleshooting speaker or microphone issues in the desktop app',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0060836',
      },
      {
        title: 'Testing your audio settings for Zoom meetings',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062765',
      },
    ],
  },
  {
    id: 'host-camera',
    group: 'VIDEO',
    title: 'My camera is not working',
    searchPhrases: ['camera not working', 'video not working', 'black camera', 'start video', 'wrong camera'],
    scope: 'tier1-with-roadblock',
    confirmBeforeProceeding: [
      'Is video simply turned off, or is Zoom trying to use a camera but no image appears?',
      'Does Zoom list a camera under Video settings?',
      'Does the device or operating system recognize the camera?',
      'Is another application already using the camera?',
    ],
    steps: [
      {
        instruction: 'If video is off, start video. If multiple cameras are available, select the intended camera.',
        confirm: 'Does the camera preview appear?',
      },
      {
        instruction: 'Confirm Zoom has basic permission to access a camera that the device itself recognizes.',
        confirm: 'Can Zoom now display the camera image?',
      },
    ],
    resolvedWhen: 'The intended camera produces a Zoom preview or meeting video.',
    stopWhen: [
      'The device itself does not recognize the camera.',
      'Resolving access requires bypassing managed-device or security restrictions.',
    ],
    zoomSources: [
      {
        title: 'Troubleshooting camera issues during a meeting',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0068908',
      },
    ],
  },
  {
    id: 'host-basic-controls',
    group: 'MEETING CONTROLS',
    title: 'I need help finding or using a basic Zoom control',
    searchPhrases: ['participants', 'chat', 'meeting view', 'reactions', 'raise hand', 'host tools', 'where is control'],
    scope: 'tier1',
    confirmBeforeProceeding: [
      'Which control is the arbitrator trying to locate or use?',
      'Which platform are they using?',
      'Are they signed in as host and already inside the hearing?',
      'Is the control missing, disabled, or simply difficult to locate?',
    ],
    steps: [
      {
        instruction: 'Locate the requested in-meeting control using the label visible in the arbitrator’s current Zoom interface.',
        confirm: 'Can the arbitrator see the control?',
      },
      {
        instruction: 'Describe the control and guide one permitted meeting-level action at a time.',
        confirm: 'Did the control perform the expected action?',
      },
    ],
    resolvedWhen: 'The arbitrator can locate and use the requested basic meeting control.',
    stopWhen: [
      'The control is unavailable because of an account-level, license, role, or administrator restriction.',
    ],
    zoomSources: [
      {
        title: 'Using host and co-host controls in a meeting',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0065164',
      },
      {
        title: 'Managing participants in a meeting',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0065566',
      },
      {
        title: 'Chatting in a Zoom meeting',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0064400',
      },
      {
        title: 'Using non-verbal feedback and meeting reactions',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0063323',
      },
    ],
  },
  {
    id: 'host-recording-basic',
    group: 'RECORDING',
    title: 'I have a question about the recording indicator or stopping the recording',
    searchPhrases: ['recording', 'stop recording', 'pause recording', 'recording indicator', 'automatic recording'],
    scope: 'tier1-boundary',
    programNotes: [
      'Hearings are configured to record automatically.',
      'Tier 1 may identify the recording indicator and explain basic Zoom controls but must not change required recording settings or interpret recording policy.',
    ],
    confirmBeforeProceeding: [
      'Is the arbitrator asking what the recording indicator means, or asking to stop/change the recording?',
      'Is this a basic Zoom-control question or a privacy/policy/authorization question?',
    ],
    steps: [
      {
        instruction: 'If the question is only about the interface, identify the recording indicator and explain what Zoom is showing.',
        confirm: 'Does the arbitrator understand the current recording state shown in Zoom?',
      },
    ],
    resolvedWhen: 'A basic interface question is answered without changing required recording configuration or interpreting policy.',
    stopWhen: [
      'The arbitrator asks to change required recording settings.',
      'The question requires interpretation of recording, privacy, confidentiality, or proceeding policy.',
    ],
    zoomSources: [
      {
        title: 'Enabling and disabling automatic recording',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0067954',
      },
      {
        title: 'Starting a cloud recording',
        url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062627',
      },
    ],
  },
  {
    id: 'host-connectivity',
    group: 'CONNECTIVITY',
    title: 'I cannot join reliably or I keep getting disconnected',
    searchPhrases: ['disconnecting', 'connection issue', 'internet', 'reconnecting', 'cant stay connected', 'network'],
    scope: 'tier1-with-roadblock',
    confirmBeforeProceeding: [
      'Is the issue failure to join, repeated disconnects, or poor meeting stability?',
      'Does the issue affect only Zoom or the device’s internet connection generally?',
      'Is the device on a personal network, managed network, VPN, or other restricted environment?',
      'What exact Zoom message appears, if any?',
    ],
    steps: [
      {
        instruction: 'Complete only the approved basic Zoom and connection checks for the current platform.',
        confirm: 'Can the arbitrator now join or remain connected?',
      },
    ],
    resolvedWhen: 'The arbitrator can join and remain connected after approved basic checks.',
    stopWhen: [
      'The remaining action requires firewall, VPN, security software, managed network, or advanced network configuration.',
      'The issue remains after all approved basic connectivity checks.',
    ],
    zoomSources: [],
  },
  {
    id: 'host-app-browser-basic',
    group: 'APP / BROWSER',
    title: 'Zoom desktop, web, or mobile app is not behaving correctly',
    searchPhrases: ['zoom app issue', 'browser issue', 'web app', 'desktop app', 'mobile app', 'zoom not working'],
    scope: 'tier1-with-roadblock',
    confirmBeforeProceeding: [
      'Which Zoom platform is the arbitrator using?',
      'What exact action fails and what happens instead?',
      'Is there an exact error message?',
      'Does the issue reproduce after the approved basic app/browser checks?',
    ],
    steps: [
      {
        instruction: 'Use only the approved basic troubleshooting process for the selected Zoom platform.',
        confirm: 'Did the app or browser behavior return to normal?',
      },
    ],
    resolvedWhen: 'The Zoom app/browser works after approved basic troubleshooting.',
    stopWhen: [
      'The issue appears to be a product-level bug or unsupported behavior after basic troubleshooting.',
      'Resolving it requires security, managed-device, or administrative changes.',
    ],
    zoomSources: [],
  },
]

export const HOST_ROADBLOCKS = [
  {
    id: 'roadblock-waiting-room',
    title: 'Waiting Room admission',
    searchPhrases: ['waiting room', 'admit participant', 'waiting room locked', 'admission'],
    trigger: 'The arbitrator needs help admitting participants or the Waiting Room setting appears locked.',
    agentBoundary: 'Confirm assigned Zoom sign-in and host controls. If the arbitrator enabled Waiting Room, guide meeting-level admission. Do not change locked account-level settings.',
    nextAction: 'Tier 1 assists with meeting-level admission. If credential or meeting-detail verification is involved, ask whether the arbitrator has reached out to the credential contact in the welcome email from kipsflexmassarbs@ogletreedeakins.com. For a locked account-level setting, follow the approved Alaga escalation path.',
    script: 'Waiting Room is off by default. If you turned it on, let’s confirm you’re signed in with your assigned credentials and locate the host controls to admit participants. If the setting is locked at the account level, I will submit an escalation so our team can assist you.',
    documentationSummary: 'Confirmed assigned Zoom sign-in and checked Waiting Room/host controls. Meeting-level admission was assisted, or a locked account-level setting was identified.',
  },
  {
    id: 'roadblock-host-controlled-feature',
    title: 'Host-controlled feature or permission',
    searchPhrases: ['host feature', 'host permission', 'host control', 'meeting permission', 'participant permission'],
    trigger: 'A requested Zoom action depends on a host-controlled meeting feature or permission.',
    agentBoundary: 'First confirm the arbitrator is signed in with assigned credentials and has host controls. Assist directly with permitted meeting-level controls. Do not bypass locked account-level settings.',
    nextAction: 'Tier 1 assists with permitted meeting-level controls. If credential or meeting-detail verification is involved, ask whether the arbitrator has reached out to the credential contact in the welcome email from kipsflexmassarbs@ogletreedeakins.com. If the setting is locked at account level, follow the approved Alaga escalation path.',
    script: 'As the meeting host, you should have these controls available when signed in with your assigned credentials. Let’s check your sign-in and test the setting together. If it turns out the setting is locked at the account level, I will submit an escalation so our team can assist you.',
    documentationSummary: 'Confirmed assigned Zoom sign-in and host controls; assisted with the permitted meeting-level control or identified a locked account-level restriction.',
  },
  {
    id: 'roadblock-meeting-details',
    title: 'Incorrect or uncertain meeting link, ID, passcode, date, or time',
    searchPhrases: ['wrong meeting link', 'wrong passcode', 'wrong date', 'wrong time', 'meeting details', 'invalid meeting id'],
    trigger: 'The link, Meeting ID, passcode, date, or time needs independent verification, creation, or modification.',
    agentBoundary: 'Review only the information the arbitrator already received. Do not create, modify, or independently validate proceeding details.',
    nextAction: 'Ask whether the arbitrator has reached out to the credential contact in the welcome email from kipsflexmassarbs@ogletreedeakins.com. If further help is needed verifying the link, passcode, date, or time, submit an Alaga escalation.',
    script: 'We can review the details you received, but we cannot independently change or confirm proceeding details. Have you already reached out to the contact from where you received your credentials? If you need further assistance verifying the link, passcode, date, or time, I can submit an escalation for our team to look into this.',
    documentationSummary: 'Reviewed the meeting details already provided to the arbitrator; independent verification or modification remained outside Tier 1 scope.',
  },
  {
    id: 'roadblock-unable-to-join',
    title: 'Unable to join after approved basic joining troubleshooting',
    searchPhrases: ['still cant join', 'unable to join after troubleshooting', 'joining checks complete', 'cant get into meeting'],
    trigger: 'Approved basic joining checks are complete and the arbitrator still cannot join.',
    agentBoundary: 'Stop when the remaining action requires meeting/account action, advanced device support, or network support.',
    nextAction: 'For meeting/account access, follow the approved Alaga escalation path. For a personal device or internet issue, refer to the device manufacturer or internet service provider as appropriate.',
    script: 'We have completed the approved joining checks. If the issue is related to meeting or account access, I can submit an escalation so our team can look into this. If the issue is with your personal device or internet connection, please contact your device manufacturer or internet service provider for further assistance.',
    documentationSummary: 'Completed approved joining checks; the arbitrator still could not join and the remaining issue required meeting/account, device, or network assistance outside Tier 1.',
  },
  {
    id: 'roadblock-account-permission',
    title: 'Zoom account, sign-in, license, role, or administrative permission',
    searchPhrases: ['account permission', 'license', 'role permission', 'admin setting', 'locked setting', 'sign in issue'],
    trigger: 'The remaining action requires account, sign-in, license, role, administrator, or locked account-level access.',
    agentBoundary: 'Do not make administrative/account changes, manage credentials, or bypass locked permissions.',
    nextAction: 'Follow the approved Alaga escalation path for additional review.',
    script: 'This appears to involve your Zoom account, sign-in, license, or role permissions. Since we do not make administrative account changes directly, I will submit an escalation so our team can assist you with this.',
    documentationSummary: 'Tier 1 boundary reached: account, sign-in, role, license, or administrative permission required.',
  },
  {
    id: 'roadblock-device-hardware',
    title: 'Microphone, speaker, or camera not recognized by the device itself',
    searchPhrases: ['device not detected', 'mic not detected', 'camera not detected', 'headset not detected', 'hardware'],
    trigger: 'After approved basic connection and Zoom device-selection checks, the device or operating system still does not recognize the hardware.',
    agentBoundary: 'Stop Zoom troubleshooting when the device itself cannot detect the hardware.',
    nextAction: 'Refer the arbitrator to the device manufacturer or appropriate hardware support.',
    script: 'We’ve completed the basic Zoom device checks, but your device still does not recognize the hardware. Please contact your device manufacturer or hardware support.',
    documentationSummary: 'Basic Zoom device checks were completed; the microphone, speaker, headset, or camera remained unrecognized by the device/OS.',
  },
  {
    id: 'roadblock-managed-permission',
    title: 'Device-level or managed permissions',
    searchPhrases: ['managed device', 'permission blocked', 'camera permission locked', 'microphone permission locked', 'device administrator'],
    trigger: 'A device-level or managed security restriction prevents the approved Zoom action.',
    agentBoundary: 'Complete approved basic permission checks only. Do not bypass device-level or managed security restrictions.',
    nextAction: 'Refer to the device manufacturer or, if the device is managed, its administrator.',
    script: 'This appears to involve a device-level permission. Please contact your device manufacturer or, if the device is managed, its administrator.',
    documentationSummary: 'Approved basic permission checks were completed; a device-level or managed restriction remained outside Tier 1 scope.',
  },
  {
    id: 'roadblock-network-security',
    title: 'Network, firewall, VPN, or security restriction',
    searchPhrases: ['firewall', 'vpn', 'network restriction', 'security software', 'internet provider', 'network support'],
    trigger: 'The remaining action requires advanced network, firewall, VPN, or security configuration.',
    agentBoundary: 'Perform only approved basic connectivity checks. Do not modify advanced network, firewall, VPN, or security configurations.',
    nextAction: 'Refer the arbitrator to their internet service provider or device/network support.',
    script: 'We’ve completed the approved connectivity checks. Please contact your internet provider or device/network support.',
    documentationSummary: 'Approved basic connectivity checks were completed; advanced network/security support was required.',
  },
  {
    id: 'roadblock-zoom-product',
    title: 'Possible Zoom product issue after basic troubleshooting',
    searchPhrases: ['zoom bug', 'zoom issue', 'feature not working', 'unsupported feature', 'all troubleshooting complete'],
    trigger: 'All standard approved Zoom troubleshooting is complete and the issue appears to be a Zoom product limitation or technical issue.',
    agentBoundary: 'Document what was tested. Do not promise direct Zoom escalation or internal resolution.',
    nextAction: 'Advise trying an alternate device or reaching out directly to Zoom, according to the approved process.',
    script: 'We’ve completed all the standard Zoom troubleshooting steps we can perform on our end. Because this appears to be a limitation or technical issue within the Zoom app itself, reaching out directly to Zoom or trying a secondary device will be the best way to get this resolved for you.',
    documentationSummary: 'Approved Zoom troubleshooting was exhausted; a possible Zoom product limitation or technical issue remained.',
  },
  {
    id: 'roadblock-proceeding-decision',
    title: 'Proceeding continuation, pause, postponement, or rescheduling',
    searchPhrases: ['pause hearing', 'postpone hearing', 'reschedule hearing', 'continue proceeding', 'cancel hearing'],
    trigger: 'The arbitrator asks the agent to make or authorize a decision about continuing, pausing, postponing, canceling, or rescheduling a proceeding.',
    agentBoundary: 'Do not make proceeding decisions. Tier 1 may assist only with the technical Zoom steps.',
    nextAction: 'Direct the arbitrator to the appropriate proceeding contact or participating parties according to the approved process.',
    script: 'We can assist with the technical Zoom steps, but cannot make decisions regarding the proceeding.',
    documentationSummary: 'Technical Zoom assistance was separated from a proceeding decision that falls outside Tier 1 scope.',
  },
  {
    id: 'roadblock-proceeding-policy',
    title: 'Privacy, recording, confidentiality, or proceeding-policy question',
    searchPhrases: ['privacy', 'confidentiality', 'recording policy', 'can i record', 'stop recording', 'ai feature', 'proceeding policy'],
    trigger: 'The question asks for interpretation or authorization of privacy, confidentiality, recording, AI-feature, or other proceeding policy.',
    agentBoundary: 'Explain Zoom controls only. Do not interpret or authorize policy/legal requirements.',
    nextAction: 'Direct the arbitrator to the designated proceeding contact or follow the approved escalation process.',
    script: 'We can explain Zoom controls, but cannot interpret privacy, recording, confidentiality, or proceeding rules.',
    documentationSummary: 'The question required policy interpretation or authorization outside Tier 1 Zoom support.',
  },
]

export function searchHostSupport(query) {
  const normalized = String(query || '').trim().toLowerCase()
  if (!normalized) return { topics: [], roadblocks: [] }

  const matches = item => [
    item.title,
    ...(item.searchPhrases || []),
    item.trigger || '',
    item.agentBoundary || '',
  ].join(' ').toLowerCase().includes(normalized)

  return {
    topics: HOST_SUPPORT_TOPICS.filter(matches),
    roadblocks: HOST_ROADBLOCKS.filter(matches),
  }
}
