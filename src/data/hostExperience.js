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

const SEARCH_ALIASES = {
  cant: ['cannot', 'unable'],
  cannot: ['cant', 'unable'],
  unable: ['cant', 'cannot'],
  mic: ['microphone'],
  microphone: ['mic'],
  cam: ['camera'],
  camera: ['cam', 'video'],
  sound: ['audio', 'speaker'],
  hear: ['audio', 'speaker'],
  headset: ['headphones', 'bluetooth'],
  headphones: ['headset', 'bluetooth'],
  share: ['sharing', 'screen'],
  sharing: ['share', 'screen'],
  admit: ['waiting', 'participant'],
  waiting: ['admit', 'room'],
  host: ['arbitrator'],
  arbitrator: ['host'],
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

function itemText(item) {
  return normalize([
    item.title,
    item.group,
    ...(item.searchPhrases || []),
    item.trigger,
    item.agentBoundary,
    item.nextAction,
  ].filter(Boolean).join(' '))
}

function tokenMatches(term, candidate) {
  if (candidate === term || candidate.startsWith(term) || term.startsWith(candidate)) return true
  if (Math.max(term.length, candidate.length) >= 5 && Math.abs(term.length - candidate.length) <= 1) {
    return editDistance(term, candidate) <= 1
  }
  return false
}

function itemScore(item, query) {
  const normalizedQuery = normalize(query)
  if (!normalizedQuery) return 0
  const text = itemText(item)
  if (text.includes(normalizedQuery)) return 1000 - text.indexOf(normalizedQuery)

  const tokens = text.split(' ')
  const queryTerms = normalizedQuery.split(' ').filter(term => !['i', 'my', 'the', 'a', 'an', 'is', 'are', 'to', 'of', 'in', 'on', 'it', 'not'].includes(term))
  let score = 0

  for (const term of queryTerms) {
    const variants = [term, ...(SEARCH_ALIASES[term] || [])]
    const matched = variants.some(variant => tokens.some(candidate => tokenMatches(variant, candidate)))
    if (!matched) return 0
    score += 25
  }

  if (normalize(item.title).includes(queryTerms[0] || '')) score += 20
  return score
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
  return hostTopics()
    .map((item, sourceIndex) => ({ item, sourceIndex, score: itemScore(item, query) }))
    .filter(result => result.score > 0)
    .sort((left, right) => right.score - left.score || left.sourceIndex - right.sourceIndex)
    .map(result => result.item)
}

export function searchHostRoadblocks(query) {
  return HOST_ROADBLOCKS
    .map((item, sourceIndex) => ({ item, sourceIndex, score: itemScore(item, query) }))
    .filter(result => result.score > 0)
    .sort((left, right) => right.score - left.score || left.sourceIndex - right.sourceIndex)
    .map(result => result.item)
}
