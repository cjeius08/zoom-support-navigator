import { useRef, useState } from 'react'
import { PROCESSES } from '../../data/processes'
import { useDialogFocus } from '../../lib/useDialogFocus'
import './commonIssueRoutes.css'

const TABS = [
  ['quick', 'Quick Guide'],
  ['visual', 'Visual Guide'],
  ['process', 'Full Process'],
  ['sources', 'Sources'],
]

const STATUS_OPTIONS = ['Resolved', 'Unresolved', 'Escalation Needed']

export function CommonIssueDrawer({
  route,
  callContext,
  onClose,
  onOpenProcess,
  onOpenRoute,
  onStatusChange,
  onTrackEvent,
}) {
  const [tab, setTab] = useState('quick')
  const dialogRef = useRef(null)
  useDialogFocus(dialogRef, true, onClose)

  const processEntries = route.processIds
    .map(id => PROCESSES.find(process => process.id === id))
    .filter(Boolean)

  function selectTab(id, { focus = false } = {}) {
    setTab(id)
    onTrackEvent?.({
      eventType: 'tool_open',
      routeId: 'navigator',
      categoryId: route.categoryId,
      toolId: `common_issue_${route.id}_tab_${id}`,
    })
    if (focus) document.getElementById(`common-issue-tab-${id}`)?.focus()
  }

  function handleTabKey(event, index) {
    let nextIndex = null
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % TABS.length
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + TABS.length) % TABS.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = TABS.length - 1
    if (nextIndex === null) return
    event.preventDefault()
    selectTab(TABS[nextIndex][0], { focus: true })
  }

  return <div className="drawer-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
    <aside
      ref={dialogRef}
      tabIndex={-1}
      className="process-drawer common-issue-drawer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="common-issue-title"
    >
      <header className="drawer-header common-issue-header">
        <div>
          <span className="process-category">{route.group}</span>
          <h2 id="common-issue-title">{route.title}</h2>
          <p>{route.subtitle}</p>
        </div>
        <button type="button" className="drawer-close" aria-label="Close common issue route" onClick={onClose}>×</button>
      </header>

      <div className="common-issue-context" aria-label="Selected call context">
        <span><small>Device</small><strong>{callContext?.device || 'Not selected'}</strong></span>
        <span><small>Caller role</small><strong>{callContext?.role || 'Not selected'}</strong></span>
        <span><small>Status</small><strong>{callContext?.status || 'In progress'}</strong></span>
      </div>

      <div className="process-tabs" role="tablist" aria-label="Common issue views">
        {TABS.map(([id, label], index) => <button
          type="button"
          key={id}
          id={`common-issue-tab-${id}`}
          role="tab"
          aria-selected={tab === id}
          aria-controls="common-issue-tabpanel"
          tabIndex={tab === id ? 0 : -1}
          onKeyDown={event => handleTabKey(event, index)}
          onClick={() => selectTab(id)}
        >{label}</button>)}
      </div>

      <div
        id="common-issue-tabpanel"
        className="drawer-content common-issue-content"
        role="tabpanel"
        aria-labelledby={`common-issue-tab-${tab}`}
        tabIndex={0}
      >
        {tab === 'quick' && <section className="common-issue-quick" aria-label="Quick Guide">
          <section className="common-issue-classification">
            <p className="eyebrow">Classify before troubleshooting</p>
            <strong>{route.classification}</strong>
            <p>{route.classificationNote}</p>
          </section>

          <section className="common-issue-section">
            <p className="eyebrow">Confirm the symptom first</p>
            <h3>Ask only what changes the route</h3>
            <ol className="common-issue-confirm-list">
              {route.confirm.map(question => <li key={question}>{question}</li>)}
            </ol>
          </section>

          {route.redirectNotes?.length > 0 && <section className="common-issue-section route-switches">
            <p className="eyebrow">Different symptom?</p>
            {route.redirectNotes.map(item => <button
              type="button"
              key={item.routeId}
              onClick={() => onOpenRoute?.(item.routeId)}
            >
              <strong>{item.label}</strong>
              <span>{item.note}</span>
            </button>)}
          </section>}

          {route.states?.length > 0 && <section className="common-issue-section">
            <p className="eyebrow">Identify the exact waiting state</p>
            <div className="waiting-state-grid">
              {route.states.map(state => <article key={state.title}>
                <span>{state.badge}</span>
                <h3>{state.title}</h3>
                <p>{state.body}</p>
                <div><strong>Next action</strong><p>{state.action}</p></div>
              </article>)}
            </div>
          </section>}

          {route.checks.length > 0 && <section className="common-issue-section">
            <p className="eyebrow">Guide one step at a time</p>
            <div className="common-issue-step-list">
              {route.checks.map((check, index) => <article key={check.title}>
                <span className="common-issue-step-number">{index + 1}</span>
                <div>
                  <h3>{check.title}</h3>
                  <p>{check.instruction}</p>
                  <div className="common-issue-expected">
                    <strong>What should happen</strong>
                    <p>{check.expected}</p>
                  </div>
                </div>
              </article>)}
            </div>
          </section>}

          <section className="suggested-script common-issue-script">
            <p className="eyebrow">Suggested Script</p>
            <blockquote>{route.script}</blockquote>
          </section>

          <section className="common-issue-outcome">
            <div>
              <p className="eyebrow">Confirm</p>
              <h3>Expected result</h3>
              <p>{route.success}</p>
            </div>
            <div>
              <p className="eyebrow">Still not working?</p>
              <h3>Next action / boundary</h3>
              <p>{route.unresolved}</p>
            </div>
          </section>

          <section className="common-issue-status" aria-label="Common issue resolution status">
            <p className="eyebrow">Call outcome</p>
            <div>
              {STATUS_OPTIONS.map(status => <button
                type="button"
                key={status}
                aria-pressed={callContext?.status === status}
                onClick={() => onStatusChange?.(status)}
              >{status}</button>)}
            </div>
          </section>
        </section>}

        {tab === 'visual' && <section aria-label="Visual Guide">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Official Zoom references</p>
              <h3>Visual Guide</h3>
            </div>
          </div>
          {route.visuals.length > 0
            ? <div className="common-issue-visual-grid">{route.visuals.map(visual => <figure key={visual.src}>
                <div className="common-issue-visual-frame">
                  <img src={visual.src} alt={visual.alt} loading="lazy" />
                </div>
                <figcaption><strong>{visual.title}</strong><span>{visual.note}</span></figcaption>
              </figure>)}</div>
            : <div className="common-issue-empty">
                <strong>No embedded Zoom visual for this route yet.</strong>
                <p>Use the official Zoom Support source below rather than relying on an unsourced or recreated interface image.</p>
                <a href={route.primarySource.url} target="_blank" rel="noreferrer">Open current Zoom Support article ↗</a>
              </div>}
        </section>}

        {tab === 'process' && <section aria-label="Full Process">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Approved internal source</p>
              <h3>Full Process</h3>
              <p>Open the authoritative Process Document when the fast route is not enough.</p>
            </div>
          </div>
          <div className="common-issue-process-list">
            {processEntries.map(process => <article key={process.id}>
              <div>
                <strong>{process.title}</strong>
                <p>{process.purpose}</p>
              </div>
              <button type="button" onClick={() => onOpenProcess?.(process.id)}>Open approved process →</button>
            </article>)}
          </div>
        </section>}

        {tab === 'sources' && <section aria-label="Sources">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Traceability</p>
              <h3>Sources</h3>
              <p>Fast guidance above is organized from approved internal processes and current official Zoom Support—not from unsourced troubleshooting guesses.</p>
            </div>
          </div>

          <div className="common-issue-source-card">
            <span>Current product source</span>
            <strong>{route.primarySource.title}</strong>
            <a href={route.primarySource.url} target="_blank" rel="noreferrer">Official Zoom Support ↗</a>
          </div>

          {route.supportingSources?.length > 0 && <div className="common-issue-source-list">
            {route.supportingSources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
              Zoom Support — {source.title} ↗
            </a>)}
          </div>}

          <div className="common-issue-source-card">
            <span>Approved internal processes</span>
            {processEntries.map(process => <strong key={process.id}>{process.title}</strong>)}
          </div>

          {route.discrepancy && <div className="common-issue-discrepancy">
            <strong>Source discrepancy flagged</strong>
            <p>{route.discrepancy}</p>
          </div>}

          <p className="common-issue-verified">Verified against official Zoom Support: September 18, 2026</p>
        </section>}
      </div>
    </aside>
  </div>
}
