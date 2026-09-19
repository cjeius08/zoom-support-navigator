import { useState } from 'react'
import { PROCESSES } from '../../data/processes'
import { routeById } from '../navigator/commonIssueRoutes'
import { FavoriteToggle } from './FavoriteToggle'

function resolveResource(item) {
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
      : { ...item, kindLabel: 'Process Guide', title: item.itemId, description: 'This Process Guide is no longer available.', available: false }
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
    : { ...item, kindLabel: 'Common Issue', title: item.itemId, description: 'This Common Issue is no longer available.', available: false }
}

function ResourceCard({
  item,
  favorite = false,
  favoriteBusy = false,
  onOpen = () => {},
  onToggleFavorite = () => {},
}) {
  return <article className="favorite-saved-card">
    <button type="button" className="favorite-open-button" disabled={!item.available} onClick={onOpen}>
      <span className="result-type-badge">{item.kindLabel}</span>
      <strong>{item.title}</strong>
      <small>{item.description}</small>
      {item.available && <b>{item.itemType === 'process' ? 'Open Process Guide →' : 'Open Quick Guide →'}</b>}
    </button>
    <FavoriteToggle
      active={favorite}
      compact
      busy={favoriteBusy}
      label={item.title}
      onToggle={onToggleFavorite}
    />
  </article>
}

export function FavoritesView({
  favorites = [],
  loading = false,
  error = '',
  busyFor = () => false,
  isFavorite = () => false,
  onToggleFavorite = () => {},
  recentlyViewed = [],
  recentLoading = false,
  recentError = '',
  clearingRecent = false,
  onClearRecentlyViewed = () => {},
  onOpenProcess = () => {},
  onOpenCommonIssue = () => {},
}) {
  const [activeTab, setActiveTab] = useState('favorites')
  const favoriteItems = favorites.map(resolveResource)
  const commonIssues = favoriteItems.filter(item => item.itemType === 'common_issue')
  const processes = favoriteItems.filter(item => item.itemType === 'process')
  const recentItems = recentlyViewed.map(resolveResource).slice(0, 8)

  function openItem(item) {
    if (!item.available) return
    if (item.itemType === 'process') onOpenProcess(item.itemId)
    else onOpenCommonIssue(item.itemId)
  }

  return <section className="console-view favorites-view" aria-labelledby="quick-access-title">
    <p className="eyebrow">Personal quick access</p>
    <h1 id="quick-access-title">My Quick Access</h1>
    <p>Keep important Zoom resources close, then jump back to the guides you opened most recently.</p>

    <div className="quick-access-tabs" role="tablist" aria-label="Quick access">
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'favorites'}
        aria-controls="quick-access-favorites"
        id="quick-access-tab-favorites"
        onClick={() => setActiveTab('favorites')}
      >Favorites <span>{favoriteItems.length}</span></button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'recent'}
        aria-controls="quick-access-recent"
        id="quick-access-tab-recent"
        onClick={() => setActiveTab('recent')}
      >Recently Viewed <span>{recentItems.length}</span></button>
    </div>

    {activeTab === 'favorites' && <div id="quick-access-favorites" role="tabpanel" aria-labelledby="quick-access-tab-favorites">
      {error && <p className="favorites-error" role="alert">{error}</p>}
      {loading && <p role="status">Loading your Favorites…</p>}

      {!loading && favoriteItems.length === 0 && <section className="favorites-empty">
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
          {commonIssues.map(item => <ResourceCard
            key={`${item.itemType}-${item.itemId}`}
            item={item}
            favorite
            favoriteBusy={busyFor(item.itemType, item.itemId)}
            onOpen={() => openItem(item)}
            onToggleFavorite={() => onToggleFavorite(item.itemType, item.itemId)}
          />)}
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
          {processes.map(item => <ResourceCard
            key={`${item.itemType}-${item.itemId}`}
            item={item}
            favorite
            favoriteBusy={busyFor(item.itemType, item.itemId)}
            onOpen={() => openItem(item)}
            onToggleFavorite={() => onToggleFavorite(item.itemType, item.itemId)}
          />)}
        </div>
      </section>}
    </div>}

    {activeTab === 'recent' && <div id="quick-access-recent" role="tabpanel" aria-labelledby="quick-access-tab-recent">
      <div className="recently-viewed-heading">
        <div>
          <span>Automatic history</span>
          <h2>Recently Viewed</h2>
          <p>Your last 8 opened Common Issues and Process Guides, newest first.</p>
        </div>
        {recentItems.length > 0 && <button
          type="button"
          className="clear-recent-button"
          disabled={clearingRecent}
          onClick={onClearRecentlyViewed}
        >{clearingRecent ? 'Clearing…' : 'Clear Recently Viewed'}</button>}
      </div>

      {recentError && <p className="favorites-error" role="alert">{recentError}</p>}
      {recentLoading && <p role="status">Loading Recently Viewed…</p>}

      {!recentLoading && recentItems.length === 0 && <section className="favorites-empty">
        <div className="recent-empty-icon" aria-hidden="true">↺</div>
        <h2>No recent items yet</h2>
        <p>Open a Common Issue or Process Guide in Navigator and it will appear here automatically.</p>
      </section>}

      {!recentLoading && recentItems.length > 0 && <div className="favorites-grid recently-viewed-grid">
        {recentItems.map((item, index) => <div className="recent-resource-wrap" key={`${item.itemType}-${item.itemId}`}>
          <span className="recent-position" aria-label={`Recent item ${index + 1}`}>{index + 1}</span>
          <ResourceCard
            item={item}
            favorite={isFavorite(item.itemType, item.itemId)}
            favoriteBusy={busyFor(item.itemType, item.itemId)}
            onOpen={() => openItem(item)}
            onToggleFavorite={() => onToggleFavorite(item.itemType, item.itemId)}
          />
        </div>)}
      </div>}
    </div>}
  </section>
}
