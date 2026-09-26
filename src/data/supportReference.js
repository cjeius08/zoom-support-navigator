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
    contact: 'Tier 1 assists the signed-in arbitrator. Check whether they have already reached out to the credential contact from their welcome email. For locked account-level settings only, submit an Alaga escalation.',
    language: 'Waiting Room is off by default. If you turned it on, let’s confirm you’re signed in with your assigned credentials and locate the host controls to admit participants. If the setting is locked at the account level, I will submit an escalation so our team can assist you.',
  },
  {
    roadblock: 'Host-controlled feature or permission',
    boundary: 'First confirm the arbitrator is signed in using assigned credentials and has host controls. Assist directly with permitted meeting-level controls. Do not bypass locked account-level settings.',
    contact: 'Tier 1 assists with meeting-level controls. Check whether they have already reached out to the credential contact from their welcome email. For locked account-level settings only, submit an Alaga escalation.',
    language: 'As the meeting host, you should have these controls available when signed in with your assigned credentials. Let’s check your sign-in and test the setting together. If it turns out the setting is locked at the account level, I will submit an escalation so our team can assist you.',
  },
  {
    roadblock: 'Incorrect or uncertain meeting link, ID, passcode, date, or time',
    boundary: 'Review the information the arbitrator received. Do not create, modify, or independently validate proceeding details.',
    contact: 'First ask whether the arbitrator has reached out to the credential contact from their welcome email. If further help is needed verifying the link, passcode, date, or time, submit an Alaga escalation.',
    language: 'We can review the details you received, but we cannot independently change or confirm proceeding details. Have you already reached out to the contact from where you received your credentials? If not, please reach out to them first. If you need further assistance verifying the link, passcode, date, or time, I can submit an escalation for our team to look into this.',
  },
  {
    roadblock: 'Unable to join after approved basic joining troubleshooting',
    boundary: 'Complete approved joining checks; stop if the issue requires meeting/account action.',
    contact: 'For meeting or account access issues, submit an Alaga escalation. For personal device or network issues, refer the arbitrator to the device manufacturer or internet service provider.',
    language: 'We have completed the approved joining checks. If the issue is related to meeting or account access, I can submit an escalation so our team can look into this for you. If the issue is with your personal device or internet connection, please contact your device manufacturer or internet service provider for further assistance.',
  },
  {
    roadblock: 'Zoom account, sign-in, license, role, or administrative permission',
    boundary: 'Do not make administrative or account changes.',
    contact: 'Submit an Alaga escalation for further review.',
    language: 'This appears to involve your Zoom account, sign-in, license, or role permissions. Since we do not make administrative account changes directly, I will submit an escalation so our team can assist you with this.',
  },
  {
    roadblock: 'Microphone, speaker, or camera not recognized by the device itself',
    boundary: 'Complete approved basic connection and Zoom device-selection checks. Stop when the device or operating system does not detect the hardware.',
    contact: 'Device manufacturer or hardware support.',
    language: 'We’ve completed the basic Zoom device checks, but your device still does not recognize the hardware. Please contact your device manufacturer or hardware support.',
  },
  {
    roadblock: 'Device-level or managed permissions',
    boundary: 'Complete approved basic permission checks. Do not bypass device-level or managed security restrictions. Most arbitrators use personal, unmanaged devices.',
    contact: 'Device manufacturer or device administrator, if the device is managed.',
    language: 'This appears to involve a device-level permission. Please contact your device manufacturer or, if the device is managed, its administrator.',
  },
  {
    roadblock: 'Network, firewall, VPN, or security restriction',
    boundary: 'Perform only approved basic connectivity checks. Do not modify advanced network, firewall, VPN, or security configurations.',
    contact: 'Internet service provider or device/network support.',
    language: 'We’ve completed the approved connectivity checks. Please contact your internet provider or device/network support.',
  },
  {
    roadblock: 'Possible Zoom product issue after basic troubleshooting',
    boundary: 'Document what was tested. Do not promise direct Zoom escalation or internal resolution.',
    contact: 'Refer to Zoom or advise trying an alternate device. Do not promise that Zoom Support or another party will resolve the issue.',
    language: 'We’ve completed all the standard Zoom troubleshooting steps we can perform on our end. Because this appears to be a limitation or technical issue within the Zoom app itself, reaching out directly to Zoom or trying a secondary device will be the best way to get this resolved for you.',
  },
  {
    roadblock: 'Proceeding continuation, pause, postponement, or rescheduling',
    boundary: 'Do not make proceeding decisions.',
    contact: 'The participating parties or assigned proceeding contact owns the proceeding decision. Leads may use the approved Alaga escalation path when required.',
    language: 'We can assist with the technical Zoom steps, but cannot make decisions regarding the proceeding.',
  },
  {
    roadblock: 'Privacy, recording, confidentiality, or proceeding-policy question',
    boundary: 'Do not interpret or authorize policy or legal requirements.',
    contact: 'Advise the caller to reach out to their assigned proceeding contact. Leads may use the approved Alaga escalation path when required.',
    language: 'We can explain Zoom controls, but cannot interpret privacy, recording, confidentiality, or proceeding rules.',
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
