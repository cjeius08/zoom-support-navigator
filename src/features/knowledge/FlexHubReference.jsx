import { useEffect, useState } from 'react'
import { FLEX_HUB_FAQS, FLEX_HUB_ROADBLOCKS, FLEX_HUB_REFERENCE, FLEX_HUB_VIDEOS } from '../../data/flexHubReference'
import './flexHubReference.css'

export function FlexHubReference({ initialSection = null, initialTab = 'processes', initialEntryId = null, onOpenVideo = () => {}, onReportContextChange = () => {}, trackEvent = () => {} }) {
  const [guideTab, setGuideTab] = useState(initialTab)
  const [search, setSearch] = useState('')
  const normalizedSearch = search.toLowerCase().trim()
  const visibleTopics = FLEX_HUB_REFERENCE.topics.filter(topic => !normalizedSearch || [topic.label, topic.eyebrow, topic.group, topic.keywords, topic.summary, ...topic.points, ...(topic.steps || [])].join(' ').toLowerCase().includes(normalizedSearch))

  const visibleFaqs = FLEX_HUB_FAQS.filter(item => !normalizedSearch || [item.label, item.answer].join(' ').toLowerCase().includes(normalizedSearch))
  const visibleRoadblocks = FLEX_HUB_ROADBLOCKS.filter(item => !normalizedSearch || [item.issue, item.check, item.next].join(' ').toLowerCase().includes(normalizedSearch))
  const resultsLabel = guideTab === 'processes' ? `${visibleTopics.length} of ${FLEX_HUB_REFERENCE.topics.length} topics` : guideTab === 'faqs' ? `${visibleFaqs.length} of ${FLEX_HUB_FAQS.length} FAQs` : `${visibleRoadblocks.length} of ${FLEX_HUB_ROADBLOCKS.length} roadblocks`
  const sourceTitle = topicId => FLEX_HUB_REFERENCE.topics.find(topic => topic.id === topicId)?.source || 'Flex Hub reference'

  useEffect(() => {
    setGuideTab(initialTab)
    const frame = window.requestAnimationFrame(() => {
      const id = initialTab === 'processes'
        ? initialSection && 'flex-' + initialSection
        : initialEntryId && 'flex-search-' + initialEntryId
      const element = id ? document.getElementById(id) : null
      element?.scrollIntoView?.({ block: 'start' })
      element?.focus()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [initialTab, initialSection, initialEntryId])
  useEffect(() => {
    onReportContextChange({
      selected_tab: 'Flex Arbitration Hub',
      current_section: initialSection ? 'Guide: ' + initialSection : 'Agent Reference Guide',
      active_device: null,
      active_common_issue: null,
      process_id: null,
      category_id: 'hub-reference',
    })
  }, [onReportContextChange, initialSection])

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

    <div className="flex-hub-section-tabs" role="tablist" aria-label="Flex Hub reference sections">
      <button type="button" role="tab" aria-selected={guideTab === 'processes'} aria-controls="flex-hub-section-panel" onClick={() => setGuideTab('processes')}>Process Guides</button>
      <button type="button" role="tab" aria-selected={guideTab === 'faqs'} aria-controls="flex-hub-section-panel" onClick={() => setGuideTab('faqs')}>FAQs</button>
      <button type="button" role="tab" aria-selected={guideTab === 'roadblocks'} aria-controls="flex-hub-section-panel" onClick={() => setGuideTab('roadblocks')}>Roadblock Matrix</button>
    </div>
    <div className="flex-hub-guide-tools">
      <label htmlFor="flex-hub-guide-search">Find a guide topic</label>
      <input id="flex-hub-guide-search" type="search" value={search} onChange={event => setSearch(event.target.value)}
        placeholder="Try: 1099, transcript, tranche, search, PMI…" autoComplete="off" />
      <span role="status">{resultsLabel}</span>
    </div>
    <div id="flex-hub-section-panel" role="tabpanel" aria-label={guideTab === "processes" ? "Flex Hub Process Guides" : guideTab === "faqs" ? "Flex Hub FAQs" : "Flex Hub Roadblock Matrix"}>
    {guideTab === "processes" && <>
    <div className="flex-hub-jump" aria-label="Reference sections">
      {visibleTopics.map(topic => <a key={topic.id} href={`#flex-${topic.id}`}>{topic.label} ↓</a>)}
      <a href="#flex-videos">Hub videos ↓</a>
    </div>
    {!visibleTopics.length && <p className="flex-hub-empty" role="status">No matching guide topic. Try a different keyword or clear the search.</p>}
    <div className="flex-hub-topic-grid">
      {visibleTopics.map((topic) => <article className="flex-hub-topic" tabIndex={-1} key={topic.id} id={`flex-${topic.id}`}>
        <div className="flex-hub-topic-heading"><span className="flex-hub-topic-group">{topic.group}</span><div><small>{topic.eyebrow}</small><h2>{topic.label}</h2></div></div>
        <p className="flex-hub-summary">{topic.summary}</p>
        {topic.pending && <p className="flex-hub-pending"><strong>Needs source verification.</strong> Do not present this topic as a complete approved procedure.</p>}
        {topic.points.length > 0 && <ul>{topic.points.map(point => <li key={point}>{point}</li>)}</ul>}
        {topic.steps?.length > 0 && <ol className="flex-hub-steps">{topic.steps.map(step => <li key={step}>{step}</li>)}</ol>}
        {topic.id === 'onboarding' && <div className="flex-hub-links">
          <a href={FLEX_HUB_REFERENCE.hubUrl} target="_blank" rel="noreferrer">Open Amazon Flex Arbitration Hub ↗</a>
          <a href={`mailto:${FLEX_HUB_REFERENCE.arbitratorHelpEmail}`}>Arbitrator help email ↗</a>
        </div>}
        <p className="flex-hub-source">Source: {topic.source}</p>
      </article>)}
    </div>
    </>}
    {guideTab === 'faqs' && <div className="flex-hub-faq-grid">
      {visibleFaqs.map(item => <article key={item.id} id={'flex-search-' + item.id} tabIndex={-1} className="flex-hub-faq-card">
        <h2>{item.label}</h2>
        <p>{item.answer}</p>
        {item.pending && <p className="flex-hub-pending"><strong>Needs source verification.</strong> Do not provide unverified manual steps.</p>}
        <small>Source: {sourceTitle(item.sourceTopic)}</small>
        <button type="button" onClick={() => { setSearch(''); setGuideTab('processes'); window.requestAnimationFrame(() => document.getElementById('flex-' + item.sourceTopic)?.scrollIntoView({ block: 'start' })) }}>View process reference</button>
      </article>)}
      {visibleFaqs.length === 0 && <p className="flex-hub-empty">No matching FAQs. Clear the search or try a different keyword.</p>}
    </div>}
    {guideTab === 'roadblocks' && <div className="flex-hub-roadblock-grid">
      {visibleRoadblocks.map(item => <article key={item.id} id={'flex-search-roadblock-' + item.id} tabIndex={-1} className="flex-hub-roadblock-card">
        <h2>{item.issue}</h2>
        <dl><dt>What to confirm</dt><dd>{item.check}</dd><dt>Next step / boundary</dt><dd>{item.next}</dd></dl>
        {item.pending && <p className="flex-hub-pending"><strong>Needs source verification.</strong> Do not treat this as a completed escalation procedure.</p>}
        <small>Source: {sourceTitle(item.sourceTopic)}</small>
        <button type="button" onClick={() => { setSearch(''); setGuideTab('processes'); window.requestAnimationFrame(() => document.getElementById('flex-' + item.sourceTopic)?.scrollIntoView({ block: 'start' })) }}>View process reference</button>
      </article>)}
      {visibleRoadblocks.length === 0 && <p className="flex-hub-empty">No matching roadblocks. Clear the search or try a different keyword.</p>}
    </div>}
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
