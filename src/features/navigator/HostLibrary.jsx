import { HOST_ROADBLOCKS } from '../../data/arbitratorHostSupport'
import { FavoriteToggle } from '../favorites/FavoriteToggle'
import { hostFaqItems, hostFastestTopics, hostProcesses, hostTopics } from '../../data/hostExperience'

function HostFavoriteCard({ children, title, favorite = false, favoriteBusy = false, onToggleFavorite = () => {} }) {
  return <article className="favorite-card-shell host-favorite-card">
    {children}
    <FavoriteToggle
      active={favorite}
      busy={favoriteBusy}
      compact
      className="favorite-card-toggle"
      label={title}
      onToggle={onToggleFavorite}
    />
  </article>
}

function HostTopicCard({ topic, onOpen, fast = false, ...favoriteProps }) {
  return <HostFavoriteCard title={topic.title} {...favoriteProps}>
    <button type="button" className={`host-topic-card${fast ? ' host-topic-card-fast' : ''}`} onClick={() => onOpen(topic)}>
      <span>{topic.group}</span>
      <strong>{topic.title}</strong>
      <small>Confirm first → approved steps → resolve or stop at boundary</small>
      <b>Open Host Guide →</b>
    </button>
  </HostFavoriteCard>
}

function HostRoadblockCard({ roadblock, onOpen, ...favoriteProps }) {
  return <HostFavoriteCard title={roadblock.title} {...favoriteProps}>
    <button type="button" className="host-roadblock-result-card" onClick={() => onOpen(roadblock)}>
      <span>Tier 1 roadblock</span>
      <strong>{roadblock.title}</strong>
      <small>{roadblock.trigger}</small>
      <b>Open boundary + script →</b>
    </button>
  </HostFavoriteCard>
}

function HostProcessCard({ process, onOpen, ...favoriteProps }) {
  return <HostFavoriteCard title={process.title} {...favoriteProps}>
    <button type="button" className="process-card" onClick={() => onOpen(process)}>
      <small className="result-type-badge">Approved Process Guide</small>
      <strong>{process.title}</strong>
      <span>{process.purpose}</span>
      <b>Open process →</b>
    </button>
  </HostFavoriteCard>
}

