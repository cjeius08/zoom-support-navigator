import { useEffect, useMemo, useRef, useState } from 'react'
import { PROCESSES } from '../../data/processes'
import { FeedbackForm } from '../feedback/FeedbackForm'
import { ProcessDrawer } from './ProcessDrawer'
import { searchProcesses } from './smartSearch'
import { useDialogFocus } from '../../lib/useDialogFocus'
import { LiveCallFlow } from './LiveCallFlow'
import { CommonIssueDrawer } from './CommonIssueDrawer'
import { COMMON_ISSUE_ROUTES, routeById, searchCommonIssueRoutes } from './commonIssueRoutes'

const categories = [
  ['join', 'Joining Meetings', 'Links, waiting rooms, access errors'],
  ['audio', 'Audio & Microphone', 'Hear, speak, test, Bluetooth'],
  ['video', 'Camera & Video', 'Camera, self-view, video settings'],
  ['controls', 'Meeting Controls', 'Participants, icons, chat, reactions'],
  ['sharing', 'Screen Sharing', 'Share screen, desktop, content'],
  ['devices', 'Devices & App', 'Mobile, transfer, reinstall'],
  ['support', 'Support Boundaries', 'Locate → Describe → Guide → Confirm'],
]

const FASTEST_ROUTE_IDS = ['cant-join', 'waiting-entry', 'cant-hear', 'cant-be-heard', 'camera-not-working']

const categoryIconPaths = {
  join: 'M5 4h9v16H5z M14 12h6 M17 9l3 3-3 3 M9 12h.01',
  audio: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z M5 11a7 7 0 0 0 14 0 M12 18v3 M9 21h6',
  video: 'M4 6h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z M17 10l5-3v10l-5-3Z',
  controls: 'M4 6h5 M15 6h5 M12 3v6 M4 12h9 M17 12h3 M15 9v6 M4 18h3 M11 18h9 M9 15v6',
  sharing: 'M4 4h16v11H4z M8 20h8 M12 15v5 M12 11V6 M9 9l3-3 3 3',
  devices: 'M7 3h10v18H7z M10 6h4 M11 18h2',
  support: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z M6 6l3 3 M15 15l3 3 M18 6l-3 3 M9 15l-3 3',
}


function CategoryIcon({ type }) {
  return <span className={`category-icon category-icon-${type}`} data-testid="category-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d={categoryIconPaths[type]} /></svg></span>
}

function categoryLabel(id) {
  return categories.find(([categoryId]) => categoryId === id)?.[1] ?? id
}

