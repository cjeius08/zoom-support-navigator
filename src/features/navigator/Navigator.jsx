import { useEffect, useMemo, useState } from 'react'
import { PROCESSES } from '../../data/processes'
import { ProcessDrawer } from './ProcessDrawer'
import { searchProcesses } from './smartSearch'
import { LiveCallFlow, LiveCallFlowDetails } from './LiveCallFlow'
import { CommonIssueDrawer } from './CommonIssueDrawer'
import { COMMON_ISSUE_ROUTES, routeById, searchCommonIssueRoutes } from './commonIssueRoutes'
import { FavoriteToggle } from '../favorites/FavoriteToggle'

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

function FavoriteRouteCard({
  route,
  onOpen,
  favorite = false,
  busy = false,
  onToggleFavorite = () => {},
  fast = false,
  showType = false,
}) {
  return <article className="favorite-card-shell">
    <button type="button" className={`route-card${fast ? ' route-card-fast' : ''}`} onClick={onOpen}>
      {showType ? <span className="result-type-badge">Common Issue</span> : fast ? <span>{route.group}</span> : null}
      <strong>{route.title}</strong>
      <small>{route.subtitle}</small>
      <b>Open Quick Guide →</b>
    </button>
    <FavoriteToggle
      active={favorite}
      busy={busy}
      compact
      className="favorite-card-toggle"
      label={route.title}
      onToggle={onToggleFavorite}
    />
  </article>
}

function FavoriteProcessCard({
  process,
  onOpen,
  favorite = false,
  busy = false,
  onToggleFavorite = () => {},
}) {
  return <article className="favorite-card-shell">
    <button type="button" className="process-card" onClick={onOpen}>
      <small className="result-type-badge">Process Guide</small>
      <strong>{process.title}</strong>
      <span>{process.purpose}</span>
      <div className="process-meta">
        {process.images?.length > 0 && <span>{process.images.length} source {process.images.length === 1 ? 'page' : 'pages'}</span>}
        {process.visualReferences?.length > 0 && <span>{process.visualReferences.length} Zoom {process.visualReferences.length === 1 ? 'visual' : 'visuals'}</span>}
      </div>
      <b>Open process →</b>
    </button>
    <FavoriteToggle
      active={favorite}
      busy={busy}
      compact
      className="favorite-card-toggle"
      label={process.title}
      onToggle={onToggleFavorite}
    />
  </article>
}

