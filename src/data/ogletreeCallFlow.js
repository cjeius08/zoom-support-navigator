export const OGLETREE_CALL_FLOW_SOURCE = {
  title: 'Ogletree – Tier 1 Zoom Support · Standard Call Flow Outline',
  verifiedAt: 'September 19, 2026',
}

export const OGLETREE_SIMPLE_AGENT_FORMULA = [
  'Greet',
  'Listen',
  'Empathize',
  'Assure',
  'Probe',
  'Troubleshoot',
  'Confirm',
  'Close',
]

export const OGLETREE_CALL_FLOW_STEPS = [
  {
    id: 'opening',
    number: 1,
    name: 'Opening / Greeting',
    objective: 'Establish a professional and welcoming tone.',
    action: 'Greet the caller, identify the support team, and ask how you can assist.',
    script: 'Thank you for calling Flex Arbitration Zoom Support. This is [Name]. How can I help you today?',
  },
  {
    id: 'listen',
    number: 2,
    name: 'Active Listening & Acknowledgment',
    objective: 'Allow the caller to explain the issue before beginning troubleshooting.',
    action: 'Listen to the concern, acknowledge the issue, and avoid immediately jumping into troubleshooting.',
    script: 'I understand. Let me help you get that sorted out.',
  },
  {
    id: 'empathy',
    number: 3,
    name: 'Empathy Statement',
    objective: 'Show understanding, especially when the issue may affect an active hearing.',
    action: 'Acknowledge the impact without guessing the cause or outcome.',
    script: 'I understand this can be frustrating, especially when you’re trying to get the hearing started.',
  },
  {
    id: 'assurance',
    number: 4,
    name: 'Assurance / Ownership',
    objective: 'Give the caller confidence that the agent will assist them.',
    action: 'Explain that you will walk through the issue while avoiding promises you cannot guarantee.',
    script: 'I’ll walk you through a few steps to identify the issue and get you connected.',
  },
  {
    id: 'identify',
    number: 5,
    name: 'Caller & Hearing Identification',
    objective: 'Gather the minimum information needed to understand the situation.',
    action: 'Identify the caller/hearing context, device, Zoom app or browser, whether the hearing has started, and whether others are affected.',
    script: 'Before we begin, what device are you using, are you in the Zoom app or browser, and has the hearing already started?',
  },
  {
    id: 'probe',
    number: 6,
    name: 'Probing / Diagnostic Questions',
    objective: 'Identify the specific problem before taking action.',
    action: 'Start open-ended, then use targeted questions for join, audio, video, connection, or visible Zoom controls.',
    script: 'Can you tell me what you’re experiencing and what happens when you try?',
  },
  {
    id: 'troubleshoot',
    number: 7,
    name: 'Troubleshooting',
    objective: 'Resolve the issue using the approved Tier 1 troubleshooting process.',
    action: 'Use approved basic checks, Zoom controls, and basic recovery steps. If the issue moves outside Tier 1, document and follow the agreed next-step process.',
    script: 'I’ll guide you through the approved checks one step at a time. Let me know what you see after each step.',
  },
  {
    id: 'confirm',
    number: 8,
    name: 'Confirmation of Resolution',
    objective: 'Never assume the issue is fixed; ask the caller to confirm.',
    action: 'Test the exact function that failed before deciding the final call outcome.',
    script: 'Before we move on, can you confirm that everything is working as expected on your end?',
  },
  {
    id: 'recap',
    number: 9,
    name: 'Recap / Summary',
    objective: 'Confirm that both parties have the same understanding of what was done.',
    action: 'Summarize the issue, completed steps, result, and next step if the issue remains.',
    script: 'To recap, we identified the issue, completed the Tier 1 troubleshooting steps, and confirmed the current result.',
  },
  {
    id: 'final-check',
    number: 10,
    name: 'Final Check',
    objective: 'Give the caller one last opportunity to raise an issue.',
    action: 'Ask whether anything else regarding the Zoom connection needs assistance.',
    script: 'Is there anything else I can assist you with regarding your Zoom connection today?',
  },
  {
    id: 'closing',
    number: 11,
    name: 'Closing Spiel',
    objective: 'End professionally and confidently.',
    action: 'Close with the final resolution or documented next step.',
    script: 'Thank you for calling Flex Arbitration Zoom Support. Have a great day.',
  },
]

export const OGLETREE_RESOLUTION_BRANCH = {
  resolved: {
    label: 'YES — Resolved',
    path: ['Recap', 'Final Check', 'Closing'],
  },
  unresolved: {
    label: 'NO — Unresolved',
    path: ['Explain Next Step', 'Escalate / Document', 'Recap', 'Closing'],
  },
  boundaryNote: 'The call-flow source says to escalate according to the agreed process. Use the current Scope Check / referral guidance to determine whether the next step is an external referral or an actual escalation; do not promise a handoff that is not performed.',
}

export const OGLETREE_IDENTIFICATION_ITEMS = [
  'Caller name',
  'Arbitrator / hearing identification, if applicable',
  'Device being used',
  'Zoom application or browser',
  'Whether the hearing has already started',
  'Whether other participants are affected',
]

export const OGLETREE_PROBING_PROMPTS = [
  'Can you tell me what you’re experiencing?',
  'When did the issue start?',
  'What happens when you try to join?',
  'Can you hear the other participants?',
  'Can they hear you?',
  'Can you see the other participants?',
  'Is your camera showing an image?',
  'Are you currently connected to the internet?',
  'Do you see the meeting controls at the bottom of the screen?',
]
