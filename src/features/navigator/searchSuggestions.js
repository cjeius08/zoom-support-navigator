import { normalizeSearchText } from './smartSearch'

// A high-stakes policy search cannot be satisfied by an unrelated guide's
// incidental body-text mention. This is a relevance rule, not a new policy.
export function isRecordingPolicySearch(query) {
  const text = normalizeSearchText(query)
  return /\b(?:record|recording)\b/.test(text)
    && /\b(?:stop|stopping|pause|pausing|disable|disabled|turn|turned|off|automatic|automatically|auto|break|breaks)\b/.test(text)
}

export function isRecordingSourceRelevant(item) {
  const text = normalizeSearchText([
    item?.title, item?.keywords, item?.purpose, item?.searchPhrases, item?.trigger,
  ].filter(Boolean).join(' '))
  return /\b(?:record|recording|transcript|caption)\b/.test(text)
}

export function buildSearchSuggestions({
  query, isHost, quickAnswer, hubMatch, hubReference,
  hostTopicMatches = [], hostRoadblockMatches = [], processMatches = [], routeMatches = [], globalResults = [],
}) {
  const recordingPolicySearch = isRecordingPolicySearch(query)
  // Preserve existing dropdown behavior for other issues. Only recording-policy
  // queries get an additional pinned answer until broader ranking is accepted.
  const approved = recordingPolicySearch && quickAnswer && quickAnswer.status !== 'coverage_gap'
    ? [{ kind: 'approved_answer', answer: quickAnswer }]
    : []
  const policyFilter = item => !recordingPolicySearch || isRecordingSourceRelevant(item)
  const regular = isHost
    ? [
        ...hostTopicMatches.filter(policyFilter).map(topic => ({ kind: 'host', topic })),
        ...hostRoadblockMatches.filter(policyFilter).map(roadblock => ({ kind: 'roadblock', roadblock })),
        ...processMatches.filter(policyFilter).map(process => ({ kind: 'process', process })),
      ]
    : [
        ...routeMatches.filter(policyFilter).map(route => ({ kind: 'route', route })),
        ...processMatches.filter(policyFilter).map(process => ({ kind: 'process', process })),
      ]
  return [
    ...approved,
    ...(hubMatch ? [{ kind: 'flex_hub', reference: hubReference }] : []),
    ...regular,
    // Universal index only fills unused suggestion slots so the reviewed
    // quick-answer, symptom and process ordering is not disturbed.
    ...globalResults.map(result => ({ kind: 'global', result })),
  ].slice(0, 8)
}
