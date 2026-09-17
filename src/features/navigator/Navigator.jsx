import { useMemo, useState } from 'react'
import { PROCESSES } from '../../data/processes'
import { FeedbackForm } from '../feedback/FeedbackForm'

const categories = [
  ['join', 'Joining Meetings', 'Links, waiting rooms, access errors'],
  ['audio', 'Audio & Microphone', 'Hear, speak, test, Bluetooth'],
  ['video', 'Camera & Video', 'Camera, self-view, video settings'],
  ['controls', 'Meeting Controls', 'Participants, icons, chat, reactions'],
  ['sharing', 'Screen Sharing', 'Share screen, desktop, content'],
  ['devices', 'Devices & App', 'Mobile, transfer, reinstall'],
  ['support', 'Support Boundaries', 'Locate → Describe → Guide → Confirm'],
]

export function Navigator({ onFeedback }) {
  const [category, setCategory] = useState(null)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null); const [feedbackOpen, setFeedbackOpen] = useState(false)
  const visible = useMemo(() => {
    if (query.trim()) { const terms = query.toLowerCase().trim().split(/\s+/); return PROCESSES.filter(p => terms.every(term => `${p.title} ${p.purpose} ${p.keywords} ${p.text}`.toLowerCase().includes(term))) }
    return category ? PROCESSES.filter(p => p.category === category) : []
  }, [category, query])
  return <main className="navigator">
    <section className="hero"><div className="hero-kicker"><span className="status-dot" /> Support process workspace</div><h1>Find the next step <em>without opening documents.</em></h1><p>Search the approved Zoom support processes, then follow a short visual route.</p><input aria-label="Search support processes" value={query} onChange={e => { setQuery(e.target.value); setCategory(null) }} placeholder="Search by issue, symptom, or process name" /></section>
    <section><p className="eyebrow">Start here</p><h2>What does the customer need?</h2><div className="category-grid">{categories.map(([id, name, description]) => <button key={id} onClick={() => { setCategory(id); setQuery('') }}><strong>{name}</strong><span>{description}</span></button>)}</div></section>
    {visible.length > 0 && <section><h2>{query ? `Results for “${query}”` : categories.find(c => c[0] === category)?.[1]}</h2><div className="process-grid">{visible.map(process => <button className="process-card" key={process.id} onClick={() => setSelected(process)}><small>{process.category}</small><strong>{process.title}</strong><span>{process.purpose}</span><b>Open process →</b></button>)}</div></section>}
    <button className="feedback-fab" onClick={() => setFeedbackOpen(true)}>Report an issue</button>
    {selected && <dialog open className="process-dialog"><button aria-label="Close process" onClick={() => setSelected(null)}>×</button><small>{selected.category}</small><h2>{selected.title}</h2><p>{selected.purpose}</p><h3>Quick route</h3><ol>{selected.steps.map(step => <li key={step}>{step}</li>)}</ol><h3>When to refer</h3><p>{selected.referral}</p><details><summary>Full process</summary><pre>{selected.text}</pre></details></dialog>}
    {feedbackOpen && <div className="modal-backdrop"><div className="profile-panel"><FeedbackForm context={{ page_label:'Navigator', process_id:selected?.id ?? null, category_id:selected?.category ?? null }} onCancel={() => setFeedbackOpen(false)} onSubmit={async payload => { await onFeedback?.(payload); setFeedbackOpen(false) }} /></div></div>}
  </main>
}
