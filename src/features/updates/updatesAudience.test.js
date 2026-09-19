import { expect, it } from 'vitest'
import { UPDATES, lastUpdatedForAudience, updatesForAudience } from './updatesData'

it('never exposes admin-only release notes to Member or Lead audiences', () => {
  const standardUpdates = updatesForAudience(false)
  expect(standardUpdates.every(entry => entry.audience !== 'admin')).toBe(true)
  expect(updatesForAudience(true)).toHaveLength(UPDATES.length)
})

it('derives Last Updated from the newest entry visible to that audience', () => {
  expect(lastUpdatedForAudience(false)).toBe(updatesForAudience(false)[0].date)
  expect(lastUpdatedForAudience(true)).toBe(UPDATES[0].date)
})
