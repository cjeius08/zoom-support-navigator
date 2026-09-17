const safeKeys = {
  eventType: 'event_type',
  routeId: 'route_id',
  processId: 'process_id',
  categoryId: 'category_id',
  toolId: 'tool_id',
}

export function createSafeEvent(input) {
  return Object.fromEntries(
    Object.entries(safeKeys)
      .filter(([key]) => typeof input[key] === 'string' && input[key].length > 0)
      .map(([key, column]) => [column, input[key]]),
  )
}

export function createUsageTracker(insertEvent) {
  return {
    trackEvent(input) {
      return insertEvent(createSafeEvent(input))
    },
  }
}
