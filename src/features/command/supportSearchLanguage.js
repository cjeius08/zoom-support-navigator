import { normalizeSearchText } from '../navigator/smartSearch'

// Translate only common search expressions, not instructions or policy.
// Ambiguous audio wording stays general rather than guessing mic vs speaker.
export function normalizeSupportQuery(query) {
  let text = normalizeSearchText(query)
  if (!text) return ''

  text = text
    .replace(/\b(?:hindi|di)\s+(?:nila|sila)\s+(?:ako\s+)?marinig\b/g, 'cant hear me')
    .replace(/\b(?:hindi|di)\s+ako\s+marinig\b/g, 'cant hear me')
    .replace(/\b(?:hindi|di)\s+ko\s+marinig\b/g, 'cant hear anyone')
    .replace(/\b(?:hindi|di)\s+marinig\s+(?:yung\s+|ang\s+)?(?:arbitrator|host|speaker|audio)\b/g, 'cant hear anyone')
    .replace(/\b(?:hindi|di)\s+marinig\b/g, 'audio not working')
    .replace(/\b(?:hindi|di)\s+(?:maka\s*|makapag\s*)?join\b/g, 'cant join')
    .replace(/\b(?:hindi|di)\s+makapasok\b/g, 'cant join')
    .replace(/\b(?:hindi|di)\s+(?:gumagana|nagana)\b/g, 'not working')
    .replace(/\b(?:paano|pano|panu|papano|pa\s+ano)\b/g, ' ')
    .replace(/\b(?:pwede|puwede|pwedeng|puwedeng|ba|po|nga|lang|naman|yung|ung|ang|ng|sa|mga|mag|magpa|ako|ko|nila|sila)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return text
}

 // This keeps unverified Host-only policy topics out of Participant quick discovery.
 // Users can still navigate to general resources; no procedure is implied here.
export function isUnverifiedParticipantSearch(query) {
  const text = normalizeSupportQuery(query)
  return /\breschedul\w*\b.*\bhearing\b/.test(text)
    || /\b(?:automatic|automatically|auto|stop|pause|disable|turn off)\b.*\brecording\b/.test(text)
    || /\brecording\b.*\bbreaks?\b/.test(text)
    || /\b(?:log out|sign out|switch account)\b/.test(text)
}
