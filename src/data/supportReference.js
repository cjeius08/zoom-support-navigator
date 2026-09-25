export const FAQ_ITEMS = [
  {
    label: 'Login Credentials',
    answer: 'Arbitrators will receive a welcome email with their username and password.',
  },
  {
    label: 'Recording',
    answer: 'All meetings are set to automatically record and this cannot be turned off.',
  },
  {
    label: 'Password',
    answer: 'The password does not expire and cannot be changed by the arbitrator.',
  },
  {
    label: 'Waiting Room',
    answer: 'Waiting Room is OFF by default. The arbitrator can turn on the Waiting Room if they want to.',
  },
  {
    label: 'Username',
    answer: 'The Zoom username looks like an email address, but it is not a working inbox. It is for login only.',
  },
  {
    label: 'Host Controls',
    answer: 'The arbitrator is the host of their own meeting, but host controls are available only after they are actually signed in with their assigned credentials rather than simply joining through the meeting link.',
  },
  {
    label: 'Meeting Link Invalid / Expired',
    answer: 'When a Zoom meeting link or ID is expired, invalid, or deleted, Zoom typically displays an invalid-meeting message.',
    points: [
      'Invalid Meeting ID (3,001): The meeting ID may be incorrect, deleted, or expired. Non-recurring meetings expire 30 days after their scheduled date.',
      'Error Code 3038: The meeting link or ID is no longer active because the host ended the meeting or it moved to past meetings.',
      '“This booking link has expired”: This can appear when an expired Zoom Scheduler one-time time slot is used.',
    ],
  },
]

export const SUPPORT_HELPFUL_LINKS = [
  {
    label: 'Zoom Meetings Support Troubleshooting',
    url: 'https://support.zoom.com/hc/en/meetings?id=meetings&open=2cc7b6353b95b250c238339693e45adf',
  },
]

