import { useMemo, useRef, useState } from 'react'
import { PROCESSES } from '../../data/processes'
import { FeedbackForm } from '../feedback/FeedbackForm'
import { ProcessDrawer } from './ProcessDrawer'
import { searchProcesses } from './smartSearch'
import { useDialogFocus } from '../../lib/useDialogFocus'

const categories = [
  ['join', 'Joining Meetings', 'Links, waiting rooms, access errors'],
  ['audio', 'Audio & Microphone', 'Hear, speak, test, Bluetooth'],
  ['video', 'Camera & Video', 'Camera, self-view, video settings'],
  ['controls', 'Meeting Controls', 'Participants, icons, chat, reactions'],
  ['sharing', 'Screen Sharing', 'Share screen, desktop, content'],
  ['devices', 'Devices & App', 'Mobile, transfer, reinstall'],
  ['support', 'Support Boundaries', 'Locate → Describe → Guide → Confirm'],
]

const categoryIconPaths = {
  join: 'M5 4h9v16H5z M14 12h6 M17 9l3 3-3 3 M9 12h.01',
  audio: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z M5 11a7 7 0 0 0 14 0 M12 18v3 M9 21h6',
  video: 'M4 6h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z M17 10l5-3v10l-5-3Z',
  controls: 'M4 6h5 M15 6h5 M12 3v6 M4 12h9 M17 12h3 M15 9v6 M4 18h3 M11 18h9 M9 15v6',
  sharing: 'M4 4h16v11H4z M8 20h8 M12 15v5 M12 11V6 M9 9l3-3 3 3',
  devices: 'M7 3h10v18H7z M10 6h4 M11 18h2',
  support: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z M6 6l3 3 M15 15l3 3 M18 6l-3 3 M9 15l-3 3',
}

const commonIssues = [
  ['Customer cannot hear anyone', 'zoom-audio-troubleshooting'],
  ['Microphone is not working', 'troubleshooting-speaker-or-microphone-issues-in-the-zoom-desktop-app'],
  ['Camera is not showing', 'zoom-camera-troubleshooting-during-a-meeting'],
  ['Customer cannot join', 'troubleshooting-when-you-cant-join-a-zoom-meeting'],
  ['Waiting for the host', 'waiting-for-the-host-to-start-a-meeting-or-webinar'],
  ['Bluetooth headset issue', 'using-bluetooth-headphones-with-zoom-on-android-ios'],
]

function CategoryIcon({ type }) {
  return <span className={`category-icon category-icon-${type}`} data-testid="category-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d={categoryIconPaths[type]} /></svg></span>
}

function categoryLabel(id) {
  return categories.find(([categoryId]) => categoryId === id)?.[1] ?? id
}

export function Navigator({ onFeedback, onOpenTraining }) {
  const [category, setCategory] = useState(null)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const feedbackDialogRef = useRef(null)
  useDialogFocus(feedbackDialogRef, feedbackOpen, () => setFeedbackOpen(false))

  const searchMatches = useMemo(() => query.trim() ? searchProcesses(PROCESSES, query) : [], [query])

  const visible = useMemo(() => {
    if (query.trim()) return searchMatches
    return category ? PROCESSES.filter(process => process.category === category) : []
  }, [category, query, searchMatches])

  const suggestions = query.trim() ? searchMatches.slice(0, 6) : []
  const showSuggestions = suggestionsOpen && suggestions.length > 0

  function selectSuggestion(process) {
    setSelected(process)
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

  return <main className="navigator" id="navigator">
    <section className="hero">
      <div className="hero-kicker"><span className="status-dot" /> Support process workspace</div>
      <h1>Find the next step <em>without opening documents.</em></h1>
      <p>Search approved Zoom support processes, then follow a short visual route.</p>
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
          {suggestions.map((process, index) => <button
            type="button"
            role="option"
            id={`support-search-option-${index}`}
            className="search-suggestion"
            aria-selected={activeSuggestion === index}
            tabIndex={-1}
            key={process.id}
            onMouseMove={() => setActiveSuggestion(index)}
            onClick={() => selectSuggestion(process)}
          >
            <span className="search-suggestion-copy"><strong>{process.title}</strong><small>{process.purpose}</small></span>
            <span className="search-suggestion-category">{categoryLabel(process.category)}</span>
          </button>)}
        </div>}
      </div>
      <span className="sr-only" role="status" aria-live="polite">{query.trim() ? `${searchMatches.length} matching support ${searchMatches.length === 1 ? 'process' : 'processes'}.` : ''}</span>
    </section>
    <section className="agent-workflow" aria-labelledby="workflow-title"><div><p className="eyebrow">Support workflow</p><h2 id="workflow-title">Locate → Describe → Guide → Confirm</h2></div><ol>{[['Locate','Find the exact issue'],['Describe','Explain the control'],['Guide','Give one step at a time'],['Confirm','Verify the result']].map(([title,text],index)=><li key={title}><span>{index+1}</span><div><strong>{title}</strong><small>{text}</small></div></li>)}</ol></section>
    <div className="navigator-entry-grid"><section><p className="eyebrow">Start here</p><h2>What does the customer need?</h2><div className="category-grid">{categories.map(([id,name,description])=><button key={id} onClick={()=>{setCategory(id);setQuery('');setSuggestionsOpen(false);setActiveSuggestion(-1)}}><CategoryIcon type={id} /><strong>{name}</strong><span>{description}</span></button>)}</div></section><section className="common-issues"><p className="eyebrow">Fastest routes</p><h2>Common Issues</h2><div>{commonIssues.map(([label,id])=><button key={id} onClick={()=>setSelected(PROCESSES.find(process=>process.id===id))}>{label}<span>→</span></button>)}</div></section></div>
    {visible.length>0&&<section id="search-results" aria-live="polite"><h2>{query?`Results for “${query}”`:categories.find(c=>c[0]===category)?.[1]}</h2><div className="process-grid">{visible.map(process=><button className="process-card" key={process.id} onClick={()=>setSelected(process)}><small>{process.category}</small><strong>{process.title}</strong><span>{process.purpose}</span><div className="process-meta">{process.images?.length>0&&<span>{process.images.length} source {process.images.length===1?'page':'pages'}</span>}{process.visualReferences?.length>0&&<span>{process.visualReferences.length} Zoom {process.visualReferences.length===1?'visual':'visuals'}</span>}</div><b>Open process →</b></button>)}</div></section>}
    <button type="button" className="feedback-fab" onClick={()=>setFeedbackOpen(true)}>Report an issue</button>
    {selected&&<ProcessDrawer process={selected} onClose={()=>setSelected(null)} onOpenTraining={onOpenTraining}/>}
    {feedbackOpen&&<div className="modal-backdrop" role="presentation" onMouseDown={event=>event.target===event.currentTarget&&setFeedbackOpen(false)}><div ref={feedbackDialogRef} tabIndex={-1} className="profile-panel" role="dialog" aria-modal="true" aria-label="Report an issue"><FeedbackForm context={{page_label:'Navigator',process_id:selected?.id??null,category_id:selected?.category??null}} onCancel={()=>setFeedbackOpen(false)} onSubmit={async payload=>{await onFeedback?.(payload);setFeedbackOpen(false)}}/></div></div>}
  </main>
}
