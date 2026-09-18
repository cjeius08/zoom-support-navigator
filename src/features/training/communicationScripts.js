export const COMMUNICATION_VERIFIED_AT = 'September 19, 2026'
export const COMMUNICATION_CALL_FLOW_SOURCE = 'Ogletree – Tier 1 Zoom Support · Standard Call Flow Outline'

export const COMMUNICATION_SOURCE_IDS = {
  method: 'locate-describe-guide-confirm',
  boundaries: 'zoom-basic-support-boundaries-decision-path-referral-process',
}

export const COMMUNICATION_SECTIONS = [
  {
    id: 'opening',
    title: 'Opening / Greeting',
    purpose: 'Establish a professional and welcoming tone, identify the support team, and invite the caller to explain the issue.',
    sourceProcessIds: [COMMUNICATION_SOURCE_IDS.boundaries],
    phrases: [
      {
        label: 'Standard opening',
        text: 'Thank you for calling Ogletree Zoom Support. This is [Name]. How may I assist you today?',
      },
    ],
  },
  {
    id: 'listen',
    title: 'Listen & Acknowledge',
    purpose: 'Allow the caller to explain the concern before beginning troubleshooting. Listen first, then acknowledge what you heard.',
    sourceProcessIds: [COMMUNICATION_SOURCE_IDS.boundaries],
    phrases: [
      {
        label: 'Acknowledge the concern',
        text: 'I understand. Let me help you get that sorted out.',
      },
      {
        label: 'When you need the caller to finish explaining',
        text: 'Go ahead and walk me through what you’re seeing. I’ll listen first, then we’ll go through the next step together.',
      },
    ],
  },
  {
    id: 'empathy',
    title: 'Empathy Statement',
    purpose: 'Show understanding, especially when the issue may affect a hearing that is about to begin or is already active.',
    sourceProcessIds: [COMMUNICATION_SOURCE_IDS.boundaries],
    phrases: [
      {
        label: 'Before the hearing',
        text: 'I understand how important it is to have everything working properly before your hearing begins.',
      },
      {
        label: 'Hearing impact',
        text: 'I understand this can be frustrating, especially when you’re trying to get the hearing started.',
      },
    ],
  },
  {
    id: 'assurance',
    title: 'Assure / Take Ownership',
    purpose: 'Give the caller confidence that you will assist while avoiding promises about an outcome you cannot guarantee.',
    sourceProcessIds: [COMMUNICATION_SOURCE_IDS.boundaries],
    phrases: [
      {
        label: 'Take ownership of the support steps',
        text: 'I’ll walk you through a few steps to identify the issue and get you connected.',
      },
      {
        label: 'Outcome-safe assurance',
        text: 'I’ll stay with you through the approved checks and explain the next step based on what we find.',
      },
    ],
  },
  {
    id: 'identify',
    title: 'Identify Caller / Hearing',
    purpose: 'Gather the minimum information needed to understand the situation before troubleshooting.',
    sourceProcessIds: [COMMUNICATION_SOURCE_IDS.boundaries],
    phrases: [
      {
        label: 'Device + access',
        text: 'What device are you using, and are you in the Zoom application or using a web browser?',
      },
      {
        label: 'Hearing status',
        text: 'Has the hearing already started, or are you still preparing to join?',
      },
      {
        label: 'Who is affected',
        text: 'Is this affecting only you, or are other participants experiencing the same issue?',
      },
      {
        label: 'Hearing identification',
        text: 'If applicable, can you confirm the hearing or arbitrator information you were provided?',
      },
    ],
  },
  {
    id: 'probe',
    title: 'Probe & Diagnose',
    purpose: 'Identify the specific problem before taking action. Start with open-ended questions, then move to targeted questions that change the troubleshooting route.',
    sourceProcessIds: [COMMUNICATION_SOURCE_IDS.method, COMMUNICATION_SOURCE_IDS.boundaries],
    phrases: [
      {
        label: 'Open-ended first',
        text: 'Can you tell me what you’re experiencing?',
      },
      {
        label: 'Timing',
        text: 'When did the issue start?',
      },
      {
        label: 'Join issue',
        text: 'What happens when you try to join?',
      },
      {
        label: 'Audio direction',
        text: 'Can you hear the other participants, and can they hear you?',
      },
      {
        label: 'Video',
        text: 'Can you see the other participants, and is your camera showing an image?',
      },
      {
        label: 'Visible Zoom state',
        text: 'Do you see the meeting controls at the bottom of the screen?',
      },
    ],
  },
  {
    id: 'troubleshoot',
    title: 'Troubleshoot',
    purpose: 'Use the approved Tier 1 troubleshooting process. Give one instruction at a time and confirm the caller’s result before moving forward.',
    sourceProcessIds: [COMMUNICATION_SOURCE_IDS.method, COMMUNICATION_SOURCE_IDS.boundaries],
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
    id: 'confirm-resolution',
    title: 'Confirm Resolution',
    purpose: 'Never assume the issue is fixed. Ask the caller to confirm the exact function that was failing.',
    sourceProcessIds: [COMMUNICATION_SOURCE_IDS.method, COMMUNICATION_SOURCE_IDS.boundaries],
    phrases: [
      {
        label: 'Audio check',
        text: 'Can you confirm if you can hear me clearly now?',
      },
      {
        label: 'Microphone check',
        text: 'Can the other participants hear you?',
      },
      {
        label: 'Camera check',
        text: 'Can you confirm that your camera is now working?',
      },
      {
        label: 'Overall check',
        text: 'Before we end the call, is everything working as expected on your end?',
      },
    ],
  },
  {
    id: 'recap',
    title: 'Recap / Summary',
    purpose: 'Confirm that both parties have the same understanding of the issue, the steps completed, the result, and the next step if unresolved.',
    sourceProcessIds: [COMMUNICATION_SOURCE_IDS.boundaries],
    phrases: [
      {
        label: 'Resolved recap',
        text: 'To recap, we completed the troubleshooting steps and confirmed the Zoom issue is now working as expected.',
      },
      {
        label: 'Unresolved recap',
        text: 'To recap, we identified the issue and completed the Tier 1 troubleshooting steps, but the issue remains. I’ve documented what we completed and the next step we discussed.',
      },
    ],
  },
  {
    id: 'final-check',
    title: 'Final Check',
    purpose: 'Give the caller one last opportunity to raise another Zoom connection concern before closing.',
    sourceProcessIds: [COMMUNICATION_SOURCE_IDS.boundaries],
    phrases: [
      {
        label: 'Final assistance check',
        text: 'Is there anything else I can assist you with regarding your Zoom connection today?',
      },
    ],
  },
  {
    id: 'closing',
    title: 'Closing',
    purpose: 'End professionally and confidently with either the confirmed resolution or the documented next step.',
    sourceProcessIds: [COMMUNICATION_SOURCE_IDS.boundaries],
    phrases: [
      {
        label: 'Resolved closing',
        text: 'Thank you for calling Ogletree Zoom Support. We’re glad we were able to assist you. Have a great day.',
      },
      {
        label: 'Unresolved / next-step closing',
        text: 'Thank you for your patience. We’ve documented the issue and the next step we discussed. Thank you for calling Ogletree Zoom Support.',
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
  'Did I let the caller explain the concern before troubleshooting?',
  'Did I acknowledge the issue and use empathy appropriate to the hearing status?',
  'Did I avoid promising an outcome I cannot guarantee?',
  'Did I identify the device, app/browser, hearing status, and who is affected?',
  'Did I start with an open-ended question before targeted diagnostic questions?',
  'Did I give only one troubleshooting instruction at a time?',
  'Did I confirm the result instead of assuming success?',
  'Did I recap the result or next step before the final check and closing?',
  'Did I stay within the approved Tier 1 support boundary?',
]
