import { PROCESSES } from '../../data/processes'
import { COMMON_ISSUE_ROUTES } from './commonIssueRoutes'

const TOKEN_ALIASES = new Map([
  ['bt', 'bluetooth'],
  ['spkr', 'speaker'],
  ['spk', 'speaker'],
  ['mic', 'microphone'],
  ['cam', 'camera'],
  ['vid', 'video'],
  ['mtg', 'meeting'],
  ['shr', 'share'],
  ['scrn', 'screen'],
  ['conected', 'connected'],
  ['connectd', 'connected'],
  ['cnt', 'cant'],
  ['cant', 'cant'],
  ['hear', 'hear'],
])

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeToken(token) {
  return TOKEN_ALIASES.get(token) || token
}

function queryTokens(query) {
  return normalizeText(query)
    .split(' ')
    .filter(Boolean)
    .map(normalizeToken)
    .filter(token => token.length >= 2)
}

function routeText(route) {
  return normalizeText([
    route.title,
    route.subtitle,
    route.classification,
    route.classificationNote,
    route.group,
    route.categoryId,
    ...(route.searchPhrases || []),
    ...(route.confirm || []),
    ...(route.checks || []).flatMap(check => [check.title, check.instruction, check.expected]),
  ].filter(Boolean).join(' '))
}

function processText(process) {
  return normalizeText([
    process.title,
    process.purpose,
    process.category,
    process.keywords,
    ...(process.steps || []),
  ].filter(Boolean).join(' '))
}

function scoreText(query, text) {
  const normalizedQuery = normalizeText(query)
  const tokens = queryTokens(query)
  if (!normalizedQuery || !tokens.length || !text) return 0

  let score = 0
  if (text.includes(normalizedQuery)) score += 36

  const matched = tokens.filter(token => text.includes(token))
  score += matched.length * 7

  if (matched.length === tokens.length) score += 18
  else if (matched.length >= Math.max(2, Math.ceil(tokens.length * 0.6))) score += 8

  const signalTokens = new Set(['bluetooth', 'speaker', 'microphone', 'camera', 'screen', 'share', 'audio', 'meeting', 'join'])
  for (const token of matched) {
    if (signalTokens.has(token)) score += 4
  }

  return score
}

function rankedFallback(query, items, textFor, limit) {
  return items
    .map(item => ({ item, score: scoreText(query, textFor(item)) }))
    .filter(entry => entry.score >= 10)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(entry => entry.item)
}

function dedupeById(items) {
  const seen = new Set()
  return items.filter(item => {
    if (!item?.id || seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

export function buildApprovedAiSources(query, routeMatches = [], processMatches = []) {
  const fallbackRoutes = rankedFallback(query, COMMON_ISSUE_ROUTES, routeText, 5)
  const fallbackProcesses = rankedFallback(query, PROCESSES, processText, 4)

  const routes = dedupeById([...routeMatches, ...fallbackRoutes]).slice(0, 5)
  const processes = dedupeById([...processMatches, ...fallbackProcesses]).slice(0, 3)

  return { routes, processes }
}

export { normalizeText, queryTokens, scoreText }