export function HostLibrary({
  libraryTab,
  query,
  topicMatches,
  roadblockMatches,
  processMatches,
  processes,
  faqItems,
  onOpenTopic,
  onOpenRoadblock,
  onOpenProcess,
  isFavorite = () => false,
  isFavoriteBusy = () => false,
  onToggleFavorite = () => {},
}) {
  const allTopics = hostTopics()
  const fastest = hostFastestTopics()
  const approvedProcesses = hostProcesses(processes)
  const hostFaq = hostFaqItems(faqItems)
  const favoriteProps = (itemType, itemId) => ({
    favorite: isFavorite(itemType, itemId),
    favoriteBusy: isFavoriteBusy(itemType, itemId),
    onToggleFavorite: () => onToggleFavorite(itemType, itemId),
  })

  if (query.trim()) {
    return <section id="search-results" className="combined-search-results host-search-results" aria-live="polite">
      <div className="search-results-heading">
        <p className="eyebrow">Host / Arbitrator Smart Search</p>
        <h2>Results for “{query}”</h2>
        <p>Host troubleshooting and Tier 1 roadblocks are shown first. Ozzie will not route the arbitrator through Participant-only guidance.</p>
      </div>

      <section className="search-result-block" aria-labelledby="host-search-heading">
        <div className="search-result-block-heading">
          <h3 id="host-search-heading">Host troubleshooting</h3>
          <span>{topicMatches.length}</span>
        </div>
        {topicMatches.length ? <div className="host-topic-grid">
          {topicMatches.map(topic => <HostTopicCard key={topic.id} topic={topic} onOpen={onOpenTopic} {...favoriteProps('common_issue', `host:${topic.id}`)} />)}
        </div> : <div className="navigator-empty-state">No approved Host troubleshooting route matches this search yet.</div>}
      </section>

      <section className="search-result-block" aria-labelledby="roadblock-search-heading">
        <div className="search-result-block-heading">
          <h3 id="roadblock-search-heading">Tier 1 roadblocks</h3>
          <span>{roadblockMatches.length}</span>
        </div>
        {roadblockMatches.length ? <div className="host-roadblock-grid">
          {roadblockMatches.map(roadblock => <HostRoadblockCard key={roadblock.id} roadblock={roadblock} onOpen={onOpenRoadblock} {...favoriteProps('common_issue', `host-roadblock:${roadblock.id}`)} />)}
        </div> : <div className="navigator-empty-state">No direct roadblock matches this search.</div>}
      </section>

      <section className="search-result-block" aria-labelledby="host-process-search-heading">
        <div className="search-result-block-heading">
          <h3 id="host-process-search-heading">Approved Process Guides</h3>
          <span>{processMatches.length}</span>
        </div>
        {processMatches.length ? <div className="process-grid">
          {processMatches.map(process => <HostProcessCard key={process.id} process={process} onOpen={onOpenProcess} {...favoriteProps('process', process.id)} />)}
        </div> : <div className="navigator-empty-state">No Host-safe Process Guide matches this search.</div>}
      </section>
    </section>
  }

  if (libraryTab === 'fastest') {
    return <section aria-labelledby="host-fastest-heading">
      <p className="eyebrow">Arbitrator / Host shortcuts</p>
      <h2 id="host-fastest-heading">Fastest Host Routes</h2>
      <p className="navigator-tab-intro">Start with the arbitrator’s exact concern. Every route confirms the situation before troubleshooting.</p>
      <div className="host-topic-grid host-fastest-grid">
        {fastest.map(topic => <HostTopicCard key={topic.id} topic={topic} onOpen={onOpenTopic} {...favoriteProps('common_issue', `host:${topic.id}`)} fast />)}
      </div>
    </section>
  }

  if (libraryTab === 'common') {
    return <section aria-labelledby="host-common-heading">
      <p className="eyebrow">Basic Zoom assistance</p>
      <h2 id="host-common-heading">Host / Arbitrator Common Issues</h2>
      <p className="navigator-tab-intro">Only reviewed Tier 1 Host routes are shown here.</p>
      <div className="common-issue-browser">
        {[...new Set(allTopics.map(topic => topic.group))].map(group => <section className="route-group" key={group}>
          <h3>{group}</h3>
          <div className="host-topic-grid">
            {allTopics.filter(topic => topic.group === group).map(topic => <HostTopicCard key={topic.id} topic={topic} onOpen={onOpenTopic} {...favoriteProps('common_issue', `host:${topic.id}`)} />)}
          </div>
        </section>)}
      </div>
    </section>
  }

  if (libraryTab === 'processes') {
    return <section aria-labelledby="host-process-heading">
      <p className="eyebrow">Source-backed procedures</p>
      <h2 id="host-process-heading">Host-safe Process Guides</h2>
      <p className="navigator-tab-intro">Universal/basic procedures only. Participant-only and unconfirmed specialized guides are hidden from Host mode.</p>
      <div className="process-grid">
        {approvedProcesses.map(process => <HostProcessCard key={process.id} process={process} onOpen={onOpenProcess} {...favoriteProps('process', process.id)} />)}
      </div>
    </section>
  }

  if (libraryTab === 'faq') {
    return <section className="support-reference-view faq-compact-view" aria-labelledby="host-faq-heading">
      <p className="eyebrow">Need to know</p>
      <h2 id="host-faq-heading">Host / Arbitrator FAQ</h2>
      <p className="navigator-tab-intro">Program-specific account and meeting behaviors relevant to arbitrator calls.</p>
      <div className="support-reference-grid">
        {hostFaq.map(item => <article key={item.label}>
          <h3>{item.label}</h3>
          <p>{item.answer}</p>
          {item.points?.length > 0 && <ul>{item.points.map(point => <li key={point}>{point}</li>)}</ul>}
        </article>)}
      </div>
    </section>
  }

  if (libraryTab === 'roadblocks') {
    return <section className="support-reference-view" aria-labelledby="host-roadblocks-heading">
      <p className="eyebrow">Stop / refer / escalate</p>
      <h2 id="host-roadblocks-heading">Tier 1 Roadblocks</h2>
      <p className="navigator-tab-intro">A roadblock can be selected immediately or reached after any confirmation step. Open it to see the boundary, next action, approved wording, and documentation handoff.</p>
      <div className="host-roadblock-grid">
        {HOST_ROADBLOCKS.map(item => <HostRoadblockCard key={item.id} roadblock={item} onOpen={onOpenRoadblock} {...favoriteProps('common_issue', `host-roadblock:${item.id}`)} />)}
      </div>
    </section>
  }

  return null
}
