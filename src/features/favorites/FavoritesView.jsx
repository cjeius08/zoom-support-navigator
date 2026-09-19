import { PROCESSES } from '../../data/processes'
import { routeById } from '../navigator/commonIssueRoutes'
import { FavoriteToggle } from './FavoriteToggle'

function resolveFavorite(item) {
  if (item.itemType === 'process') {
    const process = PROCESSES.find(candidate => candidate.id === item.itemId)
    return process
      ? {
          ...item,
          kindLabel: 'Process Guide',
          title: process.title,
          description: process.purpose,
          category: process.category,
          available: true,
        }
      : { ...item, kindLabel: 'Process Guide', title: item.itemId, description: 'This saved Process Guide is no longer available.', available: false }
  }

  const route = routeById(item.itemId)
  return route
    ? {
        ...item,
        kindLabel: 'Common Issue',
        title: route.title,
        description: route.subtitle,
        category: route.group,
        available: true,
      }
    : { ...item, kindLabel: 'Common Issue', title: item.itemId, description: 'This saved Common Issue is no longer available.', available: false }
}

export function FavoritesView({
  favorites = [],
  loading = false,
  error = '',
  busyFor = () => false,
  onToggleFavorite = () => {},
  onOpenProcess = () => {},
  onOpenCommonIssue = () => {},
}) {
  const items = favorites.map(resolveFavorite)
  const commonIssues = items.filter(item => item.itemType === 'common_issue')
  const processes = items.filter(item => item.itemType === 'process')

  function openItem(item) {
    if (!item.available) return
    if (item.itemType === 'process') onOpenProcess(item.itemId)
    else onOpenCommonIssue(item.itemId)
  }

  return <section className="console-view favorites-view" aria-labelledby="favorites-title">
    <p className="eyebrow">Personal quick access</p>
    <h1 id="favorites-title">Favorites</h1>
    <p>Save the Zoom routes and Process Guides you use most. Favorites belong to your account and stay available from this sidebar tab.</p>

    {error && <p className="favorites-error" role="alert">{error}</p>}
    {loading && <p role="status">Loading your Favorites…</p>}

    {!loading && items.length === 0 && <section className="favorites-empty">
      <div className="favorites-empty-star" aria-hidden="true">☆</div>
      <h2>No Favorites yet</h2>
      <p>Open a Common Issue or Process Guide in Navigator and select the star to keep it here.</p>
    </section>}

    {!loading && commonIssues.length > 0 && <section className="favorites-group" aria-labelledby="favorite-common-issues">
      <div className="favorites-group-heading">
        <div>
          <span>Live-call shortcuts</span>
          <h2 id="favorite-common-issues">Common Issues</h2>
        </div>
        <b>{commonIssues.length}</b>
      </div>
      <div className="favorites-grid">
        {commonIssues.map(item => <article className="favorite-saved-card" key={`${item.itemType}-${item.itemId}`}>
          <button type="button" className="favorite-open-button" disabled={!item.available} onClick={() => openItem(item)}>
            <span className="result-type-badge">{item.kindLabel}</span>
            <strong>{item.title}</strong>
            <small>{item.description}</small>
            {item.available && <b>Open Quick Guide →</b>}
          </button>
          <FavoriteToggle
            active
            compact
            busy={busyFor(item.itemType, item.itemId)}
            label={item.title}
            onToggle={() => onToggleFavorite(item.itemType, item.itemId)}
          />
        </article>)}
      </div>
    </section>}

    {!loading && processes.length > 0 && <section className="favorites-group" aria-labelledby="favorite-process-guides">
      <div className="favorites-group-heading">
        <div>
          <span>Approved documentation</span>
          <h2 id="favorite-process-guides">Process Guides</h2>
        </div>
        <b>{processes.length}</b>
      </div>
      <div className="favorites-grid">
        {processes.map(item => <article className="favorite-saved-card" key={`${item.itemType}-${item.itemId}`}>
          <button type="button" className="favorite-open-button" disabled={!item.available} onClick={() => openItem(item)}>
            <span className="result-type-badge">{item.kindLabel}</span>
            <strong>{item.title}</strong>
            <small>{item.description}</small>
            {item.available && <b>Open Process Guide →</b>}
          </button>
          <FavoriteToggle
            active
            compact
            busy={busyFor(item.itemType, item.itemId)}
            label={item.title}
            onToggle={() => onToggleFavorite(item.itemType, item.itemId)}
          />
        </article>)}
      </div>
    </section>}
  </section>
}
