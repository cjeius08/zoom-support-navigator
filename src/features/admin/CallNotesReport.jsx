import { useEffect, useMemo, useState } from 'react'
import { loadCallNotesReport } from '../../lib/adminApi'
import { formatCallDocumentation } from '../training/callDocumentationFormat'

function personLabel(person) {
  if (!person) return 'Unknown user'
  return person.username || person.initials || 'Unknown user'
}

export function CallNotesReport({ range, onOpenNotes = () => {} }) {
  const [state, setState] = useState({ loading: true, data: null, error: '' })

  useEffect(() => {
    let live = true
    setState(current => ({ ...current, loading: true, error: '' }))

    loadCallNotesReport(range)
      .then(data => {
        if (live) setState({ loading: false, data, error: '' })
      })
      .catch(error => {
        if (live) setState({ loading: false, data: null, error: error?.message || 'Could not load call notes.' })
      })

    return () => {
      live = false
    }
  }, [range])

  const report = useMemo(() => {
    const notes = state.data?.notes || []
    const profiles = state.data?.profiles || []
    const people = new Map(profiles.map(person => [person.id, person]))
    const usersWithNotes = new Set(notes.map(note => note.user_id)).size
    return { notes, people, usersWithNotes }
  }, [state.data])

  return <section className="readiness-admin-report call-notes-report" aria-labelledby="call-notes-report-title">
    <div className="view-heading">
      <div>
        <p className="eyebrow">Protected documentation</p>
        <h2 id="call-notes-report-title">Call Notes Report</h2>
        <p>
          Saved Call Documentation is retained for 90 days. Open the dedicated Saved Notes page for follow-up filtering, full search, and admin-only deletion.
        </p>
      </div>
      <button type="button" className="primary-action" onClick={() => onOpenNotes('')}>Open Saved Notes</button>
    </div>

    {state.loading ? <p>Loading protected call notes…</p> : state.error ? <p role="alert">{state.error}</p> : <>
      <div className="real-summary usage-summary" aria-label="Call notes summary">
        <div>
          <strong>{report.notes.length}</strong>
          <span>Saved Notes</span>
        </div>
        <div>
          <strong>{report.usersWithNotes}</strong>
          <span>Users With Notes</span>
        </div>
      </div>

      {report.notes.length ? <div className="usage-user-list" aria-label="Saved call notes by user">
        {report.notes.map(note => {
          const person = report.people.get(note.user_id)
          return <article className="usage-user-row call-note-report-row" key={note.id}>
            <div className="usage-user-identity">
              <button type="button" className="call-note-person-link" onClick={() => onOpenNotes(note.user_id)}>
                <strong>{personLabel(person)}</strong>
                <small>{person?.initials || '—'} · {new Date(note.created_at).toLocaleString()}</small>
              </button>
            </div>
            <dl>
              <div><dt>Caller ref</dt><dd>{note.caller_ref || '—'}</dd></div>
              <div><dt>Device</dt><dd>{note.device || '—'}</dd></div>
              <div><dt>Outcome</dt><dd>{note.outcome || '—'}</dd></div>
              <div><dt>Retained until</dt><dd>{new Date(note.expires_at).toLocaleDateString()}</dd></div>
            </dl>
            <details className="call-note-report-details">
              <summary>View saved documentation</summary>
              <pre>{formatCallDocumentation(note.draft || {})}</pre>
            </details>
          </article>
        })}
      </div> : <div className="empty-state">
        <h3>No saved call notes in this period</h3>
        <p>Saved Call Documentation will appear here after agents use the protected Save note action.</p>
      </div>}
    </>}
  </section>
}
