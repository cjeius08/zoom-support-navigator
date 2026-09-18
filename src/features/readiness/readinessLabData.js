import { READINESS_QUESTION_SETS } from '../../lib/readinessQuestionSets'

export const READINESS_PARTS = [
  {
    id: 'foundation-call-flow',
    number: 1,
    title: 'General Zoom Scenarios',
    shortTitle: 'Scenarios',
    purpose: 'Can the agent identify the right first move across common Zoom joining, audio, camera, and screen-sharing situations?',
    questionSetVersion: READINESS_QUESTION_SETS.generalScenarios,
    status: 'available',
  },
  {
    id: 'device-navigation',
    number: 2,
    title: 'Device & Navigation Awareness',
    shortTitle: 'Devices',
    purpose: 'Can the agent recognize platform differences and locate the right controls without guessing?',
    questionSetVersion: READINESS_QUESTION_SETS.deviceNavigation,
    status: 'available',
  },
  {
    id: 'troubleshooting-judgment',
    number: 3,
    title: 'Troubleshooting Judgment',
    shortTitle: 'Troubleshooting',
    purpose: 'Can the agent choose the next approved action from the caller’s symptom and observed result?',
    questionSetVersion: READINESS_QUESTION_SETS.troubleshootingJudgment,
    status: 'available',
  },
  {
    id: 'scope-referral',
    number: 4,
    title: 'Scope & Referral Judgment',
    shortTitle: 'Scope',
    purpose: 'Can the agent recognize the support boundary and identify the correct next owner?',
    questionSetVersion: null,
    status: 'planned',
  },
  {
    id: 'live-call-readiness',
    number: 5,
    title: 'Live Call Readiness',
    shortTitle: 'Live Call',
    purpose: 'Can the agent combine call flow, discovery, guidance, confirmation, documentation, and boundary judgment?',
    questionSetVersion: null,
    status: 'planned',
  },
]
