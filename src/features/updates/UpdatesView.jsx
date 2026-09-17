import { CONSOLE_METADATA, LAST_UPDATED, UPDATES, formatConsoleDate } from './updatesData'
import './updates.css'

const metadataRows = [
  ['Console Version', CONSOLE_METADATA.version],
  ['Effective Date', formatConsoleDate(CONSOLE_METADATA.effectiveDate)],
  ['Last Updated', formatConsoleDate(LAST_UPDATED)],
  ['Owner', CONSOLE_METADATA.owner],
  ['Collaborator', CONSOLE_METADATA.collaborator],
  ['Next Review', formatConsoleDate(CONSOLE_METADATA.nextReview)],
]

export function UpdatesView() {
  return (
    <section className="console-view updates-view" aria-labelledby="updates-title">
      <header className="view-heading updates-heading">
        <div>
          <p className="eyebrow">Console change log</p>
          <h1 id="updates-title">What’s New / Updates</h1>
          <p>Recent user-facing changes and the exact items to check after an update.</p>
        </div>
        <span className="updates-version-pill">Console v{CONSOLE_METADATA.version}</span>
      </header>

      <dl className="console-metadata" aria-label="Console information">
        {metadataRows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <div className="updates-list" aria-label="Update history">
        {UPDATES.map((entry) => (
          <article className="update-card" key={entry.id}>
            <header>
              <div>
                <span className="update-area">{entry.area}</span>
                <h2>{entry.title}</h2>
              </div>
              <time dateTime={entry.date}>{formatConsoleDate(entry.date, { short: true })}</time>
            </header>
            <div className="update-details">
              <section>
                <h3>What changed</h3>
                <p>{entry.changed}</p>
              </section>
              <section>
                <h3>What to check</h3>
                <ul>
                  {entry.checks.map((check) => <li key={check}>{check}</li>)}
                </ul>
              </section>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
