const HEADING_PATTERN = /^(Purpose|Applies To|When To Use|Requirements|Introduction|Process \/ Step-by-Step Guide|Sample Script|Notes?|Important Limitations and Reminders|Quick Guide \/ Remember the Process|Reference)(?::\s*(.*))?$/i

export function processSections(text) {
  const sections = []; let current = { heading: 'Overview', lines: [] }
  for (const raw of String(text || '').split('\n')) {
    const line = raw.trim()
    if (!line) continue
    const match = line.match(HEADING_PATTERN)
    if (match) { if (current.lines.length) sections.push(current); current = { heading: match[1], lines: match[2] ? [match[2]] : [] } }
    else current.lines.push(line)
  }
  if (current.lines.length) sections.push(current)
  return sections
}
