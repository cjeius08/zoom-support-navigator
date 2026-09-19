export const SOURCE_TITLE = 'Zoom Basic Support Boundaries, Decision Path & Referral Process'

export const SCOPE_CATEGORIES = [
  { id: 'basic', label: 'Basic Zoom setup / control / approved troubleshooting', kind: 'assist' },
  { id: 'host', label: 'Host action or meeting-owner permission', kind: 'refer' },
  { id: 'admin', label: 'Zoom admin, account, license, role, or organization access', kind: 'refer' },
  { id: 'device', label: 'Device / OS / network / VPN / firewall / security restriction', kind: 'refer' },
  { id: 'hardware', label: 'Mic / speaker / camera not recognized by the device itself', kind: 'refer' },
  { id: 'proceeding', label: 'Proceeding, recording, privacy, confidentiality, or authorization decision', kind: 'refer' },
]

export const TROUBLESHOOTING_STATUS = [
  { id: 'not-started', label: 'Approved troubleshooting not started yet' },
  { id: 'steps-remain', label: 'Approved troubleshooting steps still remain' },
  { id: 'exhausted', label: 'All approved troubleshooting completed; issue remains' },
  { id: 'resolved', label: 'Issue is resolved' },
]

export const AUTHORITY_STATUS = [
  { id: 'safe', label: 'No — next step stays inside approved scope' },
  { id: 'guess', label: 'Yes — it would require guessing, bypassing, or an unauthorized change' },
  { id: 'unsure', label: 'Not sure whether the caller is authorized' },
]

export const REFERRAL_ROADBLOCKS = [
  {
    id: 'waiting-room',
    label: 'Waiting Room admission',
    categories: ['host'],
    contact: 'Meeting host, meeting organizer, or contact listed in the meeting invitation',
    boundary: 'Confirm the meeting information and explain the Waiting Room. The agent cannot admit the participant.',
    language: 'You appear to be in the Waiting Room. Admission is controlled by the meeting host. Please remain in the Waiting Room or contact the meeting organizer if you need additional assistance.',
  },
  {
    id: 'host-permission',
    label: 'Host-controlled feature or permission',
    categories: ['host'],
    contact: 'Meeting host or organizer',
    boundary: 'Complete basic checks. Do not attempt to bypass host restrictions.',
    language: 'Your Zoom application appears to be working, but this feature may be controlled by the meeting host. Please contact the host or meeting organizer for assistance with that permission.',
  },
  {
    id: 'meeting-details',
    label: 'Incorrect or uncertain meeting link, ID, passcode, date, or time',
    categories: ['host', 'proceeding'],
    contact: 'Person or organization that sent the invitation / designated arbitration contact',
    boundary: 'Review only the information the caller received. Do not create, modify, or independently validate proceeding details.',
    language: 'We’re unable to change or confirm the meeting details provided by the organizer. Please contact the person or organization that sent your invitation to verify the meeting information.',
  },
  {
    id: 'join-unresolved',
    label: 'Unable to join after approved basic joining troubleshooting',
    categories: ['basic', 'host', 'device'],
    contact: 'Meeting organizer / invitation contact; IT or help desk if the issue is device- or network-related',
    boundary: 'Complete approved joining checks, then stop when the remaining action requires meeting, account, device, or network support.',
    language: 'We’ve completed the basic joining checks available to us. Please contact the meeting organizer to confirm access, or your IT support team if the issue appears to be related to your device or network.',
  },
  {
    id: 'account-admin',
    label: 'Zoom account, sign-in, license, role, or administrative permission',
    categories: ['admin'],
    contact: 'Organization IT / help desk or Zoom administrator',
    boundary: 'Do not make administrative or account-level changes.',
    language: 'This appears to involve your Zoom account or organization-level access. Please contact your organization’s IT help desk or Zoom administrator for additional assistance.',
  },
  {
    id: 'hardware-not-detected',
    label: 'Microphone, speaker, or camera not recognized by the device itself',
    categories: ['hardware', 'device'],
    contact: 'Organization IT / help desk, device support, or hardware provider',
    boundary: 'Complete basic connection and Zoom device-selection checks. Stop when the device or operating system does not detect the hardware.',
    language: 'We’ve confirmed that this is no longer limited to a Zoom setting. Please contact your IT or device support team so they can check the hardware or system-level settings.',
  },
  {
    id: 'managed-permission',
    label: 'Organization-controlled device permission',
    categories: ['device', 'admin'],
    contact: 'Organization IT / help desk',
    boundary: 'Do not bypass managed security, administrator controls, or organization-controlled permissions.',
    language: 'The setting appears to be controlled by your organization or device administrator. Please contact your IT help desk for assistance changing that permission.',
  },
  {
    id: 'network-security',
    label: 'Network, firewall, VPN, or managed security restriction',
    categories: ['device'],
    contact: 'Organization IT / network support',
    boundary: 'Perform only approved basic connectivity checks. Do not change organization-managed network or security controls.',
    language: 'The issue may involve your organization’s network or security settings, which we’re unable to change. Please contact your IT or network support team.',
  },
  {
    id: 'possible-zoom-product',
    label: 'Possible Zoom product issue after approved basic troubleshooting',
    categories: ['basic', 'admin'],
    contact: 'Organization IT / Zoom administrator; they determine whether Zoom Support is needed',
    boundary: 'Document what was tested. Do not promise or imply a direct Zoom escalation.',
    language: 'We’ve completed the basic Zoom troubleshooting available to us. Please contact your organization’s IT or Zoom administrator for further assistance. They can determine whether Zoom Support needs to be contacted.',
  },
  {
    id: 'proceeding-decision',
    label: 'Proceeding continuation, pause, postponement, or rescheduling',
    categories: ['proceeding'],
    contact: 'Meeting organizer or designated arbitration contact',
    boundary: 'Do not make decisions about whether the proceeding should continue, pause, be postponed, or be rescheduled.',
    language: 'We can assist with the technical Zoom steps, but we’re unable to make decisions regarding the proceeding. Please contact the designated arbitration contact or meeting organizer for guidance.',
  },
  {
    id: 'privacy-policy',
    label: 'Privacy, recording, confidentiality, AI, or proceeding-policy question',
    categories: ['proceeding'],
    contact: 'Meeting organizer or designated arbitration / client contact',
    boundary: 'Explain where the Zoom control is located, but do not interpret, authorize, or decide whether its use is permitted.',
    language: 'We can explain where the Zoom control is located, but we’re unable to determine whether its use is permitted for your proceeding. Please contact the designated arbitration contact or meeting organizer for guidance.',
  },
]

