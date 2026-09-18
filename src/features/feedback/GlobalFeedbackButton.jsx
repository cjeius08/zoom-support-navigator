import { useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FeedbackForm } from './FeedbackForm'
import { useDialogFocus } from '../../lib/useDialogFocus'

const PAGE_LABELS = {
  navigator: 'Navigator',
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
    page_label: PAGE_LABELS[currentView] || currentView || 'Unknown page',
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

export function GlobalFeedbackButton({ currentView, reportContext, onSubmit }) {
  const [open, setOpen] = useState(false)
  const [capturedContext, setCapturedContext] = useState(null)
  const dialogRef = useRef(null)
  useDialogFocus(dialogRef, open, () => setOpen(false))

  const pageLabel = useMemo(
    () => PAGE_LABELS[currentView] || currentView || 'Current page',
    [currentView],
  )

  function openReport() {
    setCapturedContext(buildGlobalFeedbackContext(currentView, reportContext))
    setOpen(true)
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <>
      <button
        type="button"
        className="global-feedback-fab"
        aria-label="Report an issue"
        onClick={openReport}
      >
        <span aria-hidden="true">!</span>
        <strong>Report an issue</strong>
      </button>

      {open && <div
        className="global-feedback-backdrop"
        role="presentation"
        onMouseDown={event => event.target === event.currentTarget && setOpen(false)}
      >
        <div
          ref={dialogRef}
          tabIndex={-1}
          className="global-feedback-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="Report an issue"
        >
          <div className="global-feedback-context-preview" aria-label="Captured page context">
            <span><small>Page</small><strong>{capturedContext?.page_label}</strong></span>
            {capturedContext?.selected_tab && <span><small>Selected tab</small><strong>{capturedContext.selected_tab}</strong></span>}
            {capturedContext?.active_common_issue && <span><small>Common issue</small><strong>{capturedContext.active_common_issue}</strong></span>}
            {capturedContext?.active_device && <span><small>Device</small><strong>{capturedContext.active_device}</strong></span>}
            {capturedContext?.active_caller_role && <span><small>Caller role</small><strong>{capturedContext.active_caller_role}</strong></span>}
          </div>

          <FeedbackForm
            context={capturedContext || buildGlobalFeedbackContext(currentView, reportContext)}
            onCancel={() => setOpen(false)}
            onSubmit={async payload => {
              await onSubmit?.(payload)
              setOpen(false)
            }}
          />
        </div>
      </div>}
    </>,
    document.body,
  )
}
