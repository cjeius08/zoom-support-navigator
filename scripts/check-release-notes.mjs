/** Batch 12 release gate.
 * Ensures numbered user-facing batches have corresponding What’s New entries.
 * On CI, compares new commit titles against base/head; local runs check the
 * current release history even when git history is unavailable.
 */
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const data = JSON.parse(readFileSync(new URL('../src/features/updates/updatesData.json', import.meta.url), 'utf8'))
const history = data.updates
const ids = history.map(entry => entry.id)
const errors = []

if (new Set(ids).size !== ids.length) errors.push('Duplicate What’s New release IDs')
if (history.some((entry, index) => index && history[index - 1].date < entry.date)) {
  errors.push('What’s New releases are not ordered newest-first')
}
for (const number of [10, 11, 12]) {
  const id = `batch-${number}-`
  if (!history.some(entry => entry.id.startsWith(id) && entry.title.includes(`Batch ${number}`))) {
    errors.push(`Missing What’s New entry for Batch ${number}`)
  }
}
const indexOfBatch = number => history.findIndex(entry => entry.id.startsWith(`batch-${number}-`))
if (!(indexOfBatch(12) < indexOfBatch(11) && indexOfBatch(11) < indexOfBatch(10))) {
  errors.push('Batches 12, 11 and 10 are not in newest-first release order')
}

const base = process.env.RELEASE_BASE_SHA
const head = process.env.RELEASE_HEAD_SHA || 'HEAD'
if (base && !/^0+$/.test(base)) {
  try {
    const subjects = execFileSync('git', ['log', '--pretty=format:%s', `${base}..${head}`], { encoding: 'utf8' })
    const numbered = [...subjects.matchAll(/(?:^|\n)(?:feat|fix)\(batch[- ](\d+)\)|(?:^|\n)Batch (\d+)\b/gim)]
      .map(match => Number(match[1] || match[2]))
    for (const number of new Set(numbered)) {
      if (!history.some(entry => entry.id.startsWith(`batch-${number}-`))) {
        errors.push(`Batch ${number} changed user-visible code but has no What’s New entry`)
      }
    }
  } catch (error) {
    errors.push(`Could not verify changed batch commits: ${error.message}`)
  }
}

if (errors.length) {
  console.error('Ozzie release gate failed:\n' + errors.map(error => `- ${error}`).join('\n'))
  process.exitCode = 1
} else {
  console.log(`Ozzie release gate passed: ${history.length} announcements, Batches 10–12 recorded.`)
}
