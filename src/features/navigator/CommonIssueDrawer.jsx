import { useEffect, useRef, useState } from 'react'
import { PROCESSES } from '../../data/processes'
import { COMMON_ISSUE_VERIFIED_AT, recommendedProcessForRoute } from './commonIssueRoutes'
import { useDialogFocus } from '../../lib/useDialogFocus'
import { FavoriteToggle } from '../favorites/FavoriteToggle'
import './commonIssueRoutes.css'

const TABS = [
  ['quick', 'Find the Right Guide'],
  ['visual', 'Visual Guide'],
  ['process', 'Full Process'],
  ['sources', 'Sources'],
]

const DEVICE_OPTIONS = ['Windows', 'Mac', 'iPhone', 'Android', 'Browser']
const ROLE_OPTIONS = ['Host', 'Participant']

function visualSource(src) {
  if (/^https?:\/\//i.test(src)) return src
  return `${import.meta.env.BASE_URL}${String(src).replace(/^\/+/, '')}`
}

export function CommonIssueDrawer({
  route,
  callContext,
  onClose,
  onOpenProcess,
  onOpenRoute,
  onContextChange,
  onTabChange,
  onTrackEvent,
  isFavorite = false,
  favoriteBusy = false,
  onToggleFavorite = () => {},
}) {
  const [tab, setTab] = useState('quick')
  const dialogRef = useRef(null)
  useDialogFocus(dialogRef, true, onClose)

  const processEntries = route.processIds
    .map(id => PROCESSES.find(process => process.id === id))
    .filter(Boolean)
  const visualEntries = Array.isArray(route.visuals)
    ? route.visuals.filter(visual => visual?.src && visual?.title)
    : []

  const selectedDevice = callContext?.device ?? null
  const selectedRole = callContext?.role ?? null
  const [selectedState, setSelectedState] = useState(null)

  useEffect(() => {
    setTab('quick')
    setSelectedState(null)
  }, [route.id])

  const routeHasDeviceBoundary = Array.isArray(route.supportedDevices) && route.supportedDevices.length > 0
  const routeDeviceMismatch = Boolean(
    selectedDevice
    && routeHasDeviceBoundary
    && !route.supportedDevices.includes(selectedDevice),
  )
  const routeNeedsDeviceSelection = !selectedDevice
  const stateSelectionRequired = Array.isArray(route.states) && route.states.length > 0 && !selectedState
  const recommendedProcessId = (!routeDeviceMismatch && !routeNeedsDeviceSelection && !stateSelectionRequired)
    ? recommendedProcessForRoute(route, { device: selectedDevice, state: selectedState })
    : null
  const recommendedProcess = processEntries.find(process => process.id === recommendedProcessId) ?? null
  const recommendationByDevice = DEVICE_OPTIONS
    .map(device => recommendedProcessForRoute(route, { device, state: selectedState }))
    .filter(Boolean)
  const deviceChangesRecommendedProcess = new Set(recommendationByDevice).size > 1
  const selectedPathMessage = !selectedDevice
    ? 'Choose a device'
    : routeDeviceMismatch
      ? `${selectedDevice} is not supported by this route`
      : stateSelectionRequired
        ? `${selectedDevice} selected · choose the exact screen state`
        : recommendedProcess
          ? deviceChangesRecommendedProcess
            ? `${selectedDevice} selected · recommended guide updated`
            : `${selectedDevice} path selected`
          : `${selectedDevice} selected`


  function startRecommendedGuide() {
    if (!recommendedProcess) return
    onTrackEvent?.({
      eventType: 'common_issue_route_to_process',
      routeId: 'navigator',
      categoryId: route.categoryId,
      processId: recommendedProcess.id,
      toolId: `common_issue_${route.id}_recommended_process`,
    })
    onOpenProcess?.(recommendedProcess.id, {
      device: selectedDevice,
      role: selectedRole,
      sourceRouteId: route.id,
    })
  }

  function selectTab(id, { focus = false } = {}) {
    setTab(id)
    const label = TABS.find(([tabId]) => tabId === id)?.[1] || id
    onTabChange?.(label)
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
        <div className="drawer-header-actions">
          <button type="button" className="drawer-close" aria-label="Close common issue route" onClick={onClose}>×</button>
          <FavoriteToggle
            active={isFavorite}
            busy={favoriteBusy}
            label={route.title}
            onToggle={onToggleFavorite}
          />
        </div>
      </header>

      <div className="common-issue-context common-issue-context-editor" aria-label="Route context">
        <div className="common-issue-context-field">
          <small>Device</small>
          <div className="common-issue-context-options" role="group" aria-label="Device">
            {DEVICE_OPTIONS.map(device => <button
              type="button"
              key={device}
              aria-pressed={selectedDevice === device}
              onClick={() => onContextChange?.({ device })}
            >{device}</button>)}
          </div>
        </div>
        <div className="common-issue-context-field">
          <small>Caller role</small>
          <div className="common-issue-context-options" role="group" aria-label="Caller role">
            {ROLE_OPTIONS.map(role => <button
              type="button"
              key={role}
              aria-pressed={selectedRole === role}
              onClick={() => onContextChange?.({ role })}
            >{role}</button>)}
          </div>
        </div>
        <span className="common-issue-context-status" aria-live="polite">
          <small>Selected path</small>
          <strong>{selectedPathMessage}</strong>
        </span>
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
        {tab === 'quick' && <section className="common-issue-quick common-issue-router" aria-label="Find the Right Guide">
          {selectedDevice && !routeDeviceMismatch && <section className="common-issue-device-selected" aria-live="polite">
            <div className="common-issue-device-selected-icon">✓</div>
            <div>
              <p className="eyebrow">Device path selected</p>
              <h3>{selectedDevice}</h3>
              {stateSelectionRequired
                ? <p>Device saved. Choose the exact screen state below so Ozzie can select the approved guide.</p>
                : recommendedProcess && deviceChangesRecommendedProcess
                  ? <p>This device changes the recommended approved Process Guide.</p>
                  : recommendedProcess
                    ? <p>This issue uses the same approved Process Guide across supported devices. Ozzie will carry <strong>{selectedDevice}</strong> into the Guided Process and show the relevant device path when available.</p>
                    : <p>Ozzie will use this device when selecting the approved next path.</p>}
            </div>
          </section>}

          <section className="common-issue-classification">
            <p className="eyebrow">1 · Identify the symptom</p>
            <strong>{route.classification}</strong>
            <p>{route.classificationNote}</p>
          </section>

          <section className="common-issue-section">
            <p className="eyebrow">2 · Confirm only what changes the route</p>
            <h3>Ask these before choosing a process</h3>
            <ol className="common-issue-confirm-list">
              {route.confirm.slice(0, 3).map(question => <li key={question}>{question}</li>)}
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
            <p className="eyebrow">3 · Match the exact screen state</p>
            <h3>Which one is the caller seeing?</h3>
            <div className="common-issue-state-choices">
              {route.states.map(state => <button
                type="button"
                key={state.title}
                aria-pressed={selectedState === state.title}
                onClick={() => setSelectedState(state.title)}
              >
                <strong>{state.title}</strong>
                <span>{state.badge}</span>
                <small>{state.body}</small>
              </button>)}
            </div>
          </section>}

          {routeNeedsDeviceSelection && <section className="common-issue-section common-issue-device-prompt">
            <p className="eyebrow">{route.states?.length ? '4' : '3'} · Device needed</p>
            <h3>Select the caller’s device above</h3>
            <p>Ozzie uses the device to choose the closest approved Process Guide and carries that selection into the guided steps.</p>
          </section>}

          {routeDeviceMismatch && <section className="common-issue-section common-issue-device-prompt">
            <p className="eyebrow">Different device path</p>
            <h3>This Common Issue does not support the selected device</h3>
            <p>{route.unsupportedDeviceNote || `The approved guidance in this route does not apply to ${selectedDevice}. Choose a supported device or a different Common Issue before continuing.`}</p>
          </section>}

          {!routeNeedsDeviceSelection && !routeDeviceMismatch && stateSelectionRequired && <section className="common-issue-section common-issue-device-prompt">
            <p className="eyebrow">One detail left</p>
            <h3>Select the exact screen state above</h3>
            <p>The next approved Process Guide changes depending on what Zoom is actually showing.</p>
          </section>}

          {recommendedProcess && <section className="common-issue-router-result">
            <div>
              <p className="eyebrow">Recommended approved guide</p>
              <h3>{recommendedProcess.title}</h3>
              <p>{recommendedProcess.purpose}</p>
              <div className="common-issue-route-badges">
                <span>Approved Process Document</span>
                <span>{selectedDevice}</span>
                {selectedRole && <span>{selectedRole}</span>}
              </div>
            </div>
            <button type="button" className="primary-action" onClick={startRecommendedGuide}>
              Start Guided Process →
            </button>
            <small>Ozzie is routing—not inventing. The guided steps come from the approved Process Document and retain source traceability to official Zoom Support.</small>
          </section>}

          {recommendedProcess && <section className="common-issue-source-preview">
            <span>Official Zoom reference</span>
            <a href={route.primarySource.url} target="_blank" rel="noreferrer">{route.primarySource.title} ↗</a>
          </section>}
        </section>}

        {tab === 'visual' && <section aria-label="Visual Guide">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Source-verified visual references</p>
              <h3>Visual Guide</h3>
            </div>
          </div>
          {visualEntries.length > 0
            ? <div className="common-issue-visual-grid">{visualEntries.map(visual => <figure key={visual.src}>
                <div className="common-issue-visual-frame">
                  <img src={visualSource(visual.src)} alt={visual.alt} loading="lazy" />
                </div>
                <figcaption>
                  <strong>{visual.title}</strong>
                  <span>{visual.note}</span>
                  {visual.sourceUrl && <a href={visual.sourceUrl} target="_blank" rel="noreferrer">{visual.sourceLabel || 'Open visual source'} ↗</a>}
                  {route.primarySource?.url && route.primarySource.url !== visual.sourceUrl && <a href={route.primarySource.url} target="_blank" rel="noreferrer">Official Zoom Support ↗</a>}
                </figcaption>
              </figure>)}</div>
            : <div className="common-issue-empty">
                <strong>No reviewed visual yet for this route.</strong>
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

          <p className="common-issue-verified">Verified against official Zoom Support: {COMMON_ISSUE_VERIFIED_AT}</p>
        </section>}
      </div>
    </aside>
  </div>
}
