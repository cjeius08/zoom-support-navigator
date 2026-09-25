export function formatCallDocumentation(draft) {
  return [
    ['Caller Name', draft.callerName],
    ['Phone Number', draft.phoneNumber],
    ['Date and Time', draft.dateTime ? draft.dateTime.replace('T', ' ') : ''],
    ['Caller Ref', draft.callerRef],
    ['Reason for the Call', draft.reasonForCall],
    ['Device / Platform', draft.device],
    ['Device and Access', draft.accessContext],
    ['Exact Issue', draft.exactIssue],
    ['Steps Attempted + Result', draft.stepsResult],
    ['Resolution / Next Steps', draft.resolutionNextSteps],
    ['Recommended Contact (if referred)', draft.recommendedContact],
    ['Call Outcome', draft.outcome],
  ].map(([label, value]) => `${label}: ${value || '—'}`).join('\n')
}

