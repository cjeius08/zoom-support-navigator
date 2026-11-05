import { useEffect, useMemo, useRef, useState } from 'react'
import { loadOwnCallNotes, saveOwnCallNote } from '../../lib/callNotesApi'
import { formatCallDocumentation } from './callDocumentationFormat'

const SOURCE_TITLE = 'Zoom Basic Support Boundaries, Decision Path & Referral Process'
const GOOGLE_CALL_REPORT_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfqGpww1r9ekEJpuWRdnlBiEVSb69vQXx0m3Gc5wJrAWrtntw/viewform'
const GOOGLE_CALL_REPORT_FIELDS = {
  callerRef: 'entry.1395919275',
  reasonForCall: 'entry.594573595',
  outcome: 'entry.865679921',
}

const DEVICE_OPTIONS = [
  'Windows',
  'Mac',
  'Browser',
  'iPhone / iPad',
  'Android',
  'Linux',
  'Other / Unknown',
]

const REASON_FOR_CALL_OPTIONS = [
  'Join & Access',
  'Audio & Video',
  'Controls & Features',
  'Install & Setup',
  'Scheduling & Invites',
  'General Inquiry',
  'Wrong Number / Misrouted Call',
  'Disconnected / Dropped Call',
]

const OUTCOMES = [
  'Resolved',
  'Not Resolved',
  'Not Resolved | Escalated',
  'Callback | Resolved',
  'Callback | Not Resolved',
  'Dropped Call',
]

