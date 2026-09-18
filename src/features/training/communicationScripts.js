export const COMMUNICATION_VERIFIED_AT = 'September 18, 2026'

export const COMMUNICATION_SOURCE_IDS = {
  method: 'locate-describe-guide-confirm',
  boundaries: 'zoom-basic-support-boundaries-decision-path-referral-process',
}

export const COMMUNICATION_SECTIONS = [
  {
    id: 'opening',
    title: 'Opening & scope',
    purpose: 'Set a calm expectation that you will help with the basic Zoom issue, then move straight into discovery.',
    sourceProcessIds: [COMMUNICATION_SOURCE_IDS.boundaries],
    phrases: [
      {
        label: 'Start the Zoom check',
        text: 'I’ll help you check the basic Zoom setup. First, can you tell me what you’re trying to do and what happens when you try?',
      },
      {
        label: 'Set the support scope',
        text: 'Based on what you’re seeing, I’ll first check the basic Zoom settings and controls that we can assist you with.',
      },
    ],
  },
  {
    id: 'acknowledgment',
    title: 'Acknowledgment',
    purpose: 'Acknowledge the caller without guessing the cause, then slow the interaction into one clear step at a time.',
    sourceProcessIds: [COMMUNICATION_SOURCE_IDS.method, COMMUNICATION_SOURCE_IDS.boundaries],
    phrases: [
      {
        label: 'Acknowledge + guide',
        text: 'I understand. I’ll guide you one step at a time, and I’ll wait for you to tell me what you see before we continue.',
      },
      {
        label: 'When the screen looks different',
        text: 'That’s okay. Zoom can look different depending on the device and meeting settings. Tell me what options you can see right now, and we’ll use those.',
      },
    ],
  },
  {
    id: 'discovery',
    title: 'Discovery questions',
    purpose: 'Ask only what changes the route: goal, symptom, device, exact error, and what the caller can currently see.',
    sourceProcessIds: [COMMUNICATION_SOURCE_IDS.method, COMMUNICATION_SOURCE_IDS.boundaries],
    phrases: [
      {
        label: 'Goal + symptom',
        text: 'What are you trying to do in Zoom, and what happens instead when you try?',
      },
      {
        label: 'Device',
        text: 'Are you using a Windows computer, Mac, web browser, iPhone, or Android device?',
      },
      {
        label: 'Exact error',
        text: 'If there’s an error message, can you read the exact wording to me?',
      },
      {
        label: 'Visible controls',
        text: 'What buttons or labels can you currently see on the Zoom screen?',
      },
    ],
  },
  {
    id: 'guide',
    title: 'Locate → Describe → Guide → Confirm',
    purpose: 'Use one instruction at a time. Do not move forward until the caller confirms the control or result.',
    sourceProcessIds: [COMMUNICATION_SOURCE_IDS.method],
    framework: [
      {
        stage: 'Locate',
        remember: 'Help the caller find the correct area first.',
        phrase: 'At the bottom of the Zoom window, please look for the microphone icon labeled Mute or Unmute. Let me know when you see it.',
      },
      {
        stage: 'Describe',
        remember: 'Explain what the control looks like and what it does.',
        phrase: 'The Mute control has a microphone icon. It controls whether the other participants can hear your microphone.',
      },
      {
        stage: 'Guide',
        remember: 'Give one action, then pause.',
        phrase: 'If it says Unmute, please select it once. After you do that, tell me what you see.',
      },
      {
        stage: 'Confirm',
        remember: 'Test the result instead of assuming success.',
        phrase: 'Let’s confirm that it worked. Please speak normally for a moment. Can the other participants hear you now?',
      },
    ],
  },
  {
    id: 'recap',
    title: 'Recap & confirmation',
    purpose: 'Confirm the outcome before closing or moving to the next approved step.',
    sourceProcessIds: [COMMUNICATION_SOURCE_IDS.method, COMMUNICATION_SOURCE_IDS.boundaries],
    phrases: [
      {
        label: 'Test the result',
        text: 'Let’s check whether that resolved the issue. Can you confirm if you’re now able to use the feature as expected?',
      },
      {
        label: 'If the result is different',
        text: 'Thanks. Since the result is different from what we expected, I’m going to stop there and use what you’re seeing to reassess the next approved step.',
      },
    ],
  },
  {
    id: 'boundary',
    title: 'Support boundary & referral',
    purpose: 'Stop when the remaining action requires host, admin, IT, device, network, or proceeding authority outside basic Zoom support.',
    sourceProcessIds: [COMMUNICATION_SOURCE_IDS.boundaries],
    phrases: [
      {
        label: 'Basic troubleshooting exhausted',
        text: 'We’ve completed the basic troubleshooting steps available to us, and the issue is still occurring. The next step requires assistance outside the level of access we provide.',
      },
      {
        label: 'Host-controlled action',
        text: 'Your Zoom setup appears to be working, but the next step may be controlled by the meeting host or organizer. Please contact the host or the contact listed in your meeting invitation for further assistance.',
      },
      {
        label: 'Organization IT / admin',
        text: 'This appears to involve your Zoom account, device, network, or organization-level access. Please contact your organization’s IT help desk or Zoom administrator for additional assistance.',
      },
      {
        label: 'Proceeding decision',
        text: 'We can assist with the technical Zoom steps, but we’re unable to make decisions regarding the proceeding. Please contact the designated arbitration contact or meeting organizer for guidance.',
      },
    ],
  },
  {
    id: 'closing',
    title: 'Recap & closing',
    purpose: 'Close with the result, next step, and one final opportunity to clarify basic Zoom setup or controls.',
    sourceProcessIds: [COMMUNICATION_SOURCE_IDS.boundaries],
    phrases: [
      {
        label: 'Resolved',
        text: 'Your Zoom issue has been resolved. Before we end the call, is there anything else regarding the basic Zoom setup or meeting controls that you would like me to clarify?',
      },
      {
        label: 'Referred for additional assistance',
        text: 'I’ll document the troubleshooting we completed today and the next step we discussed. Is there anything else within the basic Zoom setup or controls that I can clarify before we end the call?',
      },
    ],
  },
]

