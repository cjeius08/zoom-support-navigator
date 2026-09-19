import { useMemo, useState } from 'react'
import { formatCallDocumentation } from './callDocumentationFormat'

const SOURCE_TITLE = 'Zoom Basic Support Boundaries, Decision Path & Referral Process'

const DEVICE_OPTIONS = [
  'Windows',
  'Mac',
  'Browser',
  'iPhone / iPad',
  'Android',
  'Linux',
  'Other / Unknown',
]

const OUTCOMES = [
  'Resolved',
  'Partially Resolved',
  'Referred for Additional Assistance',
  'Follow-Up Required',
  'No Issue Found / General Assistance',
]

function createInitialDraft() {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)

  return {
    callerName: '',
    phoneNumber: '',
    dateTime: local,
    callerRef: '',
    device: '',
    accessContext: '',
    exactIssue: '',
    stepsResult: '',
    resolutionNextSteps: '',
    recommendedContact: '',
    outcome: '',
  }
}

function Field({ label, hint, children }) {
  return <label className="documentation-dock-field">
    <span>{label}</span>
    {hint && <small>{hint}</small>}
    {children}
  </label>
}

export function CallDocumentation({ open = false, minimized = false, onMinimize = () => {}, onClose = () => {} }) {
  const [draft, setDraft] = useState(createInitialDraft)
  const [copyState, setCopyState] = useState('idle')
  const formatted = useMemo(() => formatCallDocumentation(draft), [draft])
  const filledCount = useMemo(() => [
    draft.callerName,
    draft.phoneNumber,
    draft.callerRef,
    draft.device,
    draft.accessContext,
    draft.exactIssue,
    draft.stepsResult,
    draft.resolutionNextSteps,
    draft.recommendedContact,
    draft.outcome,
  ].filter(Boolean).length, [draft])

  function update(key, value) {
    setDraft(current => ({ ...current, [key]: value }))
    if (copyState !== 'idle') setCopyState('idle')
  }

  async function copyDocumentation() {
    try {
      await navigator.clipboard.writeText(formatted)
      setCopyState('copied')
      window.setTimeout(() => setCopyState(current => current === 'copied' ? 'idle' : current), 1600)
    } catch {
      setCopyState('failed')
    }
  }

  function clearDocumentation() {
    if (!window.confirm('Clear this documentation draft for the next call?')) return
    setDraft(createInitialDraft())
    setCopyState('idle')
  }

  if (!open) return null

  if (minimized) {
    return <aside className="documentation-dock documentation-dock-minimized" aria-label="Call Documentation minimized">
      <button type="button" className="documentation-dock-restore" aria-label="Restore Call Documentation" onClick={onMinimize}>
        <span>
          <strong>Call Documentation</strong>
          <small>{filledCount ? `${filledCount} fields in draft` : 'Draft ready'}</small>
        </span>
        <span aria-hidden="true">▣</span>
      </button>
      <button type="button" className="documentation-dock-close" aria-label="Close Call Documentation" onClick={onClose}>×</button>
    </aside>
  }

  return <aside className="documentation-dock" aria-labelledby="call-documentation-dock-title">
    <header className="documentation-dock-header">
      <div>
        <span className="documentation-dock-kicker">Live tool · local draft</span>
        <h2 id="call-documentation-dock-title">Call Documentation</h2>
      </div>
      <div className="documentation-dock-window-actions">
        <button type="button" aria-label="Minimize Call Documentation" title="Minimize" onClick={onMinimize}>—</button>
        <button type="button" aria-label="Close Call Documentation" title="Close" onClick={onClose}>×</button>
      </div>
    </header>

    <div className="documentation-dock-body">
      <aside className="documentation-dock-privacy">
        <strong>Not saved by the workspace</strong>
        <span>Copy to the approved case system, then clear the draft for the next call.</span>
      </aside>

      <details className="documentation-dock-section" open>
        <summary><span>1</span> Caller details</summary>
        <div className="documentation-dock-fields">
          <Field label="Caller name">
            <input value={draft.callerName} onChange={event => update('callerName', event.target.value)} autoComplete="off" />
          </Field>
          <Field label="Phone number">
            <input value={draft.phoneNumber} onChange={event => update('phoneNumber', event.target.value)} inputMode="tel" autoComplete="off" />
          </Field>
          <Field label="Date and time">
            <input type="datetime-local" value={draft.dateTime} onChange={event => update('dateTime', event.target.value)} />
          </Field>
          <Field label="Caller ref" hint="Use the approved caller/case reference when available.">
            <input value={draft.callerRef} onChange={event => update('callerRef', event.target.value)} autoComplete="off" />
          </Field>
        </div>
      </details>

      <details className="documentation-dock-section" open>
        <summary><span>2</span> Device and exact issue</summary>
        <div className="documentation-dock-fields">
          <Field label="Device / platform">
            <select value={draft.device} onChange={event => update('device', event.target.value)}>
              <option value="">Select device</option>
              {DEVICE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </Field>
          <Field label="Device and access" hint="Example: Zoom desktop app, browser join, signed in, managed device.">
            <input value={draft.accessContext} onChange={event => update('accessContext', event.target.value)} autoComplete="off" />
          </Field>
          <Field label="Exact issue" hint="Use the caller’s observed symptom or exact error wording.">
            <textarea rows="3" value={draft.exactIssue} onChange={event => update('exactIssue', event.target.value)} />
          </Field>
        </div>
      </details>

      <details className="documentation-dock-section" open>
        <summary><span>3</span> Troubleshooting and result</summary>
        <div className="documentation-dock-fields">
          <Field label="Steps attempted + result" hint="Only document completed steps and the observed result.">
            <textarea rows="4" value={draft.stepsResult} onChange={event => update('stepsResult', event.target.value)} />
          </Field>
          <Field label="Resolution / next steps">
            <textarea rows="3" value={draft.resolutionNextSteps} onChange={event => update('resolutionNextSteps', event.target.value)} />
          </Field>
          <Field label="Recommended contact (if referred)" hint="Leave blank when no referral was needed.">
            <input value={draft.recommendedContact} onChange={event => update('recommendedContact', event.target.value)} autoComplete="off" />
          </Field>
        </div>
      </details>

      <details className="documentation-dock-section" open>
        <summary><span>4</span> Call outcome</summary>
        <div className="documentation-dock-outcomes" role="group" aria-label="Call outcome">
          {OUTCOMES.map(outcome => <button
            key={outcome}
            type="button"
            aria-pressed={draft.outcome === outcome}
            onClick={() => update('outcome', outcome)}
          >{outcome}</button>)}
        </div>
      </details>

      <details className="documentation-dock-preview">
        <summary>Documentation preview</summary>
        <pre>{formatted}</pre>
      </details>

      <footer className="documentation-dock-footer">
        <div className="documentation-dock-actions">
          <button type="button" className="documentation-copy" onClick={copyDocumentation}>
            {copyState === 'copied' ? 'Copied documentation' : 'Copy documentation'}
          </button>
          <button type="button" className="documentation-clear" onClick={clearDocumentation}>Clear</button>
        </div>
        {copyState === 'failed' && <span role="status">Copy failed. Open the preview and copy manually.</span>}
        <small>Source: {SOURCE_TITLE}</small>
      </footer>
    </div>
  </aside>
}
