export const FEEDBACK_PAGE_LABELS = {
  navigator: 'Navigator',
  favorites: 'Favorites',
  training: 'Training & Resources',
  updates: 'What’s New / Updates',
  feedback: 'Feedback',
  admin: 'Admin Home',
  team: 'Team Management',
  usage: 'Usage Analytics',
  feedback_queue: 'Feedback Queue',
}

export function buildGlobalFeedbackContext(currentView, reportContext = {}) {
  const safeWindow = typeof window === 'undefined' ? null : window
  const safeNavigator = typeof navigator === 'undefined' ? null : navigator

  return {
    route_id: currentView || 'unknown',
    page_label: FEEDBACK_PAGE_LABELS[currentView] || currentView || 'Unknown page',
    process_id: reportContext.process_id || null,
    category_id: reportContext.category_id || null,
    selected_tab: reportContext.selected_tab || null,
    current_section: reportContext.current_section || null,
    active_device: reportContext.active_device || null,
    active_caller_role: reportContext.active_caller_role || null,
    active_common_issue: reportContext.active_common_issue || null,
    page_path: safeWindow?.location?.pathname || null,
    page_hash: safeWindow?.location?.hash || null,
    viewport_width: Number.isFinite(safeWindow?.innerWidth) ? safeWindow.innerWidth : null,
    viewport_height: Number.isFinite(safeWindow?.innerHeight) ? safeWindow.innerHeight : null,
    browser_user_agent: safeNavigator?.userAgent ? String(safeNavigator.userAgent).slice(0, 1000) : null,
    client_reported_at: new Date().toISOString(),
  }
}
