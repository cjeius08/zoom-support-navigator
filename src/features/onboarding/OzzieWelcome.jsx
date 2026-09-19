import { useRef } from 'react'
import { useDialogFocus } from '../../lib/useDialogFocus'
import './OzzieWelcome.css'

export function OzzieWelcome({
  open = false,
  videoSrc,
  busy = false,
  error = '',
  replay = false,
  onContinue = () => {},
  onClose = () => {},
}) {
  const dialogRef = useRef(null)
  useDialogFocus(dialogRef, open, replay ? onClose : undefined)

  if (!open) return null

  const finish = replay ? onClose : onContinue

  return (
    <div className="ozzie-welcome-backdrop" role="presentation">
      <section
        ref={dialogRef}
        tabIndex={-1}
        className="ozzie-welcome-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ozzie-welcome-title"
        aria-describedby="ozzie-welcome-description"
      >
        <div className="ozzie-welcome-media">
          <video
            controls
            playsInline
            preload="metadata"
            src={videoSrc}
            aria-label="Meet Ozzie introduction video"
          >
            Your browser does not support this introduction video.
          </video>
        </div>

        <div className="ozzie-welcome-copy">
          <p className="eyebrow">{replay ? 'Ozzie introduction' : 'Welcome to your workspace'}</p>
          <h2 id="ozzie-welcome-title">Meet Ozzie</h2>
          <p id="ozzie-welcome-description">
            Your guide to the Ogletree Support Workspace. Find Zoom guidance,
            training, troubleshooting routes, and live-call support faster.
          </p>

          {error && <p className="ozzie-welcome-error" role="alert">{error}</p>}

          <div className="ozzie-welcome-actions">
            <button
              type="button"
              className="primary-action"
              disabled={busy}
              onClick={finish}
            >
              {busy ? 'Opening workspace…' : replay ? 'Back to Workspace' : 'Start Exploring'}
            </button>
            {!replay && (
              <button
                type="button"
                className="ozzie-welcome-skip"
                disabled={busy}
                onClick={onContinue}
              >
                Skip
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
