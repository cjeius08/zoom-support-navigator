import { useEffect, useMemo, useState } from 'react'
import { deleteCallNoteAsAdmin, loadCallNotesReport } from '../../lib/adminApi'
import { formatCallDocumentation } from '../training/callDocumentationFormat'
import './savedNotes.css'

const FOLLOW_UP_OUTCOME = 'Follow-Up Required'

function personLabel(person) {
  if (!person) return 'Unknown user'
  return person.username || person.initials || 'Unknown user'
}

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

function noteSearchText(note, person) {
  return [
    person?.username,
    person?.initials,
    note.caller_ref,
    note.device,
    note.outcome,
    note.call_started_at,
    JSON.stringify(note.draft || {}),
  ].filter(Boolean).join(' ').toLowerCase()
}

export function SavedNotesPage({ initialUserId = '' }) {
  const [state, setState] = useState({ loading: true, data: null, error: '' })
  const [query, setQuery] = useState('')
  const [userId, setUserId] = useState(initialUserId || '')
  const [outcome, setOutcome] = useState('')
  const [device, setDevice] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [followUpOnly, setFollowUpOnly] = useState(false)
  const [sortOrder, setSortOrder] = useState('newest')
  const [deletingId, setDeletingId] = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    setUserId(initialUserId || '')
  }, [initialUserId])

  useEffect(() => {
    let live = true
    setState({ loading: true, data: null, error: '' })
    loadCallNotesReport({})
      .then(data => {
        if (live) setState({ loading: false, data, error: '' })
      })
      .catch(error => {
        if (live) setState({ loading: false, data: null, error: error?.message || 'Could not load saved notes.' })
      })

    return () => {
      live = false
    }
  }, [])

  const report = useMemo(() => {
    const notes = state.data?.notes || []
    const profiles = state.data?.profiles || []
    const people = new Map(profiles.map(person => [person.id, person]))
    const outcomes = [...new Set(notes.map(note => note.outcome).filter(Boolean))].sort()
    const devices = [...new Set(notes.map(note => note.device).filter(Boolean))].sort()
    const usersWithNotes = new Set(notes.map(note => note.user_id)).size
    const followUps = notes.filter(note => note.outcome === FOLLOW_UP_OUTCOME).length
    return { notes, profiles, people, outcomes, devices, usersWithNotes, followUps }
  }, [state.data])

  const visibleNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const start = dateStart(startDate)
    const end = dateEnd(endDate)

    return report.notes
      .filter(note => {
        const person = report.people.get(note.user_id)
        const created = new Date(note.created_at)
        if (userId && note.user_id !== userId) return false
        if (outcome && note.outcome !== outcome) return false
        if (device && note.device !== device) return false
        if (followUpOnly && note.outcome !== FOLLOW_UP_OUTCOME) return false
        if (start && created < start) return false
        if (end && created > end) return false
        if (normalizedQuery && !noteSearchText(note, person).includes(normalizedQuery)) return false
        return true
      })
      .sort((a, b) => {
        const delta = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        return sortOrder === 'oldest' ? -delta : delta
      })
  }, [device, endDate, followUpOnly, outcome, query, report, sortOrder, startDate, userId])

  function clearFilters() {
    setQuery('')
    setUserId('')
    setOutcome('')
    setDevice('')
    setStartDate('')
    setEndDate('')
    setFollowUpOnly(false)
    setSortOrder('newest')
  }

  async function deleteNote(note) {
    if (deletingId) return
    const label = note.caller_ref || note.device || 'this saved note'
    if (!window.confirm(`Delete ${label}? This permanently removes the protected note and cannot be undone.`)) return

    setDeletingId(note.id)
    setActionError('')
    try {
      await deleteCallNoteAsAdmin(note.id)
      setState(current => ({
        ...current,
        data: {
          ...(current.data || {}),
          notes: (current.data?.notes || []).filter(item => item.id !== note.id),
        },
      }))
    } catch (error) {
      setActionError(error?.message || 'Could not delete this saved note.')
    } finally {
      setDeletingId('')
    }
  }

  return <section className="console-view saved-notes-page">
    <div className="view-heading saved-notes-heading">
      <div>
        <p className="eyebrow">Admin only · protected documentation</p>
        <h1>Saved Notes & Follow-Ups</h1>
        <p>
          Review saved Call Documentation in one place. Follow-Up Required notes are highlighted,
          and every saved field can be searched or filtered.
        </p>
      </div>
    </div>

    {state.loading ? <p>Loading protected saved notes…</p> : state.error ? <p role="alert">{state.error}</p> : <>
      <div className="saved-notes-summary" aria-label="Saved notes summary">
        <button type="button" className={!followUpOnly ? 'active' : ''} onClick={() => setFollowUpOnly(false)}>
          <strong>{report.notes.length}</strong>
          <span>All Saved Notes</span>
        </button>
        <button type="button" className={followUpOnly ? 'active follow-up' : 'follow-up'} onClick={() => setFollowUpOnly(true)}>
          <strong>{report.followUps}</strong>
          <span>Follow-Up Required</span>
        </button>
        <div>
          <strong>{report.usersWithNotes}</strong>
          <span>Users With Notes</span>
        </div>
        <div>
          <strong>90 days</strong>
          <span>Retention</span>
        </div>
      </div>

      <section className="saved-notes-filter-card" aria-label="Saved note filters">
        <div className="saved-notes-search-row">
          <label className="saved-notes-search">
            <span>Search saved fields</span>
            <input
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Caller ref, issue, next step, contact, device…"
            />
          </label>
          <label>
            <span>Sort</span>
            <select value={sortOrder} onChange={event => setSortOrder(event.target.value)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
        </div>

        <div className="saved-notes-filter-grid">
          <label>
            <span>User</span>
            <select value={userId} onChange={event => setUserId(event.target.value)}>
              <option value="">All users</option>
              {report.profiles
                .filter(person => report.notes.some(note => note.user_id === person.id))
                .map(person => <option value={person.id} key={person.id}>{personLabel(person)} ({person.initials || '—'})</option>)}
            </select>
          </label>
          <label>
            <span>Outcome</span>
            <select value={outcome} onChange={event => setOutcome(event.target.value)}>
              <option value="">All outcomes</option>
              {report.outcomes.map(item => <option value={item} key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>Device</span>
            <select value={device} onChange={event => setDevice(event.target.value)}>
              <option value="">All devices</option>
              {report.devices.map(item => <option value={item} key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>Saved from</span>
            <input type="date" value={startDate} onChange={event => setStartDate(event.target.value)} />
          </label>
          <label>
            <span>Saved through</span>
            <input type="date" value={endDate} onChange={event => setEndDate(event.target.value)} />
          </label>
        </div>

        <div className="saved-notes-filter-actions">
          <label className="saved-notes-follow-toggle">
            <input type="checkbox" checked={followUpOnly} onChange={event => setFollowUpOnly(event.target.checked)} />
            <span>Follow-Up Required only</span>
          </label>
          <button type="button" onClick={clearFilters}>Clear filters</button>
        </div>
      </section>

      {actionError && <p role="alert">{actionError}</p>}
      <p className="saved-notes-result-count" role="status">{visibleNotes.length} note{visibleNotes.length === 1 ? '' : 's'} shown</p>

      {visibleNotes.length ? <div className="saved-notes-list">
        {visibleNotes.map(note => {
          const person = report.people.get(note.user_id)
          const isFollowUp = note.outcome === FOLLOW_UP_OUTCOME
          return <article className={`saved-note-card ${isFollowUp ? 'follow-up' : ''}`} key={note.id}>
            <header>
              <div className="saved-note-person">
                <button
                  type="button"
                  onClick={() => setUserId(note.user_id)}
                  title={`Show all notes for ${personLabel(person)}`}
                >
                  <strong>{personLabel(person)}</strong>
                  <small>{person?.initials || '—'}</small>
                </button>
                {isFollowUp && <span className="saved-note-follow-badge">Follow-Up Required</span>}
              </div>
              <div className="saved-note-time">
                <strong>{new Date(note.created_at).toLocaleString()}</strong>
                <small>Retained until {new Date(note.expires_at).toLocaleDateString()}</small>
              </div>
            </header>

            <dl className="saved-note-meta">
              <div><dt>Caller ref</dt><dd>{note.caller_ref || '—'}</dd></div>
              <div><dt>Device</dt><dd>{note.device || '—'}</dd></div>
              <div><dt>Outcome</dt><dd>{note.outcome || '—'}</dd></div>
              <div><dt>Call time</dt><dd>{note.call_started_at ? new Date(note.call_started_at).toLocaleString() : '—'}</dd></div>
            </dl>

            <details className="saved-note-details">
              <summary>Open saved documentation</summary>
              <pre>{formatCallDocumentation(note.draft || {})}</pre>
            </details>

            <footer>
              <button
                type="button"
                className="danger-action"
                disabled={deletingId === note.id}
                onClick={() => deleteNote(note)}
              >
                {deletingId === note.id ? 'Deleting…' : 'Delete note'}
              </button>
            </footer>
          </article>
        })}
      </div> : <div className="empty-state saved-notes-empty">
        <h2>No saved notes match these filters</h2>
        <p>Clear filters or choose All Saved Notes to review the full protected note history.</p>
      </div>}
    </>}
  </section>
}