export const ROADBLOCK_MATRIX = [
  {
    roadblock: 'Waiting Room admission',
    boundary: 'Confirm the arbitrator is signed in with assigned Zoom credentials and has host controls. Waiting Room is OFF by default; if the arbitrator enabled it, guide them through admitting participants. Do not change locked account-level settings.',
    contact: 'Tier 1: Agent assists the signed-in arbitrator. Only locked account-level settings: odflexmassarbs@ogletreedeakins.com',
    language: 'Waiting Room is off by default. If you turned it on, let’s confirm you’re signed in with your assigned credentials and locate the host controls to admit participants. If the setting is locked at account level, please contact odflexmassarbs@ogletreedeakins.com.',
  },
  {
    roadblock: 'Host-controlled feature or permission',
    boundary: 'First confirm the arbitrator is signed in using assigned credentials and has host controls. Assist directly with permitted meeting-level controls. Do not bypass locked account-level settings.',
    contact: 'Tier 1: Agent assists with meeting-level controls. Only locked account-level settings: odflexmassarbs@ogletreedeakins.com',
    language: 'As the meeting host, you should have these controls when signed in with your assigned credentials. Let’s check your sign-in and the setting together. If it is locked at account level, please contact odflexmassarbs@ogletreedeakins.com.',
  },
  {
    roadblock: 'Incorrect or uncertain meeting link, ID, passcode, date, or time',
    boundary: 'Review the information the arbitrator received. Do not create, modify, or independently validate proceeding details.',
    contact: 'odflexmassarbs@ogletreedeakins.com',
    language: 'We can review the details you received, but cannot independently change or confirm proceeding information. Please contact odflexmassarbs@ogletreedeakins.com to verify the link, passcode, date, or time.',
  },
  {
    roadblock: 'Unable to join after approved basic joining troubleshooting',
    boundary: 'Complete approved joining checks; stop if the issue requires meeting or account action.',
    contact: 'For meeting/account access: odflexmassarbs@ogletreedeakins.com. For personal device or network issues: device manufacturer or internet provider; odflexmassarbs@ogletreedeakins.com may also assist.',
    language: 'We have completed the approved joining checks. For meeting or account access, please contact odflexmassarbs@ogletreedeakins.com. If the issue is with your device or connection, contact your device manufacturer or internet provider.',
  },
  {
    roadblock: 'Zoom account, sign-in, license, role, or administrative permission',
    boundary: 'Do not make administrative or account changes.',
    contact: 'odflexmassarbs@ogletreedeakins.com',
    language: 'This appears to involve your Zoom account, sign-in, license, or role. Please contact odflexmassarbs@ogletreedeakins.com for additional assistance.',
  },
  {
    roadblock: 'Microphone, speaker, or camera not recognized by the device itself',
    boundary: 'Complete approved basic connection and Zoom device-selection checks. Stop when the device or operating system does not detect the hardware.',
    contact: 'Device manufacturer or hardware support; alternatively odflexmassarbs@ogletreedeakins.com',
    language: 'We’ve completed the basic Zoom device checks, but your device still does not recognize the hardware. Please contact your device manufacturer or hardware support. You may also contact odflexmassarbs@ogletreedeakins.com.',
  },
  {
    roadblock: 'Device-level or managed permissions',
    boundary: 'Complete approved basic permission checks. Do not bypass device-level or managed security restrictions. Most arbitrators use personal, unmanaged devices.',
    contact: 'Device manufacturer or device administrator, if applicable; alternatively odflexmassarbs@ogletreedeakins.com',
    language: 'This appears to involve a device-level permission. Please contact your device manufacturer or, if the device is managed, its administrator. You may also contact odflexmassarbs@ogletreedeakins.com.',
  },
  {
    roadblock: 'Network, firewall, VPN, or security restriction',
    boundary: 'Perform only approved basic connectivity checks. Do not modify advanced network, firewall, VPN, or security configurations.',
    contact: 'Internet service provider or device/network support; alternatively odflexmassarbs@ogletreedeakins.com',
    language: 'We’ve completed the approved connectivity checks. Please contact your internet provider or device/network support. You may also contact odflexmassarbs@ogletreedeakins.com for additional assistance.',
  },
  {
    roadblock: 'Possible Zoom product issue after basic troubleshooting',
    boundary: 'Document what was tested. Do not promise direct Zoom escalation.',
    contact: 'odflexmassarbs@ogletreedeakins.com',
    language: 'We have completed the approved Zoom troubleshooting. Please contact odflexmassarbs@ogletreedeakins.com for additional assistance and to determine whether Zoom Support is needed.',
  },
  {
    roadblock: 'Proceeding continuation, pause, postponement, or rescheduling',
    boundary: 'Do not make proceeding decisions.',
    contact: 'odflexmassarbs@ogletreedeakins.com',
    language: 'We can assist with the technical Zoom steps, but cannot make decisions regarding the proceeding. Please contact odflexmassarbs@ogletreedeakins.com for guidance.',
  },
  {
    roadblock: 'Privacy, recording, confidentiality, or proceeding-policy question',
    boundary: 'Do not interpret or authorize policy or legal requirements.',
    contact: 'odflexmassarbs@ogletreedeakins.com',
    language: 'We can explain Zoom controls, but cannot interpret privacy, recording, confidentiality, or proceeding rules. Please contact odflexmassarbs@ogletreedeakins.com for guidance.',
  },
]

export const ESCALATION_REQUIREMENTS = [
  {
    label: 'Issue Description',
    detail: 'Briefly describe the concern, troubleshooting performed, and current status.',
  },
  {
    label: 'Support Call Date and Time',
    detail: 'Record when the support interaction occurred.',
  },
  {
    label: 'Arbitrator’s Name',
    detail: 'Provide the arbitrator’s full name.',
  },
  {
    label: 'Preferred Contact Method',
    detail: 'Include the best way to reach the arbitrator for follow-up.',
  },
  {
    label: 'Merits Hearing Date and Time',
    detail: 'Include the scheduled hearing date and time, if known.',
  },
]