export const COMMUNICATION_AVOID_PAIRS = [
  {
    avoid: '“Just click it.”',
    use: '“First, let’s locate the control together. Tell me when you can see it.”',
    reason: 'Avoid implying the control should be obvious.',
    sourceProcessIds: [COMMUNICATION_SOURCE_IDS.method],
  },
  {
    avoid: '“The button should be right there.”',
    use: 'Describe the location, label, and icon, then ask what the caller sees.',
    reason: 'Interfaces can differ by device, role, Zoom version, window size, and meeting settings.',
    sourceProcessIds: [COMMUNICATION_SOURCE_IDS.method],
  },
  {
    avoid: '“I’ll escalate this to your Zoom administrator.”',
    use: '“Please contact your organization’s Zoom administrator or IT team for additional assistance.”',
    reason: 'Do not promise an escalation the support team does not actually perform.',
    sourceProcessIds: [COMMUNICATION_SOURCE_IDS.boundaries],
  },
  {
    avoid: '“Zoom is broken.”',
    use: '“The issue is still occurring after the basic troubleshooting we completed.”',
    reason: 'State the observed result instead of guessing the cause.',
    sourceProcessIds: [COMMUNICATION_SOURCE_IDS.boundaries],
  },
  {
    avoid: '“The host disabled it.”',
    use: '“This feature may be controlled by the meeting host.”',
    reason: 'Do not state a host action as fact unless it has been confirmed.',
    sourceProcessIds: [COMMUNICATION_SOURCE_IDS.boundaries],
  },
  {
    avoid: '“You need to cancel or reschedule the proceeding.”',
    use: '“Please contact the designated arbitration contact or meeting organizer for guidance about the proceeding.”',
    reason: 'Proceeding decisions are outside basic Zoom support scope.',
    sourceProcessIds: [COMMUNICATION_SOURCE_IDS.boundaries],
  },
]

export const COMMUNICATION_SELF_CHECK = [
  'Did I identify the caller’s goal and exact symptom?',
  'Did I identify the correct device or platform when it changes the steps?',
  'Did I give only one instruction at a time?',
  'Did I ask what the caller saw when the interface differed?',
  'Did I confirm the result instead of assuming success?',
  'Did I stay within the approved basic support scope?',
]