export function Navigator({ onOpenTraining, onTrackEvent, initialProcessId = null, initialCommonIssueId = null, onReportContextChange = () => {}, isFavorite = () => false, isFavoriteBusy = () => false, onToggleFavorite = () => {}, onResourceViewed = () => {} }) {
  const [category, setCategory] = useState(null)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [callContext, setCallContext] = useState({ device: null, role: null, hearingStatus: null, impact: null, status: null })
  const [commonIssueTab, setCommonIssueTab] = useState('Quick Guide')
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const [libraryTab, setLibraryTab] = useState('fastest')
  const [callFlowExpanded, setCallFlowExpanded] = useState(false)

  useEffect(() => {
    if (!initialProcessId) return
    const process = PROCESSES.find(item => item.id === initialProcessId)
    if (!process) return
    setSelectedRoute(null)
    setSelected(process)
    onResourceViewed('process', process.id)
    onTrackEvent?.({
      eventType: 'process_open',
      routeId: 'navigator',
      processId: process.id,
      categoryId: process.category,
      toolId: 'feedback_queue',
    })
  }, [initialProcessId, onResourceViewed, onTrackEvent])

  useEffect(() => {
    if (!initialCommonIssueId) return
    const route = routeById(initialCommonIssueId)
    if (!route) return
    setSelected(null)
    setSelectedRoute(route)
    setCommonIssueTab('Quick Guide')
    onResourceViewed('common_issue', route.id)
  }, [initialCommonIssueId, onResourceViewed])

  useEffect(() => {
    const libraryTabLabels = { fastest: 'Fastest Routes', common: 'Common Issues', processes: 'Process Guides' }
    onReportContextChange({
      selected_tab: selectedRoute ? commonIssueTab : libraryTabLabels[libraryTab] || libraryTab,
      current_section: selectedRoute ? 'Common Issue drawer' : selected ? 'Process Guide drawer' : category || null,
      active_device: callContext.device,
      active_caller_role: callContext.role,
      active_common_issue: selectedRoute?.id ?? null,
      process_id: selected?.id ?? null,
      category_id: selectedRoute?.categoryId ?? selected?.category ?? category ?? null,
    })
  }, [libraryTab, commonIssueTab, callContext.device, callContext.role, selectedRoute, selected, category, onReportContextChange])

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
    setCommonIssueTab('Quick Guide')
    setSelected(process)
    onResourceViewed('process', process.id)
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
    setCommonIssueTab('Quick Guide')
    setSelectedRoute(route)
    onResourceViewed('common_issue', route.id)
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
    <section className="navigator-top-workspace" aria-label="Live support workspace">
      <section className="smart-search-card" aria-labelledby="smart-search-title">
        <div className="smart-search-heading">
          <p className="eyebrow">Support search</p>
          <h1 id="smart-search-title">Find the next step</h1>
          <p>Search by caller symptom or approved process name.</p>
        </div>

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
            placeholder="Try: can’t share, can’t find chat, waiting for host…"
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

        <div className="smart-search-examples" aria-label="Example searches">
          <span>Try</span>
          {['cant share', 'cant find chat', 'waiting for host'].map(example => <button
            type="button"
            key={example}
            onClick={() => {
              setQuery(example)
              setCategory(null)
              setSuggestionsOpen(true)
              setActiveSuggestion(-1)
            }}
          >{example}</button>)}
        </div>

        <span className="sr-only" role="status" aria-live="polite">{query.trim() ? `${routeMatches.length} common issue ${routeMatches.length === 1 ? 'route' : 'routes'} and ${processMatches.length} related ${processMatches.length === 1 ? 'Process Guide' : 'Process Guides'}.` : ''}</span>
      </section>

      <LiveCallFlow
        expanded={callFlowExpanded}
        onExpandedChange={setCallFlowExpanded}
      />
    </section>

    {callFlowExpanded && <LiveCallFlowDetails onClose={() => setCallFlowExpanded(false)} />}

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
              {routeMatches.map(route => <FavoriteRouteCard
                key={route.id}
                route={route}
                showType
                onOpen={() => openRoute(route, 'search_result')}
                favorite={isFavorite('common_issue', route.id)}
                busy={isFavoriteBusy('common_issue', route.id)}
                onToggleFavorite={() => onToggleFavorite('common_issue', route.id)}
              />)}
            </div> : <div className="navigator-empty-state">No reviewed Common Issue route matches this search yet.</div>}
          </section>

          <section className="search-result-block" aria-labelledby="process-search-heading">
            <div className="search-result-block-heading">
              <h3 id="process-search-heading">Process Guides</h3>
              <span>{processMatches.length}</span>
            </div>
            {processMatches.length > 0 ? <div className="process-grid">
              {processMatches.map(process => <FavoriteProcessCard
                key={process.id}
                process={process}
                onOpen={() => openProcess(process, 'search_result')}
                favorite={isFavorite('process', process.id)}
                busy={isFavoriteBusy('process', process.id)}
                onToggleFavorite={() => onToggleFavorite('process', process.id)}
              />)}
            </div> : <div className="navigator-empty-state">No approved Process Guide matches this search.</div>}
          </section>
        </section> : <>
          {libraryTab === 'fastest' && <section aria-labelledby="fastest-routes-heading">
            <p className="eyebrow">Live-call shortcuts · Phase 2</p>
            <h2 id="fastest-routes-heading">Fastest Routes</h2>
            <p className="navigator-tab-intro">Keep the original high-frequency routes one click away. Start with the caller’s symptom, not a document title.</p>
            <div className="fastest-route-grid">
              {fastestRoutes.map(route => <FavoriteRouteCard
                key={route.id}
                route={route}
                fast
                onOpen={() => openRoute(route, 'fastest_route')}
                favorite={isFavorite('common_issue', route.id)}
                busy={isFavoriteBusy('common_issue', route.id)}
                onToggleFavorite={() => onToggleFavorite('common_issue', route.id)}
              />)}
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
                  {COMMON_ISSUE_ROUTES.filter(route => route.group === group).map(route => <FavoriteRouteCard
                    key={route.id}
                    route={route}
                    onOpen={() => openRoute(route, 'common_issues_tab')}
                    favorite={isFavorite('common_issue', route.id)}
                    busy={isFavoriteBusy('common_issue', route.id)}
                    onToggleFavorite={() => onToggleFavorite('common_issue', route.id)}
                  />)}
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
              <div className="process-grid">{categoryProcesses.map(process => <FavoriteProcessCard
                key={process.id}
                process={process}
                onOpen={() => openProcess(process, 'process_card')}
                favorite={isFavorite('process', process.id)}
                busy={isFavoriteBusy('process', process.id)}
                onToggleFavorite={() => onToggleFavorite('process', process.id)}
              />)}</div>
            </section>}
          </section>}
        </>}
      </div>
    </section>
    {selected&&<ProcessDrawer
      process={selected}
      onClose={()=>setSelected(null)}
      onOpenTraining={onOpenTraining}
      onTrackEvent={onTrackEvent}
      isFavorite={isFavorite('process', selected.id)}
      favoriteBusy={isFavoriteBusy('process', selected.id)}
      onToggleFavorite={() => onToggleFavorite('process', selected.id)}
    />}
    {selectedRoute&&<CommonIssueDrawer
      route={selectedRoute}
      callContext={callContext}
      onClose={()=>setSelectedRoute(null)}
      onOpenRoute={routeId=>openRoute(routeById(routeId),'redirect')}
      onOpenProcess={processId=>openProcess(PROCESSES.find(process=>process.id===processId),'common_issue_full_process')}
      onStatusChange={status=>setCallContext(current=>({...current,status}))}
      onContextChange={patch=>setCallContext(current=>({...current,...patch}))}
      onTabChange={setCommonIssueTab}
      onTrackEvent={onTrackEvent}
      isFavorite={isFavorite('common_issue', selectedRoute.id)}
      favoriteBusy={isFavoriteBusy('common_issue', selectedRoute.id)}
      onToggleFavorite={() => onToggleFavorite('common_issue', selectedRoute.id)}
    />}
  </section>
}
