import { useState } from 'react'
import { CONSOLE_METADATA, formatConsoleDate, lastUpdatedForAudience, updatesForAudience } from './updatesData'
import './updates.css'

export function UpdatesView({ isAdmin = false }) {
  const [search, setSearch] = useState('')
  const visibleUpdates = updatesForAudience(isAdmin)
  const term = search.trim().toLocaleLowerCase()
  const matchingUpdates = term
    ? visibleUpdates.filter(entry => [entry.title, entry.area, entry.changed, entry.date]
      .some(value => String(value || '').toLocaleLowerCase().includes(term)))
    : visibleUpdates
  const metadataRows = [
    ['Workspace Version', CONSOLE_METADATA.version],
    ['Effective Date', formatConsoleDate(CONSOLE_METADATA.effectiveDate)],
    ['Last Updated', formatConsoleDate(lastUpdatedForAudience(isAdmin))],
    ['Workspace Lead', CONSOLE_METADATA.owner],
    ['Collaborator', CONSOLE_METADATA.collaborator],
    ['Next Review', formatConsoleDate(CONSOLE_METADATA.nextReview)],
  ]

  return (
    <section className="console-view updates-view" aria-labelledby="updates-title">
      <header className="view-heading updates-heading">
        <div>
          <p className="eyebrow">Workspace change log</p>
          <h1 id="updates-title">What’s New / Updates</h1>
          <p>Recent workspace changes with concise verification notes where they are still useful.</p>
        </div>
        <span className="updates-version-pill">Workspace v{CONSOLE_METADATA.version}</span>
      </header>

      <dl className="console-metadata" aria-label="Workspace information">
        {metadataRows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      {CONSOLE_METADATA.updatePolicy && <aside className="updates-policy" aria-label="Update policy">
        <div>
          <span>Update policy</span>
          <strong>What gets listed here?</strong>
        </div>
        <p>{CONSOLE_METADATA.updatePolicy}</p>
      </aside>}

      <div className="updates-searchbar" role="search" aria-label="Search update history">
        <label htmlFor="updates-search">Find an update</label>
        <div className="updates-search-controls">
          <input id="updates-search" type="search" value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search features, fixes or dates..." />
          {search && <button type="button" onClick={() => setSearch('')}>Clear search</button>}
        </div>
        <p role="status" aria-live="polite">
          Showing {matchingUpdates.length} of {visibleUpdates.length} updates
        </p>
      </div>

      <div className="updates-list" aria-label="Update history">
        {matchingUpdates.map((entry) => (
          <article className="update-card" key={entry.id}>
            <header>
              <div>
                <div className="update-card-meta">
                  <span className="update-area">{entry.area}</span>
                  {isAdmin && entry.audience === 'admin' && <span className="update-audience-badge">Admin only</span>}
                  {entry.status === 'historical' && <span className="update-history-badge">Historical</span>}
                </div>
                <h2>{entry.title}</h2>
              </div>
              <time dateTime={entry.date}>{formatConsoleDate(entry.date, { short: true })}</time>
            </header>
            <div className="update-details">
              <section>
                <h3>What changed</h3>
                <p>{entry.changed}</p>
              </section>
              {entry.checks?.length > 0 && <section>
                <h3>Verification</h3>
                <ul>
                  {entry.checks.map((check) => <li key={check}>{check}</li>)}
                </ul>
              </section>}
            </div>
          </article>
        ))}
        {matchingUpdates.length === 0 && <div className="updates-empty" role="status">
          <strong>No updates match your search.</strong>
          <p>Try a different keyword, or clear the search to view all release notes.</p>
        </div>}
      </div>
    </section>
  )
}
