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
  hostTopicMatches = [], hostRoadblockMatches = [], processMatches = [], routeMatches = [],
}) {
  const recordingPolicySearch = isRecordingPolicySearch(query)
  const approved = quickAnswer && quickAnswer.status !== 'coverage_gap'
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
  ].slice(0, 8)
}
