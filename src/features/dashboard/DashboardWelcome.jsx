import { assetUrl } from '../../lib/assetUrl'

const SHORTCUTS = [
  {
    id: 'search',
    icon: 'search',
    title: 'Smart Search',
    description: 'Find an approved answer quickly.',
  },
  {
    id: 'training',
    icon: 'book',
    title: 'Training & Resources',
    description: 'Practice guides, scripts, and lessons.',
  },
  {
    id: 'favorites',
    icon: 'bookmark',
    title: 'My Favorites',
    description: 'Open your saved support references.',
  },
]

function ShortcutIcon({ type }) {
  const paths = {
    search: <><circle cx="10.8" cy="10.8" r="6.5" /><path d="m16 16 4.2 4.2" /></>,
    book: <><path d="M12 5c-2-1.2-4.5-1.5-8-1.2v14c3.5-.3 6 .1 8 1.2m0-14c2-1.2 4.5-1.5 8-1.2v14c-3.5-.3-6 .1-8 1.2M12 5v14" /></>,
    bookmark: <path d="M6 4h12v17l-6-4-6 4V4Z" />,
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">{paths[type]}</svg>
}

export function DashboardWelcome({
  username = '',
  roleLabel = 'Member',
  onSearch = () => {},
  onOpenTraining = () => {},
  onOpenFavorites = () => {},
}) {
  const actions = {
    search: onSearch,
    training: onOpenTraining,
    favorites: onOpenFavorites,
  }
  return <div className="dashboard-welcome-wrap">
    <section className="dashboard-welcome-hero" aria-labelledby="dashboard-welcome-title">
      <div className="dashboard-welcome-copy">
        <p className="dashboard-welcome-eyebrow">YOUR OZZIE WORKSPACE <span aria-hidden="true">·</span> {roleLabel}</p>
        <h1 id="dashboard-welcome-title">Welcome back!</h1>
        <p className="dashboard-welcome-subtitle">
          {username ? <>Good to see you, <strong>{username}</strong>. </> : null}
          Everything you need for a smoother support call is right here.
        </p>
        <div className="dashboard-welcome-actions">
          <button type="button" className="dashboard-hero-primary" onClick={onSearch}>
            Start with Smart Search <span aria-hidden="true">→</span>
          </button>
          <button type="button" className="dashboard-hero-secondary" onClick={onOpenTraining}>
            Explore training
          </button>
        </div>
      </div>
      <div className="dashboard-welcome-mascot">
        <img src={assetUrl('assets/ozzie-hq.png')} alt="Ozzie owl mascot" />
      </div>
    </section>
    <section className="dashboard-shortcuts" aria-label="Dashboard quick access">
      {SHORTCUTS.map(item => <button
        type="button"
        key={item.id}
        className="dashboard-shortcut"
        onClick={actions[item.id]}
      >
        <span className="dashboard-shortcut-icon"><ShortcutIcon type={item.icon} /></span>
        <span className="dashboard-shortcut-copy">
          <strong>{item.title}</strong>
          <small>{item.description}</small>
        </span>
        <span className="dashboard-shortcut-arrow" aria-hidden="true">↗</span>
      </button>)}
    </section>
  </div>
}
