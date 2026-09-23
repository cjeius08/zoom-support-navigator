import { useEffect, useMemo, useRef, useState } from 'react'
import { loadOwnCallNotes, saveOwnCallNote } from '../../lib/callNotesApi'
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

function restoredDraft(note) {
  return {
    ...createInitialDraft(),
    ...(note?.draft || {}),
  }
}

function appendDraftText(existing, incoming) {
  const current = String(existing || '').trim()
  const next = String(incoming || '').trim()
  if (!next) return current
  if (!current) return next
  if (current.includes(next)) return current
  return `${current}\n\n${next}`
}

function Field({ label, hint, children }) {
  return <label className="documentation-dock-field">
    <span>{label}</span>
    {hint && <small>{hint}</small>}
    {children}
  </label>
}

export function CallDocumentation({ open = false, minimized = false, stackIndex = 0, onMinimize = () => {}, onClose = () => {}, onOpenSavedNotes = null, prefill = null, onPrefillApplied = () => {} }) {
  const [draft, setDraft] = useState(createInitialDraft)
  const [copyState, setCopyState] = useState('idle')
  const [activeNoteId, setActiveNoteId] = useState(null)
  const [savedNotes, setSavedNotes] = useState([])
  const [notesLoading, setNotesLoading] = useState(false)
  const [noteState, setNoteState] = useState('idle')
  const [noteError, setNoteError] = useState('')
  const [handoffMessage, setHandoffMessage] = useState('')
  const lastPrefillIdRef = useRef(null)
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

  useEffect(() => {
    if (!prefill?.id || lastPrefillIdRef.current === prefill.id) return
    lastPrefillIdRef.current = prefill.id

    setDraft(current => ({
      ...current,
      device: current.device || prefill.device || '',
      exactIssue: current.exactIssue || prefill.exactIssue || '',
      stepsResult: appendDraftText(current.stepsResult, prefill.stepsResult),
      resolutionNextSteps: appendDraftText(current.resolutionNextSteps, prefill.resolutionNextSteps),
      outcome: current.outcome || prefill.outcome || '',
    }))
    setCopyState('idle')
    setNoteState('idle')
    setNoteError('')
    setHandoffMessage('Guided troubleshooting added to this draft. Review it before saving.')
    onPrefillApplied?.(prefill.id)
  }, [prefill, onPrefillApplied])

  useEffect(() => {
    if (!open) return undefined

    let live = true
    setNotesLoading(true)
    setNoteError('')
    loadOwnCallNotes()
      .then(notes => {
        if (live) setSavedNotes(notes)
      })
      .catch(error => {
        if (live) setNoteError(error?.message || 'Could not load saved call notes.')
      })
      .finally(() => {
        if (live) setNotesLoading(false)
      })

    return () => {
      live = false
    }
  }, [open])

  function update(key, value) {
    setDraft(current => ({ ...current, [key]: value }))
    if (copyState !== 'idle') setCopyState('idle')
    if (noteState !== 'idle') setNoteState('idle')
    if (noteError) setNoteError('')
    if (handoffMessage) setHandoffMessage('')
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

  async function saveDocumentation() {
    if (!filledCount) {
      setNoteError('Add call details before saving this note.')
      return
    }

    setNoteState('saving')
    setNoteError('')
    try {
      const saved = await saveOwnCallNote({
        id: activeNoteId,
        draft,
      })
      setActiveNoteId(saved.id)
      setSavedNotes(current => [saved, ...current.filter(note => note.id !== saved.id)])
      setNoteState('saved')
      window.setTimeout(() => setNoteState(current => current === 'saved' ? 'idle' : current), 1800)
    } catch (error) {
      setNoteState('idle')
      setNoteError(error?.message || 'Could not save this call note.')
    }
  }

  function openSavedNote(note) {
    if (onOpenSavedNotes) {
      onOpenSavedNotes(note.id)
      return
    }
    setDraft(restoredDraft(note))
    setActiveNoteId(note.id)
    setCopyState('idle')
    setNoteState('idle')
    setNoteError('')
  }

  function clearDocumentation() {
    if (!window.confirm('Clear this documentation draft for the next call? Saved notes will not be deleted.')) return
    setDraft(createInitialDraft())
    setActiveNoteId(null)
    setCopyState('idle')
    setNoteState('idle')
    setNoteError('')
    setHandoffMessage('')
  }

  if (!open) return null

  if (minimized) {
    return <aside style={{ '--tool-stack-offset': `${Math.max(0, stackIndex) * 4.25}rem` }} className="documentation-dock documentation-dock-minimized" aria-label="Call Documentation minimized">
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
        <span className="documentation-dock-kicker">Live tool · protected notes</span>
        <h2 id="call-documentation-dock-title">Call Documentation</h2>
      </div>
      <div className="documentation-dock-window-actions">
        <button type="button" aria-label="Minimize Call Documentation" title="Minimize" onClick={onMinimize}>—</button>
        <button type="button" aria-label="Close Call Documentation" title="Close" onClick={onClose}>×</button>
      </div>
    </header>

    <div className="documentation-dock-body">
      <aside className="documentation-dock-privacy">
        <strong>Protected workspace note · retained for 90 days</strong>
        <span>Your saved notes are limited to your account. Workspace Admin can review, manage, and delete saved notes for reporting and follow-up.</span>
        <span>Do not enter passwords, full payment card numbers, government IDs, or other prohibited sensitive information.</span>
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

      <details className="documentation-dock-preview">
        <summary>Saved notes ({savedNotes.length})</summary>
        {notesLoading ? <p>Loading saved notes…</p> : savedNotes.length ? (
          <div className="documentation-saved-notes">
            {savedNotes.map(note => <article key={note.id} className={activeNoteId === note.id ? 'active' : ''}>
              <div>
                <strong>{note.caller_ref || note.device || 'Saved call note'}</strong>
                <small>
                  {new Date(note.created_at).toLocaleString()}
                  {note.outcome ? ` · ${note.outcome}` : ''}
                </small>
              </div>
              <div className="documentation-saved-note-actions">
                <button type="button" onClick={() => openSavedNote(note)}>Open</button>
              </div>
            </article>)}
          </div>
        ) : <p>No saved call notes yet.</p>}
      </details>

      <footer className="documentation-dock-footer">
        <div className="documentation-dock-actions">
          <button type="button" className="documentation-copy" disabled={noteState === 'saving'} onClick={saveDocumentation}>
            {noteState === 'saving' ? 'Saving…' : noteState === 'saved' ? 'Saved securely' : activeNoteId ? 'Update saved note' : 'Save note'}
          </button>
          <button type="button" className="documentation-copy" onClick={copyDocumentation}>
            {copyState === 'copied' ? 'Copied documentation' : 'Copy documentation'}
          </button>
          <button type="button" className="documentation-clear" onClick={clearDocumentation}>Clear</button>
        </div>
        {noteError && <span role="alert">{noteError}</span>}
        {handoffMessage && <span className="documentation-handoff-status" role="status">{handoffMessage}</span>}
        {copyState === 'failed' && <span role="status">Copy failed. Open the preview and copy manually.</span>}
        <small>Source: {SOURCE_TITLE}</small>
      </footer>
    </div>
  </aside>
}
