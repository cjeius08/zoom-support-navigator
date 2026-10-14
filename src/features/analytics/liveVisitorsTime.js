// Use the viewer's local browser time zone for the exact date/time.
// A missing timestamp is never filled using last interaction or heartbeat.
export function formatLastLogin(value, nowMs = Date.now()) {
  if (!value) return { relative: 'Unavailable', absolute: '' }
  const time = Date.parse(value)
  if (!Number.isFinite(time)) return { relative: 'Unavailable', absolute: '' }
  const ageMinutes = Math.max(0, Math.floor((nowMs - time) / 60_000))
  const ageHours = Math.floor(ageMinutes / 60)
  const ageDays = Math.floor(ageHours / 24)
  const relative = ageMinutes < 1 ? 'Just now'
    : ageMinutes < 60 ? `${ageMinutes} minute${ageMinutes === 1 ? '' : 's'} ago`
    : ageHours < 24 ? `${ageHours} hour${ageHours === 1 ? '' : 's'} ago`
    : ageDays < 7 ? `${ageDays} day${ageDays === 1 ? '' : 's'} ago`
    : ageDays < 30 ? `${Math.floor(ageDays / 7)} week${Math.floor(ageDays / 7) === 1 ? '' : 's'} ago`
    : ageDays < 365 ? `${Math.floor(ageDays / 30)} month${Math.floor(ageDays / 30) === 1 ? '' : 's'} ago`
    : `${Math.floor(ageDays / 365)} year${Math.floor(ageDays / 365) === 1 ? '' : 's'} ago`
  const absolute = new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  }).format(new Date(time))
  return { relative, absolute }
}
