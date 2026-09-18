import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FeedbackForm } from './FeedbackForm'
import { useDialogFocus } from '../../lib/useDialogFocus'
import { buildGlobalFeedbackContext } from './feedbackContext'

export function GlobalFeedbackButton({ currentView, reportContext, onSubmit }) {
  const [open, setOpen] = useState(false)
  const [capturedContext, setCapturedContext] = useState(null)
  const dialogRef = useRef(null)
  useDialogFocus(dialogRef, open, () => setOpen(false))
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
