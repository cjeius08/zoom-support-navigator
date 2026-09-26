const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'am', 'my', 'our', 'their',
  'customer', 'customers', 'caller', 'callers', 'user', 'users', 'zoom', 'issue', 'issues', 'problem', 'problems',
  'not', 'no', 'working', 'work', 'works', 'wont', 'doesnt', 'does', 'do',
  'i', 'me', 'myself', 'we', 'us', 'you', 'they', 'them', 'where', 'button',
  'hasnt', 'havent', 'room',
  'anyone', 'anybody', 'someone', 'somebody', 'everyone', 'everybody',
  'please', 'help', 'with', 'for',
])

const SEARCH_ALIASES = {
  mic: ['microphone'],
  mics: ['microphone'],
  mike: ['microphone'],
  cam: ['camera', 'video'],
  sound: ['audio', 'speaker'],
  hear: ['audio', 'speaker'],
  hearing: ['audio', 'speaker'],
  headset: ['headphones', 'bluetooth'],
  headsets: ['headphones', 'bluetooth'],
  earbuds: ['headphones', 'bluetooth'],
  share: ['sharing'],
  shares: ['sharing'],
  screenshare: ['screen', 'sharing'],
  join: ['joining'],
  joining: ['join'],
  cannot: ['cant', 'unable'],
  unable: ['cant', 'cannot'],
  stuck: ['waiting'],
  started: ['start'],
}

const FIELD_WEIGHTS = {
  title: 38,
  keywords: 26,
  purpose: 17,
  text: 5,
  category: 3,
}

const documentCache = new WeakMap()

export function normalizeSearchText(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(value) {
  const normalized = normalizeSearchText(value)
  return normalized ? normalized.split(' ') : []
}

function meaningfulQueryTerms(query) {
  const terms = tokenize(query)
  const filtered = terms.filter(term => !STOP_WORDS.has(term))
  return filtered.length ? filtered : terms
}

function searchDocument(process) {
  const cached = documentCache.get(process)
  if (cached) return cached

  const document = {
    title: normalizeSearchText(process.title),
    keywords: normalizeSearchText(process.keywords),
    purpose: normalizeSearchText(process.purpose),
    text: normalizeSearchText(process.text),
    category: normalizeSearchText(process.category),
  }

  document.tokens = Object.fromEntries(
    Object.entries(document).map(([field, value]) => [field, new Set(tokenize(value))]),
  )

  documentCache.set(process, document)
  return document
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
      const substitution = previous[column - 1] + (left[row - 1] === right[column - 1] ? 0 : 1)
      current[column] = Math.min(
        previous[column] + 1,
        current[column - 1] + 1,
        substitution,
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
  return second === first + 1 && left[first] === right[second] && left[second] === right[first]
}

function prefixStrength(queryToken, candidateToken) {
  if (!candidateToken.startsWith(queryToken)) return 0
  if (queryToken.length >= 4) return 0.84
  if (queryToken.length === 3) return 0.72
  if (queryToken.length === 2) return 0.6
  if (queryToken.length === 1) return 0.45
  return 0
}

function fuzzyStrength(queryToken, candidateToken) {
  if (queryToken === candidateToken) return 1

  // "hear" is an audio symptom while "hearing" is often proceeding context.
  // Do not let prefix matching collapse those meanings.
  if ((queryToken === 'hear' && candidateToken === 'hearing') || (queryToken === 'hearing' && candidateToken === 'hear')) return 0

  const prefixMatch = prefixStrength(queryToken, candidateToken)
  if (prefixMatch) return prefixMatch

  if (
    candidateToken.length >= 4
    && queryToken.startsWith(candidateToken)
    && queryToken.length - candidateToken.length <= 2
  ) return 0.8
  if (isAdjacentTransposition(queryToken, candidateToken)) return 0.8

  const longest = Math.max(queryToken.length, candidateToken.length)
  const threshold = longest >= 8 ? 2 : longest >= 4 ? 1 : 0
  if (!threshold || Math.abs(queryToken.length - candidateToken.length) > threshold) return 0

  const distance = editDistance(queryToken, candidateToken)
  if (distance === 1) return 0.78
  if (distance === 2 && threshold >= 2) return 0.66
  return 0
}

function variantsFor(term) {
  return [
    { value: term, strength: 1 },
    ...(SEARCH_ALIASES[term] ?? []).map(value => ({ value, strength: 0.9 })),
  ]
}

function bestFieldMatch(term, tokens) {
  let best = 0
  for (const variant of variantsFor(term)) {
    for (const candidate of tokens) {
      const strength = fuzzyStrength(variant.value, candidate) * variant.strength
      if (strength > best) best = strength
      if (best === 1) return best
    }
  }
  return best
}

function phraseBonus(document, normalizedQuery) {
  if (!normalizedQuery) return 0
  if (document.title === normalizedQuery) return 220
  if (document.title.startsWith(normalizedQuery)) return 150
  if (document.title.includes(normalizedQuery)) return 120
  if (document.keywords.includes(normalizedQuery)) return 80
  if (document.purpose.includes(normalizedQuery)) return 45
  if (document.text.includes(normalizedQuery)) return 16
  return 0
}

const INTENT_HINTS = [
  {
    query: /\b(?:mic|microphone)\b.*\bnot working\b|\bnot working\b.*\b(?:mic|microphone)\b/,
    title: /troubleshooting speaker or microphone issues/,
    bonus: 220,
  },
  {
    query: /\bhear me\b/,
    title: /troubleshooting speaker or microphone issues/,
    bonus: 220,
  },
  {
    query: /\bwaiting room\b|\bstuck waiting\b|\bhost hasnt started\b|\bhost has not started\b/,
    title: /waiting for the host to start/,
    bonus: 260,
  },
  {
    query: /\bshare screen button\b|\bwhere.*share screen\b/,
    title: /sharing your screen/,
    bonus: 220,
  },
]

function intentBonus(document, normalizedQuery) {
  return INTENT_HINTS.reduce((total, hint) => (
    hint.query.test(normalizedQuery) && hint.title.test(document.title)
      ? total + hint.bonus
      : total
  ), 0)
}

function scoreProcess(process, query) {
  const normalizedQuery = normalizeSearchText(query)
  const terms = meaningfulQueryTerms(query)
  if (!normalizedQuery || !terms.length) return 0

  const document = searchDocument(process)
  let score = phraseBonus(document, normalizedQuery) + intentBonus(document, normalizedQuery)

  for (const term of terms) {
    let bestTermScore = 0
    for (const [field, weight] of Object.entries(FIELD_WEIGHTS)) {
      const strength = bestFieldMatch(term, document.tokens[field])
      bestTermScore = Math.max(bestTermScore, strength * weight)
    }
    if (bestTermScore === 0) return 0
    score += bestTermScore
  }

  return score
}

export function searchProcesses(processes, query) {
  return processes
    .map((process, sourceIndex) => ({ process, sourceIndex, score: scoreProcess(process, query) }))
    .filter(result => result.score > 0)
    .sort((left, right) => right.score - left.score || left.sourceIndex - right.sourceIndex)
    .map(result => result.process)
}
