import { useEffect, useMemo, useState } from 'react'
import { loadAllOwnCallNotes } from '../../lib/callNotesApi'
import { formatCallDocumentation } from '../training/callDocumentationFormat'
import '../admin/savedNotes.css'

const FOLLOW_UP_OUTCOME = 'Follow-Up Required'

function dateStart(value) {
  if (!value) return null
  const parsed = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function dateEnd(value) {
  if (!value) return null
  const parsed = new Date(`${value}T23:59:59.999`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function searchText(note) {
  return [
    note.caller_ref,
    note.device,
    note.outcome,
    note.call_started_at,
    JSON.stringify(note.draft || {}),
  ].filter(Boolean).join(' ').toLowerCase()
}

export function MySavedNotesPage({ initialNoteId = '' }) {
  const [state, setState] = useState({ loading: true, notes: [], error: '' })
  const [query, setQuery] = useState('')
  const [outcome, setOutcome] = useState('')
  const [device, setDevice] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [followUpOnly, setFollowUpOnly] = useState(false)
  const [sortOrder, setSortOrder] = useState('newest')

  useEffect(() => {
    let live = true
    loadAllOwnCallNotes()
      .then(notes => live && setState({ loading: false, notes, error: '' }))
      .catch(error => live && setState({ loading: false, notes: [], error: error?.message || 'Could not load your saved notes.' }))
    return () => { live = false }
  }, [])

  const report = useMemo(() => {
    const outcomes = [...new Set(state.notes.map(note => note.outcome).filter(Boolean))].sort()
    const devices = [...new Set(state.notes.map(note => note.device).filter(Boolean))].sort()
    const followUps = state.notes.filter(note => note.outcome === FOLLOW_UP_OUTCOME).length
    return { outcomes, devices, followUps }
  }, [state.notes])

  const visibleNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const start = dateStart(startDate)
    const end = dateEnd(endDate)
    return state.notes
      .filter(note => {
        const created = new Date(note.created_at)
        if (outcome && note.outcome !== outcome) return false
        if (device && note.device !== device) return false
        if (followUpOnly && note.outcome !== FOLLOW_UP_OUTCOME) return false
        if (start && created < start) return false
        if (end && created > end) return false
        if (normalizedQuery && !searchText(note).includes(normalizedQuery)) return false
        return true
      })
      .sort((a, b) => {
        const delta = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        return sortOrder === 'oldest' ? -delta : delta
      })
  }, [device, endDate, followUpOnly, outcome, query, sortOrder, startDate, state.notes])

  function clearFilters() {
    setQuery('')
    setOutcome('')
    setDevice('')
    setStartDate('')
    setEndDate('')
    setFollowUpOnly(false)
    setSortOrder('newest')
  }

  return <section className="console-view saved-notes-page my-saved-notes-page">
    <div className="view-heading saved-notes-heading">
      <div>
        <p className="eyebrow">Your protected documentation</p>
        <h1>My Saved Notes & Follow-Ups</h1>
        <p>Review your own saved Call Documentation here. Follow-Up Required notes are highlighted and easy to filter.</p>
      </div>
    </div>

    {state.loading ? <p>Loading your saved notes…</p> : state.error ? <p role="alert">{state.error}</p> : <>
      <div className="saved-notes-summary" aria-label="My saved notes summary">
        <button type="button" className={!followUpOnly ? 'active' : ''} onClick={() => setFollowUpOnly(false)}>
          <strong>{state.notes.length}</strong><span>All Saved Notes</span>
        </button>
        <button type="button" className={followUpOnly ? 'active follow-up' : 'follow-up'} onClick={() => setFollowUpOnly(true)}>
          <strong>{report.followUps}</strong><span>Follow-Up Required</span>
        </button>
        <div><strong>90 days</strong><span>Retention</span></div>
      </div>

      <section className="saved-notes-filter-card" aria-label="My saved note filters">
        <div className="saved-notes-search-row">
          <label className="saved-notes-search">
            <span>Search saved fields</span>
            <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Caller ref, issue, next step, device…" />
          </label>
          <label><span>Sort</span><select value={sortOrder} onChange={event => setSortOrder(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label>
        </div>
        <div className="saved-notes-filter-grid">
          <label><span>Outcome</span><select value={outcome} onChange={event => setOutcome(event.target.value)}><option value="">All outcomes</option>{report.outcomes.map(item => <option key={item}>{item}</option>)}</select></label>
          <label><span>Device</span><select value={device} onChange={event => setDevice(event.target.value)}><option value="">All devices</option>{report.devices.map(item => <option key={item}>{item}</option>)}</select></label>
          <label><span>Saved from</span><input type="date" value={startDate} onChange={event => setStartDate(event.target.value)} /></label>
          <label><span>Saved through</span><input type="date" value={endDate} onChange={event => setEndDate(event.target.value)} /></label>
        </div>
        <div className="saved-notes-filter-actions">
          <label className="saved-notes-follow-toggle"><input type="checkbox" checked={followUpOnly} onChange={event => setFollowUpOnly(event.target.checked)} /><span>Follow-Up Required only</span></label>
          <button type="button" onClick={clearFilters}>Clear filters</button>
        </div>
      </section>

      <p className="saved-notes-result-count" role="status">{visibleNotes.length} note{visibleNotes.length === 1 ? '' : 's'} shown</p>

      {visibleNotes.length ? <div className="saved-notes-list">
        {visibleNotes.map(note => {
          const followUp = note.outcome === FOLLOW_UP_OUTCOME
          const selected = note.id === initialNoteId
          return <article className={`saved-note-card ${followUp ? 'follow-up' : ''} ${selected ? 'selected' : ''}`} key={note.id}>
            <header>
              <div className="saved-note-person">
                <strong>{note.caller_ref || note.device || 'Saved call note'}</strong>
                {followUp && <span className="saved-note-follow-badge">Follow-Up Required</span>}
              </div>
              <div className="saved-note-time"><strong>{new Date(note.created_at).toLocaleString()}</strong><small>Retained until {new Date(note.expires_at).toLocaleDateString()}</small></div>
            </header>
            <dl className="saved-note-meta">
              <div><dt>Caller ref</dt><dd>{note.caller_ref || '—'}</dd></div>
              <div><dt>Device</dt><dd>{note.device || '—'}</dd></div>
              <div><dt>Outcome</dt><dd>{note.outcome || '—'}</dd></div>
              <div><dt>Call time</dt><dd>{note.call_started_at ? new Date(note.call_started_at).toLocaleString() : '—'}</dd></div>
            </dl>
            <details className="saved-note-details" open={selected || undefined}>
              <summary>Open saved documentation</summary>
              <pre>{formatCallDocumentation(note.draft || {})}</pre>
            </details>
          </article>
        })}
      </div> : <div className="empty-state saved-notes-empty"><h2>No saved notes match these filters</h2><p>Clear the filters or choose All Saved Notes.</p></div>}
    </>}
  </section>
}
