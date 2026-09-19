import data from './updatesData.json'

export const CONSOLE_METADATA = data.metadata
export const UPDATES = data.updates

export function updatesForAudience(isAdmin = false) {
  return UPDATES.filter(entry => entry.audience !== 'admin' || isAdmin)
}

export function lastUpdatedForAudience(isAdmin = false) {
  return updatesForAudience(isAdmin)[0]?.date || CONSOLE_METADATA.effectiveDate
}

export const LAST_UPDATED = lastUpdatedForAudience(true)

function parseDate(date) {
  return new Date(`${date}T00:00:00`)
}

export function formatConsoleDate(date, options = {}) {
  return new Intl.DateTimeFormat('en-US', {
    month: options.short ? 'short' : 'long',
    day: 'numeric',
    ...(options.year === false ? {} : { year: 'numeric' }),
  }).format(parseDate(date))
}

export function formatShortConsoleDate(date) {
  return formatConsoleDate(date, { short: true, year: false })
}