export function evaluateScope({ category, troubleshooting, authority }) {
  if (troubleshooting === 'resolved') {
    return {
      state: 'resolved',
      label: 'RESOLVED — DOCUMENT & CLOSE',
      title: 'The technical issue is resolved',
      text: 'Confirm the result with the caller, document what was completed, and close the interaction unless another in-scope question remains.',
      reason: 'The approved process says to test and confirm the result before closing.',
    }
  }

  if (authority === 'guess' || authority === 'unsure') {
    return {
      state: 'refer',
      label: 'STOP + REFER',
      title: authority === 'unsure' ? 'Do not guess about access or authorization' : 'The next action is outside approved authority',
      text: 'Stop basic troubleshooting. Explain that the remaining step requires assistance outside the level of access this support team provides.',
      reason: authority === 'unsure'
        ? 'If the caller’s authorization cannot be confirmed, do not bypass controls or make an unapproved change.'
        : 'The approved resource says to stop when continuing would require guessing, bypassing controls, or an unauthorized change.',
    }
  }

  const selectedCategory = SCOPE_CATEGORIES.find(item => item.id === category)
  if (selectedCategory?.kind === 'refer') {
    return {
      state: 'refer',
      label: 'STOP + REFER',
      title: 'A support boundary has been reached',
      text: 'Do not perform unnecessary additional troubleshooting. Explain what has already been checked, then identify the appropriate next support contact.',
      reason: selectedCategory.label,
    }
  }

  if (troubleshooting === 'exhausted') {
    return {
      state: 'refer',
      label: 'STOP + REFER',
      title: 'Approved troubleshooting is exhausted',
      text: 'The issue remains after all approved basic steps. Stop troubleshooting and move to referral for additional assistance.',
      reason: 'The approved resource lists unresolved issues after all approved troubleshooting as an immediate stop / refer trigger.',
    }
  }

  if (category === 'basic' && (troubleshooting === 'not-started' || troubleshooting === 'steps-remain') && authority === 'safe') {
    return {
      state: 'assist',
      label: 'CONTINUE APPROVED TROUBLESHOOTING',
      title: 'The issue is still within basic support scope',
      text: 'Use the relevant approved process, give one instruction at a time, and confirm the result after each meaningful action.',
      reason: 'Basic Zoom setup, navigation, controls, and approved troubleshooting are within scope.',
    }
  }

  return {
    state: 'pending',
    label: 'MORE INFORMATION NEEDED',
    title: 'Complete the scope check',
    text: 'Select the issue type, troubleshooting status, and whether the next step stays within approved authority.',
    reason: 'The workspace will only recommend continue / stop once the information that changes the route is selected.',
  }
}

export function getReferralRoadblocks({ category, troubleshooting }) {
  const recommendedIds = new Set()

  for (const roadblock of REFERRAL_ROADBLOCKS) {
    if (roadblock.categories.includes(category)) recommendedIds.add(roadblock.id)
  }

  if (troubleshooting === 'exhausted') {
    recommendedIds.add('join-unresolved')
    recommendedIds.add('possible-zoom-product')
  }

  const recommended = REFERRAL_ROADBLOCKS.filter(item => recommendedIds.has(item.id))
  const other = REFERRAL_ROADBLOCKS.filter(item => !recommendedIds.has(item.id))
  return { recommended, other }
}

export function getReferralGuidance(roadblockId) {
  return REFERRAL_ROADBLOCKS.find(item => item.id === roadblockId) || null
}
