import { HOST_ROADBLOCKS, HOST_SUPPORT_TOPICS } from './arbitratorHostSupport'
import { HOST_GUIDED_ROUTES } from './hostGuidedRoutes'
import { FAQ_ROLE_COVERAGE, PROCESS_ROLE_COVERAGE } from './supportRoleCoverage'

export const HOST_FASTEST_TOPIC_IDS = [
  'host-start-hearing',
  'host-meeting-id-passcode',
  'host-controls-missing',
  'host-audio',
  'host-screen-share',
]

const HOST_PROCESS_CLASSIFICATIONS = new Set(['universal', 'system'])

const SEARCH_STOP_WORDS = new Set([
  'i', 'me', 'my', 'the', 'a', 'an', 'is', 'are', 'am', 'to', 'of', 'in', 'on', 'it',
  'please', 'help', 'with', 'for', 'this', 'that', 'anyone', 'anybody', 'someone', 'somebody',
  'everyone', 'everybody', 'working', 'work', 'works', 'issue', 'issues', 'problem', 'problems',
])

const SEARCH_ALIASES = {
  cant: ['cannot', 'unable'],
  cannot: ['cant', 'unable'],
  unable: ['cant', 'cannot'],
  mic: ['microphone'],
  microphone: ['mic'],
  cam: ['camera', 'video'],
  camera: ['cam', 'video'],
  video: ['camera'],
  sound: ['audio', 'speaker'],
  audio: ['sound', 'speaker'],
  speaker: ['audio', 'sound'],
  hear: ['audio', 'speaker'],
  heard: ['hear', 'audio', 'speaker'],
  headset: ['headphones', 'bluetooth'],
  headphones: ['headset', 'bluetooth'],
  share: ['sharing', 'screen'],
  sharing: ['share', 'screen'],
  screen: ['share', 'sharing'],
  admit: ['waiting', 'participant'],
  waiting: ['admit', 'room'],
  host: ['arbitrator'],
  arbitrator: ['host'],
  disconnect: ['disconnecting', 'disconnected'],
  disconnected: ['disconnect', 'disconnecting'],
  reconnect: ['reconnecting'],
  unstable: ['stability'],
  login: ['signin', 'sign'],
  signin: ['login', 'sign'],
}

const TOPIC_FIELD_WEIGHTS = {
  title: 52,
  searchPhrases: 70,
  group: 10,
}

const ROADBLOCK_FIELD_WEIGHTS = {
  title: 58,
  searchPhrases: 76,
  trigger: 24,
}

function normalize(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(value) {
  const normalized = normalize(value)
  return normalized ? normalized.split(' ') : []
}

function meaningfulTerms(query) {
  const terms = tokenize(query)
  const filtered = terms.filter(term => !SEARCH_STOP_WORDS.has(term))
  return filtered.length ? filtered : terms
}

function editDistance(left, right) {
  if (left === right) return 0
  if (!left.length) return right.length
  if (!right.length) return left.length

  const previous = Array.from({ length: right.length + 1 }, (_, index) => index)
  const current = new Array(right.length + 1)

  for (let row = 1; row <= left.length; row += 1) {
    current[0] = row
    for (let column = 1; column <= right.length; column += 1) {
      current[column] = Math.min(
        previous[column] + 1,
        current[column - 1] + 1,
        previous[column - 1] + (left[row - 1] === right[column - 1] ? 0 : 1),
      )
    }
    for (let column = 0; column <= right.length; column += 1) previous[column] = current[column]
  }

  return previous[right.length]
}

function isAdjacentTransposition(left, right) {
  if (left.length !== right.length) return false
  const differences = []
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) differences.push(index)
    if (differences.length > 2) return false
  }
  if (differences.length !== 2) return false
  const [first, second] = differences
  return second === first + 1
    && left[first] === right[second]
    && left[second] === right[first]
}

function tokenStrength(queryToken, candidateToken) {
  if (queryToken === candidateToken) return 1

  // Important safety guard: "hear" is an audio symptom; "hearing" is proceeding context.
  // Treating them as a prefix match caused unrelated Host routes to surface for audio searches.
  if ((queryToken === 'hear' && candidateToken === 'hearing') || (queryToken === 'hearing' && candidateToken === 'hear')) {
    return 0
  }

  if (queryToken.length >= 5 && candidateToken.startsWith(queryToken) && candidateToken.length - queryToken.length <= 2) {
    return 0.76
  }

  if (candidateToken.length >= 5 && queryToken.startsWith(candidateToken) && queryToken.length - candidateToken.length <= 2) {
    return 0.72
  }

  if (Math.min(queryToken.length, candidateToken.length) >= 4 && Math.abs(queryToken.length - candidateToken.length) <= 1) {
    if (isAdjacentTransposition(queryToken, candidateToken)) return 0.86
    if (editDistance(queryToken, candidateToken) === 1) return 0.82
  }

  return 0
}