export function Navigator({ onFeedback, onOpenTraining, onTrackEvent, initialProcessId = null }) {
  const [category, setCategory] = useState(null)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [callContext, setCallContext] = useState({ device: null, role: null, status: null })
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const [libraryTab, setLibraryTab] = useState('fastest')
  const feedbackDialogRef = useRef(null)
  useDialogFocus(feedbackDialogRef, feedbackOpen, () => setFeedbackOpen(false))

  useEffect(() => {
    if (!initialProcessId) return
    const process = PROCESSES.find(item => item.id === initialProcessId)
    if (!process) return
    setSelected(process)
    onTrackEvent?.({
      eventType: 'process_open',
      routeId: 'navigator',
      processId: process.id,
      categoryId: process.category,
      toolId: 'feedback_queue',
    })
  }, [initialProcessId, onTrackEvent])

  const searchMatches = useMemo(() => query.trim() ? searchProcesses(PROCESSES, query) : [], [query])
  const routeMatches = useMemo(() => query.trim() ? searchCommonIssueRoutes(query) : [], [query])
  const processMatches = useMemo(() => {
    const processesById = new Map(PROCESSES.map(process => [process.id, process]))
    const related = routeMatches.flatMap(route => route.processIds ?? []).map(id => processesById.get(id)).filter(Boolean)
    const seen = new Set()
    return [...related, ...searchMatches].filter(process => {
      if (seen.has(process.id)) return false
      seen.add(process.id)
      return true
    })
  }, [routeMatches, searchMatches])

  const categoryProcesses = useMemo(() => (
    category ? PROCESSES.filter(process => process.category === category) : []
  ), [category])
  const fastestRoutes = useMemo(() => FASTEST_ROUTE_IDS.map(routeById).filter(Boolean), [])

  const suggestions = query.trim()
    ? [
        ...routeMatches.map(route => ({ kind: 'route', route })),
        ...processMatches.map(process => ({ kind: 'process', process })),
      ].slice(0, 8)
    : []
  const showSuggestions = suggestionsOpen && suggestions.length > 0

  function switchLibraryTab(nextTab) {
    setLibraryTab(nextTab)
    setCategory(null)
    setQuery('')
    setSuggestionsOpen(false)
    setActiveSuggestion(-1)
    onTrackEvent?.({ eventType: 'tool_open', routeId: 'navigator', toolId: `navigator_tab_${nextTab}` })
  }

  function openProcess(process, toolId = 'process_card') {
    if (!process) return
    setSelectedRoute(null)
    setSelected(process)
    onTrackEvent?.({
      eventType: 'process_open',
      routeId: 'navigator',
      processId: process.id,
      categoryId: process.category,
      toolId,
    })
  }

  function openRoute(route, toolId = 'common_issue') {
    if (!route) return
    setSelected(null)
    setSelectedRoute(route)
    onTrackEvent?.({
      eventType: 'tool_open',
      routeId: 'navigator',
      categoryId: route.categoryId,
      toolId: `common_issue_${route.id}_${toolId}`,
    })
  }

  function selectSuggestion(suggestion) {
    if (suggestion.kind === 'route') openRoute(suggestion.route, 'search_suggestion')
    else openProcess(suggestion.process, 'search_suggestion')
    setSuggestionsOpen(false)
    setActiveSuggestion(-1)
  }

  function handleSearchKeyDown(event) {
    if (event.key === 'Escape') {
      setSuggestionsOpen(false)
      setActiveSuggestion(-1)
      return
    }
    if (!suggestions.length) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSuggestionsOpen(true)
      setActiveSuggestion(current => current >= suggestions.length - 1 ? 0 : current + 1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSuggestionsOpen(true)
      setActiveSuggestion(current => current <= 0 ? suggestions.length - 1 : current - 1)
    } else if (event.key === 'Enter' && activeSuggestion >= 0) {
      event.preventDefault()
      selectSuggestion(suggestions[activeSuggestion])
    }
  }

  return <section className="navigator" id="navigator" aria-label="Support Navigator">
    <LiveCallFlow value={callContext} onChange={setCallContext} />
    <section className="hero">
      <div className="hero-kicker"><span className="status-dot" /> Support process workspace</div>
      <h1>Find the next step <em>without opening documents.</em></h1>
      <p>Search by caller symptom or approved process name, then follow the right support route.</p>
      <div className="search-combobox" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) { setSuggestionsOpen(false); setActiveSuggestion(-1) } }}>
        <input
          role="combobox"
          aria-label="Search support processes"
          aria-autocomplete="list"
          aria-controls="support-search-suggestions"
          aria-expanded={showSuggestions}
          aria-activedescendant={showSuggestions && activeSuggestion >= 0 ? `support-search-option-${activeSuggestion}` : undefined}
          value={query}
          onFocus={() => { if (query.trim()) setSuggestionsOpen(true) }}
          onKeyDown={handleSearchKeyDown}
          onChange={event => {
            const nextQuery = event.target.value
            setQuery(nextQuery)
            setCategory(null)
            setSuggestionsOpen(Boolean(nextQuery.trim()))
            setActiveSuggestion(-1)
          }}
          placeholder="Search by issue, symptom, or process name"
        />
        {showSuggestions && <div className="search-suggestions" id="support-search-suggestions" role="listbox" aria-label="Search suggestions">
          {suggestions.map((suggestion, index) => {
            const isRoute = suggestion.kind === 'route'
            const item = isRoute ? suggestion.route : suggestion.process
            return <button
              type="button"
              role="option"
              id={`support-search-option-${index}`}
              className={`search-suggestion${isRoute ? ' search-suggestion-route' : ''}`}
              aria-selected={activeSuggestion === index}
              tabIndex={-1}
              key={`${suggestion.kind}-${item.id}`}
              onMouseMove={() => setActiveSuggestion(index)}
              onClick={() => selectSuggestion(suggestion)}
            >
              <span className="search-suggestion-copy"><strong>{item.title}</strong><small>{isRoute ? item.subtitle : item.purpose}</small></span>
              <span className="search-suggestion-category">{isRoute ? 'Common Issue' : 'Process Guide'}</span>
            </button>
          })}
        </div>}
      </div>
      <span className="sr-only" role="status" aria-live="polite">{query.trim() ? `${routeMatches.length} common issue ${routeMatches.length === 1 ? 'route' : 'routes'} and ${processMatches.length} related ${processMatches.length === 1 ? 'Process Guide' : 'Process Guides'}.` : ''}</span>
    </section>
    <section className="navigator-library" aria-label="Navigator library">
      <div className="navigator-library-tabs" role="tablist" aria-label="Navigator views">
        <button type="button" role="tab" aria-selected={libraryTab === 'fastest'} aria-controls="navigator-library-panel" onClick={() => switchLibraryTab('fastest')}>Fastest Routes</button>
        <button type="button" role="tab" aria-selected={libraryTab === 'common'} aria-controls="navigator-library-panel" onClick={() => switchLibraryTab('common')}>Common Issues</button>
        <button type="button" role="tab" aria-selected={libraryTab === 'processes'} aria-controls="navigator-library-panel" onClick={() => switchLibraryTab('processes')}>Process Guides</button>
      </div>

      <div id="navigator-library-panel" className="navigator-tab-panel" role="tabpanel">
        {query.trim() ? <section id="search-results" className="combined-search-results" aria-live="polite">
          <div className="search-results-heading">
            <p className="eyebrow">Smart Search</p>
            <h2>Results for “{query}”</h2>
            <p>Common caller issues are shown first. Approved Process Guides remain available underneath for the full procedure.</p>
          </div>

          <section className="search-result-block" aria-labelledby="common-search-heading">
            <div className="search-result-block-heading">
              <h3 id="common-search-heading">Common Issues</h3>
              <span>{routeMatches.length}</span>
            </div>
            {routeMatches.length > 0 ? <div className="route-browser-grid">
              {routeMatches.map(route => <button type="button" className="route-card" key={route.id} onClick={() => openRoute(route, 'search_result')}>
                <span className="result-type-badge">Common Issue</span>
                <strong>{route.title}</strong>
                <small>{route.subtitle}</small>
                <b>Open Quick Guide →</b>
              </button>)}
            </div> : <div className="navigator-empty-state">No reviewed Common Issue route matches this search yet.</div>}
          </section>

          <section className="search-result-block" aria-labelledby="process-search-heading">
            <div className="search-result-block-heading">
              <h3 id="process-search-heading">Process Guides</h3>
              <span>{processMatches.length}</span>
            </div>
            {processMatches.length > 0 ? <div className="process-grid">
              {processMatches.map(process => <button className="process-card" key={process.id} onClick={() => openProcess(process, 'search_result')}>
                <small className="result-type-badge">Process Guide</small>
                <strong>{process.title}</strong>
                <span>{process.purpose}</span>
                <div className="process-meta">{process.images?.length>0&&<span>{process.images.length} source {process.images.length===1?'page':'pages'}</span>}{process.visualReferences?.length>0&&<span>{process.visualReferences.length} Zoom {process.visualReferences.length===1?'visual':'visuals'}</span>}</div>
                <b>Open process →</b>
              </button>)}
            </div> : <div className="navigator-empty-state">No approved Process Guide matches this search.</div>}
          </section>
        </section> : <>
          {libraryTab === 'fastest' && <section aria-labelledby="fastest-routes-heading">
            <p className="eyebrow">Live-call shortcuts · Phase 2</p>
            <h2 id="fastest-routes-heading">Fastest Routes</h2>
            <p className="navigator-tab-intro">Keep the original high-frequency routes one click away. Start with the caller’s symptom, not a document title.</p>
            <div className="fastest-route-grid">
              {fastestRoutes.map(route => <button type="button" className="route-card route-card-fast" key={route.id} onClick={() => openRoute(route, 'fastest_route')}>
                <span>{route.group}</span>
                <strong>{route.title}</strong>
                <small>{route.subtitle}</small>
                <b>Open Quick Guide →</b>
              </button>)}
            </div>
          </section>}

          {libraryTab === 'common' && <section aria-labelledby="common-issues-heading">
            <p className="eyebrow">Browse by caller language</p>
            <h2 id="common-issues-heading">Common Issues</h2>
            <p className="navigator-tab-intro">All reviewed live-call routes, grouped by what the caller is experiencing.</p>
            <div className="common-issue-browser">
              {[...new Set(COMMON_ISSUE_ROUTES.map(route => route.group))].map(group => <section className="route-group" key={group}>
                <h3>{group}</h3>
                <div className="route-browser-grid">
                  {COMMON_ISSUE_ROUTES.filter(route => route.group === group).map(route => <button type="button" className="route-card" key={route.id} onClick={() => openRoute(route, 'common_issues_tab')}>
                    <strong>{route.title}</strong>
                    <small>{route.subtitle}</small>
                    <b>Open Quick Guide →</b>
                  </button>)}
                </div>
              </section>)}
            </div>
          </section>}

          {libraryTab === 'processes' && <section aria-labelledby="process-guides-heading">
            <p className="eyebrow">Approved documentation</p>
            <h2 id="process-guides-heading">Process Guides</h2>
            <p className="navigator-tab-intro">Browse the approved internal procedures by support area. These remain the full-process reference behind the faster Common Issue routes.</p>
            <div className="category-grid">{categories.map(([id,name,description])=><button key={id} aria-pressed={category === id} onClick={()=>{setCategory(id);onTrackEvent?.({eventType:'category_open',routeId:'navigator',categoryId:id})}}><CategoryIcon type={id} /><strong>{name}</strong><span>{description}</span></button>)}</div>
            {category && <section className="process-guide-results" aria-live="polite">
              <div className="search-result-block-heading">
                <h3>{categories.find(c=>c[0]===category)?.[1]}</h3>
                <span>{categoryProcesses.length}</span>
              </div>
              <div className="process-grid">{categoryProcesses.map(process=><button className="process-card" key={process.id} onClick={()=>openProcess(process,'process_card')}><small className="result-type-badge">Process Guide</small><strong>{process.title}</strong><span>{process.purpose}</span><div className="process-meta">{process.images?.length>0&&<span>{process.images.length} source {process.images.length===1?'page':'pages'}</span>}{process.visualReferences?.length>0&&<span>{process.visualReferences.length} Zoom {process.visualReferences.length===1?'visual':'visuals'}</span>}</div><b>Open process →</b></button>)}</div>
            </section>}
          </section>}
        </>}
      </div>
    </section>
    <button type="button" className="feedback-fab" onClick={()=>setFeedbackOpen(true)}>Report an issue</button>
    {selected&&<ProcessDrawer process={selected} onClose={()=>setSelected(null)} onOpenTraining={onOpenTraining} onTrackEvent={onTrackEvent}/>}
    {selectedRoute&&<CommonIssueDrawer
      route={selectedRoute}
      callContext={callContext}
      onClose={()=>setSelectedRoute(null)}
      onOpenRoute={routeId=>setSelectedRoute(routeById(routeId))}
      onOpenProcess={processId=>openProcess(PROCESSES.find(process=>process.id===processId),'common_issue_full_process')}
      onStatusChange={status=>setCallContext(current=>({...current,status}))}
      onTrackEvent={onTrackEvent}
    />}
    {feedbackOpen&&<div className="modal-backdrop" role="presentation" onMouseDown={event=>event.target===event.currentTarget&&setFeedbackOpen(false)}><div ref={feedbackDialogRef} tabIndex={-1} className="profile-panel" role="dialog" aria-modal="true" aria-label="Report an issue"><FeedbackForm context={{route_id:'navigator',page_label:'Navigator',process_id:selected?.id??null,category_id:selected?.category??null}} onCancel={()=>setFeedbackOpen(false)} onSubmit={async payload=>{await onFeedback?.(payload);setFeedbackOpen(false)}}/></div></div>}
  </section>
}
