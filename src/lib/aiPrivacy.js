const MAX_AI_TEXT_LENGTH = 4000

function luhnValid(value) {
  const digits = String(value).replace(/\D/g, '')
  if (digits.length < 13 || digits.length > 19) return false
  let sum = 0
  let doubleDigit = false
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index])
    if (doubleDigit) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    doubleDigit = !doubleDigit
  }
  return sum % 10 === 0
}

export function sanitizeAiText(input) {
  const original = String(input ?? '').slice(0, MAX_AI_TEXT_LENGTH)
  const cardCandidates = original.match(/(?:\d[ -]?){13,19}/g) ?? []

  if (cardCandidates.some(luhnValid)) {
    return {
      blocked: true,
      reason: 'payment_card',
      safeText: '[BLOCKED: PAYMENT CARD DATA]',
      redactions: 1,
    }
  }

  if (/\b(?:ssn|social security|passport|government id|national id|driver'?s? license)\b\s*(?:number|no\.?|#|:|=)?\s*[a-z0-9-]{5,}/i.test(original)) {
    return {
      blocked: true,
      reason: 'government_id',
      safeText: '[BLOCKED: GOVERNMENT ID DATA]',
      redactions: 1,
    }
  }

  if (/\b(?:password|pwd)\b\s*[:=]\s*\S+/i.test(original)) {
    return {
      blocked: true,
      reason: 'password',
      safeText: '[BLOCKED: PASSWORD DATA]',
      redactions: 1,
    }
  }

  let safeText = original
  let redactions = 0
  const replace = (pattern, replacement) => {
    safeText = safeText.replace(pattern, () => {
      redactions += 1
      return replacement
    })
  }

  replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[EMAIL]')
  replace(/\bhttps?:\/\/\S+\b/gi, '[URL]')
  replace(/\b(?:customer\s+name|caller\s+name|name)\s*[:=]\s*[^,;\n]{2,80}/gi, '[NAME]')
  replace(/\b(?:phone|mobile|contact(?:\s+number)?|tel)\s*[:=]\s*[+()\d .-]{7,24}/gi, '[PHONE]')
  replace(/\b(?:account|order|ticket|case|meeting)\s*(?:id|number|no\.?|#)\s*[:=]?\s*[a-z0-9-]{4,}/gi, '[REFERENCE]')
  replace(/\b(?:passcode|pin)\s*[:=]\s*\S+/gi, '[PASSCODE]')
  replace(/(?:\+?\d[\s().-]?){10,15}/g, '[PHONE]')

  return {
    blocked: false,
    reason: null,
    safeText: safeText.replace(/\s+/g, ' ').trim(),
    redactions,
  }
}
