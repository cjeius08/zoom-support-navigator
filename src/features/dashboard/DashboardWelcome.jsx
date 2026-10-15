import { assetUrl } from '../../lib/assetUrl'
import { formatConsoleDate, updatesForAudience } from '../updates/updatesData'

const QUICK_LINKS = [
  { key: 'search', icon: 'search', title: 'Smart Search', detail: 'Find answers fast across call flows, knowledge and more.' },
  { key: 'favorites', icon: 'favorite', title: 'Favorites', detail: 'View your saved articles and frequently used resources.' },
  { key: 'training', icon: 'training', title: 'Training & Resources', detail: 'Access training, guides and helpful materials.' },
  { key: 'feedback', icon: 'feedback', title: 'Feedback', detail: 'Share ideas, report issues and help improve Ozzie.' },
]

function DashIcon({ type }) {
  const paths = {
    search: <><circle cx="10.7" cy="10.7" r="6.2" /><path d="m15.3 15.3 4.8 4.8" /></>,
    favorite: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.3L12 17.3l-5.6 3 1.1-6.3L3 9.6l6.2-.9L12 3Z" />,
    training: <><path d="m2.5 9 9.5-5 9.5 5-9.5 5-9.5-5Z" /><path d="M6 11.2V17c3.2 2.5 8.8 2.5 12 0v-5.8M21.5 9v7" /></>,
    feedback: <><path d="M5 4h14v13H9l-4 3V4Z" /><path d="M8 8h8M8 12h6" /></>,
    updates: <><path d="M4 10v4l11 3V7L4 10Zm11-2 4-2v12l-4-2M6 14l1 5h3" /></>,
    arrow: <path d="m5 12 14 0m-6-6 6 6-6 6" />,
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill={type === 'favorite' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[type]}</svg>
}

function UpdateCard({ entry, index }) {
  const kinds = ['blue','green','violet','amber','rose']
  return <article className={`dashboard-update-card dashboard-update-${kinds[index]}`}>
    <div className="dashboard-update-top">
      <span className="dashboard-update-icon"><DashIcon type={index === 0 ? 'updates' : index === 1 ? 'search' : index === 2 ? 'arrow' : index === 3 ? 'training' : 'feedback'} /></span>
      <time dateTime={entry.date}>{formatConsoleDate(entry.date, { short: true })}</time>
      <span className="dashboard-update-tag">{index === 0 ? 'Latest' : 'Update'}</span>
    </div>
    <h3>{entry.title}</h3>
    <p>{entry.area}</p>
  </article>
}

export function DashboardWelcome({
  username = '',
  roleLabel = 'Member',
  isAdmin = false,
  onSearch = () => {},
  onOpenTraining = () => {},
  onOpenFavorites = () => {},
  onOpenFeedback = () => {},
  onOpenUpdates = () => {},
}) {
  const actions = {
    search: onSearch,
    favorites: onOpenFavorites,
    training: onOpenTraining,
    feedback: onOpenFeedback,
  }
  const latest = updatesForAudience(isAdmin).slice(0,5)

  return <div className="dashboard-welcome-wrap">
    <div className="dashboard-feature-grid">
      <section className="dashboard-welcome-hero" aria-labelledby="dashboard-welcome-title">
        <div className="dashboard-welcome-copy">
          <p className="dashboard-welcome-eyebrow">OZZIE — OGLETREE SUPPORT WORKSPACE <span className="dashboard-role-label">· {roleLabel}</span></p>
          <h1 id="dashboard-welcome-title">Welcome back!</h1>
          <p className="dashboard-welcome-subtitle">Your central hub for call flows, knowledge, training and everything you need to support our customers with confidence.{username ? <> <strong>{username}</strong></> : null}</p>
          <div className="dashboard-welcome-actions">
            <button type="button" className="dashboard-hero-primary" onClick={onSearch}>
              Start with Smart Search <span aria-hidden="true">→</span>
            </button>
            <button type="button" className="dashboard-hero-secondary" onClick={onOpenTraining}>Explore training</button>
          </div>
        </div>
        <div className="dashboard-welcome-mascot">
          <img src={assetUrl('assets/ozzie-hq.png')} alt="Ozzie owl mascot" />
        </div>
      </section>

      <section className="dashboard-feedback-card" aria-labelledby="dashboard-feedback-title">
        <div className="dashboard-feedback-copy">
          <span className="dashboard-feedback-icon" aria-hidden="true"><DashIcon type="feedback" /></span>
          <h2 id="dashboard-feedback-title">Help Ozzie grow and thrive.</h2>
          <p>If you see bugs, errors or anything that needs to be added just submit your feedback!</p>
          <button type="button" className="dashboard-feedback-button" onClick={onOpenFeedback}>
            <DashIcon type="arrow" /> Submit Feedback
          </button>
        </div>
        <img className="dashboard-feedback-mascot" src={assetUrl('assets/ozzie-hq.png')} alt="" aria-hidden="true" />
        <div className="dashboard-feedback-footnote">Your feedback helps make Ozzie better for everyone!</div>
      </section>
    </div>

    <section className="dashboard-updates-section" aria-labelledby="dashboard-updates-title">
      <div className="dashboard-section-heading">
        <span className="dashboard-section-symbol"><DashIcon type="updates" /></span>
        <h2 id="dashboard-updates-title">What’s New</h2>
        <p>The latest updates and improvements to your Ozzie workspace.</p>
        <button type="button" onClick={onOpenUpdates}>View All Updates <span aria-hidden="true">→</span></button>
      </div>
      <div className="dashboard-updates-grid">
        {latest.map((entry,index) => <UpdateCard key={entry.id} entry={entry} index={index}/>)}
      </div>
    </section>

    <section className="dashboard-shortcuts-section" aria-labelledby="dashboard-shortcuts-title">
      <div className="dashboard-section-heading">
        <span className="dashboard-section-symbol dashboard-grid-symbol" aria-hidden="true">▦</span>
        <h2 id="dashboard-shortcuts-title">Quick Access</h2>
        <p>Jump into the tools and resources you use most.</p>
      </div>
      <div className="dashboard-shortcuts" aria-label="Dashboard quick access">
        {QUICK_LINKS.map(item => <button
          type="button"
          key={item.key}
          aria-label={item.key === 'favorites' ? 'My Favorites' : undefined}
          className={`dashboard-shortcut dashboard-shortcut-${item.key}`}
          onClick={actions[item.key]}
        >
          <span className="dashboard-shortcut-icon"><DashIcon type={item.icon} /></span>
          <span className="dashboard-shortcut-copy">
            <strong>{item.title}</strong>
            <small>{item.detail}</small>
          </span>
          <span className="dashboard-shortcut-arrow" aria-hidden="true">›</span>
        </button>)}
      </div>
    </section>
  </div>
}
