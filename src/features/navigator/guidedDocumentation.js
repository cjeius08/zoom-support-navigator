const DOCUMENTATION_DEVICE_LABELS = {
  Windows: 'Windows',
  Mac: 'Mac',
  iPhone: 'iPhone / iPad',
  Android: 'Android',
  Browser: 'Browser',
  Linux: 'Linux',
}

function stepResultLabel(index, currentIndex, outcome) {
  if (outcome === 'resolved' && index === currentIndex) return 'Resolved'
  return 'Not resolved'
}

export function buildGuidedDocumentationPreview({
  process,
  sourceRoute = null,
  device = null,
  steps = [],
  currentStepIndex = 0,
  outcome = 'active',
} = {}) {
  if (!process || !['resolved', 'exhausted'].includes(outcome)) return null

  const attemptedSteps = outcome === 'exhausted'
    ? steps
    : steps.slice(0, Math.max(0, currentStepIndex) + 1)

  if (!attemptedSteps.length) return null

  const stepLines = attemptedSteps.map((step, index) => {
    const result = stepResultLabel(index, currentStepIndex, outcome)
    return `${index + 1}. ${step.title} — ${result}`
  })

  const finalStep = attemptedSteps[attemptedSteps.length - 1]
  const resolutionNextSteps = outcome === 'resolved'
    ? `Resolved on approved step: ${finalStep.title}. No additional troubleshooting performed after resolution.`
    : 'Approved path exhausted. Next action is not yet selected; continue only if the remaining symptom matches a documented next route, otherwise follow the approved stop/referral boundary.'

  return {
    device: DOCUMENTATION_DEVICE_LABELS[device] || device || '',
    exactIssue: sourceRoute?.title || '',
    stepsResult: [
      `Approved guide used: ${process.title.trim()}`,
      ...stepLines,
    ].join('\n'),
    resolutionNextSteps,
    outcome: outcome === 'resolved' ? 'Resolved' : '',
    meta: {
      processId: process.id,
      sourceRouteId: sourceRoute?.id || null,
      sourceRouteTitle: sourceRoute?.title || null,
      attemptedStepCount: attemptedSteps.length,
      result: outcome,
    },
  }
}