function variantsFor(term) {
  return [
    { value: term, strength: 1 },
    ...(SEARCH_ALIASES[term] || []).map(value => ({ value, strength: 0.92 })),
  ]
}

function bestTokenStrength(term, candidates) {
  let best = 0
  for (const variant of variantsFor(term)) {
    for (const candidate of candidates) {
      const strength = tokenStrength(variant.value, candidate) * variant.strength
      if (strength > best) best = strength
      if (best === 1) return best
    }
  }
  return best
}

function normalizedPhrases(item) {
  return [item.title, ...(item.searchPhrases || [])].map(normalize).filter(Boolean)
}

function phraseScore(item, query) {
  const normalizedQuery = normalize(query)
  if (!normalizedQuery) return 0

  const terms = meaningfulTerms(query)
  const meaningfulPhrase = terms.join(' ')
  const phrases = normalizedPhrases(item)

  if (normalize(item.title) === normalizedQuery) return 1200
  if (phrases.some(phrase => phrase === normalizedQuery)) return 1120
  if (meaningfulPhrase && phrases.some(phrase => phrase === meaningfulPhrase)) return 1080
  if (meaningfulPhrase.length >= 5 && phrases.some(phrase => phrase.includes(meaningfulPhrase))) return 920
  if (normalizedQuery.length >= 5 && phrases.some(phrase => phrase.includes(normalizedQuery))) return 900
  return 0
}

function fieldTokens(item, field) {
  if (field === 'searchPhrases') return tokenize((item.searchPhrases || []).join(' '))
  return tokenize(item[field])
}

function scoreItem(item, query, weights) {
  const terms = meaningfulTerms(query)
  if (!terms.length) return 0

  let score = phraseScore(item, query)

  for (const term of terms) {
    let bestTermScore = 0
    for (const [field, weight] of Object.entries(weights)) {
      const strength = bestTokenStrength(term, fieldTokens(item, field))
      bestTermScore = Math.max(bestTermScore, strength * weight)
    }

    // All meaningful terms must be supported. This prevents a generic word like
    // "cant" from surfacing unrelated topics when the actual symptom is "hear".
    if (bestTermScore === 0) return 0
    score += bestTermScore
  }

  return score
}

function ranked(items, query, weights) {
  return items
    .map((item, sourceIndex) => ({ item, sourceIndex, score: scoreItem(item, query, weights) }))
    .filter(result => result.score > 0)
    .sort((left, right) => right.score - left.score || left.sourceIndex - right.sourceIndex)
}

export function guidedRouteForHostTopic(topicId) {
  return HOST_GUIDED_ROUTES.find(route => route.topicId === topicId) || null
}

export function hostTopics() {
  return HOST_SUPPORT_TOPICS.filter(topic => guidedRouteForHostTopic(topic.id))
}

export function hostFastestTopics() {
  const byId = new Map(hostTopics().map(topic => [topic.id, topic]))
  return HOST_FASTEST_TOPIC_IDS.map(id => byId.get(id)).filter(Boolean)
}

export function hostProcesses(processes) {
  const coverage = new Map(PROCESS_ROLE_COVERAGE.map(item => [item.id, item.classification]))
  return processes.filter(process => HOST_PROCESS_CLASSIFICATIONS.has(coverage.get(process.id)))
}

export function hostFaqItems(faqItems) {
  const allowed = new Set(
    FAQ_ROLE_COVERAGE
      .filter(item => ['host-priority', 'system'].includes(item.classification))
      .map(item => item.label),
  )
  return faqItems.filter(item => allowed.has(item.label))
}

export function searchHostTopics(query) {
  return ranked(hostTopics(), query, TOPIC_FIELD_WEIGHTS).map(result => result.item)
}

export function searchHostRoadblocks(query) {
  return ranked(HOST_ROADBLOCKS, query, ROADBLOCK_FIELD_WEIGHTS).map(result => result.item)
}

// Used by Smart Search QA so dropdown ordering can be audited independently of rendering.
export function searchHostPrimaryMatches(query) {
  return [
    ...ranked(hostTopics(), query, TOPIC_FIELD_WEIGHTS).map(result => ({ kind: 'host', item: result.item, score: result.score })),
    ...ranked(HOST_ROADBLOCKS, query, ROADBLOCK_FIELD_WEIGHTS).map(result => ({ kind: 'roadblock', item: result.item, score: result.score })),
  ].sort((left, right) => right.score - left.score || (left.kind === 'host' ? -1 : 1))
}
