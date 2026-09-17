import { describe, expect, it } from 'vitest'
import { createSafeEvent } from './usageTracker'

describe('safe analytics events', () => {
  it('keeps only approved identifiers when a UI caller supplies private input', () => {
    expect(createSafeEvent({
      eventType: 'search_used', routeId: 'navigator', processId: 'account-access', categoryId: 'account', toolId: 'search',
      searchQuery: 'Jane Smith meeting 123-456-7890', clipboard: 'secret',
    })).toEqual({ event_type: 'search_used', route_id: 'navigator', process_id: 'account-access', category_id: 'account', tool_id: 'search' })
  })
})
