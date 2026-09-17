const HEADING_PATTERN = /^(?:\d+\.\s*)?(Purpose|Applies To|When To Use|Requirements(?:\s*\/\s*Before You Begin| and Important (?:Notes|Behavior))?|Key Information and Requirements|Important Requirement|Introduction|Process \/ Step-by-Step Guide|Sample Script|Notes?|Important (?:Limitations and Reminders|Transfer Limitations|Notes)|Quick Guide \/ Remember the Process|Quick Flow|Key Reminders|Referral \/ Roadblock Matrix|Immediate Stop \/ Refer Triggers|When to Stop and Refer for Additional Assistance|Who (?:the )?Arbitrator Should Contact|Reference)(?::\s*(.*))?$/i

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