function createInitialDraft() {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)

  return {
    callerName: '',
    phoneNumber: '',
    dateTime: local,
    callerRef: '',
    reasonForCall: '',
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


const WINDOW_LAYOUT_KEY = 'ozzie.callDocumentation.windowLayout.v1'
const WINDOW_GUTTER = 12
const WINDOW_MIN_WIDTH = 320
const WINDOW_MIN_HEIGHT = 340

// Store only UI coordinates and dimensions. Call data is never written to localStorage.
function clampWindowLayout(layout) {
  const viewportWidth = Math.max(320, window.innerWidth)
  const viewportHeight = Math.max(380, window.innerHeight)
  const maxWidth = Math.max(280, viewportWidth - WINDOW_GUTTER * 2)
  const maxHeight = Math.max(300, viewportHeight - WINDOW_GUTTER * 2)
  const width = Math.min(Math.max(Math.min(WINDOW_MIN_WIDTH, maxWidth), Number(layout.width) || 360), maxWidth)
  const height = Math.min(Math.max(Math.min(WINDOW_MIN_HEIGHT, maxHeight), Number(layout.height) || 580), maxHeight)
  const x = Math.min(Math.max(WINDOW_GUTTER, Number(layout.x) || WINDOW_GUTTER), Math.max(WINDOW_GUTTER, viewportWidth - width - WINDOW_GUTTER))
  const y = Math.min(Math.max(WINDOW_GUTTER, Number(layout.y) || WINDOW_GUTTER), Math.max(WINDOW_GUTTER, viewportHeight - height - WINDOW_GUTTER))
  return { x, y, width, height }
}

function defaultWindowLayout() {
  const width = Math.min(360, Math.max(280, window.innerWidth - 24))
  const height = Math.min(590, Math.max(300, window.innerHeight - 116))
  return clampWindowLayout({ x: window.innerWidth - width - 22, y: 80, width, height })
}

function initialWindowLayout() {
  if (typeof window === 'undefined') return { x: 24, y: 80, width: 360, height: 590 }
  try {
    const value = JSON.parse(window.localStorage.getItem(WINDOW_LAYOUT_KEY) || 'null')
    if (value && ['x', 'y', 'width', 'height'].every(key => Number.isFinite(value[key]))) {
      return clampWindowLayout(value)
    }
  } catch { /* Storage is optional; never block notes because of browser privacy settings. */ }
  return defaultWindowLayout()
}

function Field({ label, hint, children }) {
  return <label className="documentation-dock-field">
    <span>{label}</span>
    {hint && <small>{hint}</small>}
    {children}
  </label>
}

export function CallDocumentation({ open = false, minimized = false, stackIndex = 0, onMinimize = () => {}, onClose = () => {}, onOpenSavedNotes = null, prefill = null, onPrefillApplied = () => {}, resetToken = 0 }) {
  const [draft, setDraft] = useState(createInitialDraft)
  const [windowLayout, setWindowLayout] = useState(initialWindowLayout)
  const windowLayoutRef = useRef(windowLayout)
  const pointerGestureRef = useRef(null)
  const [copyState, setCopyState] = useState('idle')
  const [activeNoteId, setActiveNoteId] = useState(null)
  const [savedNotes, setSavedNotes] = useState([])
  const [notesLoading, setNotesLoading] = useState(false)
  const [noteState, setNoteState] = useState('idle')
  const [noteError, setNoteError] = useState('')
  const [handoffMessage, setHandoffMessage] = useState('')
  const lastPrefillIdRef = useRef(null)
  const lastResetTokenRef = useRef(resetToken)
  const formatted = useMemo(() => formatCallDocumentation(draft), [draft])
  const filledCount = useMemo(() => [
    draft.callerName,
    draft.phoneNumber,
    draft.callerRef,
    draft.reasonForCall,
    draft.device,
    draft.accessContext,
    draft.exactIssue,
    draft.stepsResult,
    draft.resolutionNextSteps,
    draft.recommendedContact,
    draft.outcome,
  ].filter(Boolean).length, [draft])


  function updateWindowLayout(next) {
    const clamped = clampWindowLayout(next)
    windowLayoutRef.current = clamped
    setWindowLayout(clamped)
  }

  function saveWindowLayout() {
    try { window.localStorage.setItem(WINDOW_LAYOUT_KEY, JSON.stringify(windowLayoutRef.current)) }
    catch { /* Keep drag and resize usable without localStorage. */ }
  }

  useEffect(() => {
    const handleResize = () => updateWindowLayout(windowLayoutRef.current)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  function beginWindowGesture(event, kind) {
    if (window.innerWidth <= 800 || (event.pointerType === 'mouse' && event.button !== 0)) return
    if (kind === 'move' && event.target.closest?.('button, a, input, select, textarea, summary')) return
    if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return
    event.preventDefault()
    pointerGestureRef.current = {
      pointerId: event.pointerId, kind, originX: event.clientX, originY: event.clientY,
      startingLayout: windowLayoutRef.current,
    }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  function moveWindowGesture(event) {
    const gesture = pointerGestureRef.current
    if (!gesture || event.pointerId !== gesture.pointerId) return
    if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return
    const dx = event.clientX - gesture.originX
    const dy = event.clientY - gesture.originY
    const previous = gesture.startingLayout
    if (gesture.kind === 'move') {
      updateWindowLayout({ ...previous, x: previous.x + dx, y: previous.y + dy })
    } else {
      updateWindowLayout({ ...previous, width: previous.width + dx, height: previous.height + dy })
    }
  }

  function finishWindowGesture(event) {
    const gesture = pointerGestureRef.current
    if (!gesture || event.pointerId !== gesture.pointerId) return
    pointerGestureRef.current = null
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    saveWindowLayout()
  }

  function moveWindowWithKeyboard(event) {
    if (event.target !== event.currentTarget) return
    if (window.innerWidth <= 800 || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
    event.preventDefault()
    const delta = event.shiftKey ? 40 : 16
    const offsets = { ArrowLeft: [-delta, 0], ArrowRight: [delta, 0], ArrowUp: [0, -delta], ArrowDown: [0, delta] }
    const [dx, dy] = offsets[event.key]
    updateWindowLayout({ ...windowLayoutRef.current, x: windowLayoutRef.current.x + dx, y: windowLayoutRef.current.y + dy })
    // Keyboard movement is infrequent and should persist immediately.
    try { window.localStorage.setItem(WINDOW_LAYOUT_KEY, JSON.stringify(clampWindowLayout({
      ...windowLayoutRef.current, x: windowLayoutRef.current.x, y: windowLayoutRef.current.y,
    }))) } catch { /* UI still works. */ }
  }

  function resizeWindowWithKeyboard(event) {
    if (window.innerWidth <= 800 || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
    event.preventDefault()
    const step = event.shiftKey ? 40 : 16
    const size = windowLayoutRef.current
    updateWindowLayout({
      ...size,
      width: size.width + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0),
      height: size.height + (event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0),
    })
    saveWindowLayout()
  }

  useEffect(() => {
    if (lastResetTokenRef.current === resetToken) return
    lastResetTokenRef.current = resetToken
    lastPrefillIdRef.current = null
    setDraft(createInitialDraft())
    setActiveNoteId(null)
    setCopyState('idle')
    setNoteState('idle')
    setNoteError('')
    setHandoffMessage('')
  }, [resetToken])

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

  function openGoogleCallReport() {
    if (!draft.callerRef || !draft.reasonForCall || !draft.outcome) {
      setNoteError('Add Caller ref, Reason for the Call, and Call outcome before opening the Google report.')
      return
    }

    const params = new URLSearchParams({
      usp: 'pp_url',
      [GOOGLE_CALL_REPORT_FIELDS.callerRef]: draft.callerRef,
      [GOOGLE_CALL_REPORT_FIELDS.reasonForCall]: draft.reasonForCall,
      [GOOGLE_CALL_REPORT_FIELDS.outcome]: draft.outcome,
    })
    const reportUrl = `${GOOGLE_CALL_REPORT_URL}?${params.toString()}`
    window.open(reportUrl, '_blank', 'noopener,noreferrer')
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
    return <aside style={{ '--tool-stack-offset': `${Math.max(0, stackIndex) * 4.25}rem`, '--tool-stack-offset-compact': `${Math.max(0, stackIndex) * 3.25}rem` }} className="documentation-dock documentation-dock-minimized documentation-dock-mini-chip" aria-label="Call Documentation minimized">
      <button type="button" className="documentation-dock-restore" aria-label="Restore Call Documentation" title="Restore Call Documentation" onClick={onMinimize}>
        <span>
          <strong>Call Documentation</strong>
          <small>{filledCount ? `${filledCount} fields in draft` : 'Draft ready'}</small>
        </span>
        <span aria-hidden="true">▣</span>
      </button>
      <button type="button" className="documentation-dock-close" aria-label="Close Call Documentation" onClick={onClose}>×</button>
    </aside>
  }

  return <aside className="documentation-dock documentation-dock-floating" aria-labelledby="call-documentation-dock-title"
    style={{
      '--call-window-x': windowLayout.x + 'px',
      '--call-window-y': windowLayout.y + 'px',
      '--call-window-width': windowLayout.width + 'px',
      '--call-window-height': windowLayout.height + 'px',
    }}>
    <header className="documentation-dock-header documentation-dock-drag-handle"
      aria-label="Move Call Documentation window with arrow keys, or drag this header"
      title="Drag to move · Arrow keys move when focused"
      tabIndex={0}
      onPointerDown={event => beginWindowGesture(event, 'move')}
      onPointerMove={moveWindowGesture}
      onPointerUp={finishWindowGesture}
      onPointerCancel={finishWindowGesture}
      onKeyDown={moveWindowWithKeyboard}>
      <div>
        <span className="documentation-dock-kicker">⠿ Drag this bar to move · Protected notes</span>
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
        <summary><span>2</span> Reason, device and exact issue</summary>
        <div className="documentation-dock-fields">
          <Field label="Reason for the Call" hint="Select the primary call driver for reporting.">
            <select value={draft.reasonForCall} onChange={event => update('reasonForCall', event.target.value)}>
              <option value="">Select reason</option>
              {REASON_FOR_CALL_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </Field>
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
          <button type="button" className="documentation-copy" onClick={openGoogleCallReport}>Open pre-filled Google report</button>
          <button type="button" className="documentation-clear" onClick={clearDocumentation}>Clear</button>
        </div>
        {noteError && <span role="alert">{noteError}</span>}
        {handoffMessage && <span className="documentation-handoff-status" role="status">{handoffMessage}</span>}
        {copyState === 'failed' && <span role="status">Copy failed. Open the preview and copy manually.</span>}
        <small>Google report sends only Caller ref, Reason for the Call, and Call outcome. Review the pre-filled form before submitting.</small>
        <small>Source: {SOURCE_TITLE}</small>
      </footer>
    </div>
    <button className="documentation-dock-resize-handle" type="button"
      aria-label="Resize Call Documentation"
      title="Drag to resize · Arrow keys adjust size"
      onPointerDown={event => beginWindowGesture(event, 'resize')}
      onPointerMove={moveWindowGesture}
      onPointerUp={finishWindowGesture}
      onPointerCancel={finishWindowGesture}
      onKeyDown={resizeWindowWithKeyboard}>⌟</button>
  </aside>
}
