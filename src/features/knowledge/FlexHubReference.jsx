import { useEffect } from 'react'
import { FLEX_HUB_REFERENCE, FLEX_HUB_VIDEOS } from '../../data/flexHubReference'
import './flexHubReference.css'

export function FlexHubReference({ onOpenVideo = () => {}, onReportContextChange = () => {}, trackEvent = () => {} }) {
  useEffect(() => {
    onReportContextChange({
      selected_tab: 'Flex Arbitration Hub',
      current_section: 'Agent Reference Guide',
      active_device: null,
      active_common_issue: null,
      process_id: null,
      category_id: 'hub-reference',
    })
  }, [onReportContextChange])

  function openVideo(video) {
    trackEvent({ eventType: 'tool_open', routeId: 'flex_hub', toolId: video.id })
    onOpenVideo(video.id)
  }

  return <section className="console-view flex-hub-view" aria-labelledby="flex-hub-title">
    <header className="view-heading flex-hub-heading">
      <div>
        <p className="eyebrow">Knowledge · Flex Arbitration program</p>
        <h1 id="flex-hub-title">{FLEX_HUB_REFERENCE.title}</h1>
        <p>Approved account, Hub, and hearing-process facts for agents supporting arbitrators. This is not a replacement for the existing Zoom troubleshooting guides.</p>
      </div>
      <span className="flex-hub-kicker">Agent reference</span>
    </header>

    <div className="flex-hub-important" role="note" aria-label="Critical recording and hearing rules">
      <div><small>CRITICAL RULE</small><strong>Keep recording active</strong><p>Arbitrators must not stop or turn off meeting recordings.</p></div>
      <div><small>HEARING LINK</small><strong>Use the same PMI link</strong><p>One assigned Personal Meeting ID link across all hearing dates and claimants.</p></div>
    </div>

    <div className="flex-hub-jump" aria-label="Reference sections">
      {FLEX_HUB_REFERENCE.topics.map(topic => <a key={topic.id} href={`#flex-${topic.id}`}>{topic.label} ↓</a>)}
      <a href="#flex-videos">Hub videos ↓</a>
    </div>

    <div className="flex-hub-topic-grid">
      {FLEX_HUB_REFERENCE.topics.map((topic, index) => <article className="flex-hub-topic" key={topic.id} id={`flex-${topic.id}`}>
        <div className="flex-hub-topic-heading"><span>{String(index + 1).padStart(2,'0')}</span><div><small>{topic.eyebrow}</small><h2>{topic.label}</h2></div></div>
        <ul>{topic.points.map(point => <li key={point}>{point}</li>)}</ul>
        {topic.id === 'onboarding' && <div className="flex-hub-links">
          <a href={FLEX_HUB_REFERENCE.hubUrl} target="_blank" rel="noreferrer">Open Amazon Flex Arbitration Hub ↗</a>
          <a href={`mailto:${FLEX_HUB_REFERENCE.arbitratorHelpEmail}`}>Arbitrator help email ↗</a>
        </div>}
      </article>)}
    </div>

    <aside className="flex-hub-private" aria-label="Internal escalation boundary">
      <strong>Internal escalation boundary</strong>
      <p>{FLEX_HUB_REFERENCE.internalBoundary}</p>
    </aside>

    <section id="flex-videos" className="flex-hub-videos" aria-labelledby="flex-hub-videos-title">
      <div><p className="eyebrow">Training &amp; Resources</p><h2 id="flex-hub-videos-title">Related video guides</h2><p>These videos open from the existing Video Library. Playback may require access to the original provider.</p></div>
      <div className="flex-hub-video-grid">{FLEX_HUB_VIDEOS.map(video => <button type="button" key={video.id} onClick={() => openVideo(video)}>
        <span className="flex-hub-video-icon" aria-hidden="true">▶</span>
        <span><small>{video.provider} · External video</small><strong>{video.title}</strong><em>Go to Video Library →</em></span>
      </button>)}</div>
    </section>
    <details className="flex-hub-source-list">
      <summary>Other documents listed in the source guide</summary>
      <p>The source guide mentions these supporting materials. They are listed for identification only; this release does not claim the files are stored inside Ozzie.</p>
      <ul>{FLEX_HUB_REFERENCE.relatedSourceTitles.map(title => <li key={title}>{title}</li>)}</ul>
    </details>
  </section>
}
