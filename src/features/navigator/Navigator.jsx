import { useMemo, useState } from 'react'
import { PROCESSES } from '../../data/processes'
import { FeedbackForm } from '../feedback/FeedbackForm'
import { ProcessDrawer } from './ProcessDrawer'

const categories = [
  ['join', 'Joining Meetings', 'Links, waiting rooms, access errors'],
  ['audio', 'Audio & Microphone', 'Hear, speak, test, Bluetooth'],
  ['video', 'Camera & Video', 'Camera, self-view, video settings'],
  ['controls', 'Meeting Controls', 'Participants, icons, chat, reactions'],
  ['sharing', 'Screen Sharing', 'Share screen, desktop, content'],
  ['devices', 'Devices & App', 'Mobile, transfer, reinstall'],
  ['support', 'Support Boundaries', 'Locate → Describe → Guide → Confirm'],
]

const commonIssues = [
  ['Customer cannot hear anyone', 'zoom-audio-troubleshooting'],
  ['Microphone is not working', 'troubleshooting-speaker-or-microphone-issues-in-the-zoom-desktop-app'],
  ['Camera is not showing', 'zoom-camera-troubleshooting-during-a-meeting'],
  ['Customer cannot join', 'troubleshooting-when-you-cant-join-a-zoom-meeting'],
  ['Waiting for the host', 'waiting-for-the-host-to-start-a-meeting-or-webinar'],
  ['Bluetooth headset issue', 'using-bluetooth-headphones-with-zoom-on-android-ios'],
]

export function Navigator({ onFeedback, onOpenTraining }) {
  const [category, setCategory] = useState(null)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const visible = useMemo(() => {
    if (query.trim()) { const terms = query.toLowerCase().trim().split(/\s+/); return PROCESSES.filter(p => terms.every(term => `${p.title} ${p.purpose} ${p.keywords} ${p.text}`.toLowerCase().includes(term))) }
    return category ? PROCESSES.filter(p => p.category === category) : []
  }, [category, query])
  return <main className="navigator" id="navigator">
    <section className="hero"><div className="hero-kicker"><span className="status-dot" /> Support process workspace</div><h1>Find the next step <em>without opening documents.</em></h1><p>Search approved Zoom support processes, then follow a short visual route.</p><input aria-label="Search support processes" value={query} onChange={e => { setQuery(e.target.value); setCategory(null) }} placeholder="Search by issue, symptom, or process name" /></section>
    <section className="agent-workflow" aria-labelledby="workflow-title"><div><p className="eyebrow">Support workflow</p><h2 id="workflow-title">Locate → Describe → Guide → Confirm</h2></div><ol>{[['Locate','Find the exact issue'],['Describe','Explain the control'],['Guide','Give one step at a time'],['Confirm','Verify the result']].map(([title,text],index)=><li key={title}><span>{index+1}</span><div><strong>{title}</strong><small>{text}</small></div></li>)}</ol></section>
    <div className="navigator-entry-grid"><section><p className="eyebrow">Start here</p><h2>What does the customer need?</h2><div className="category-grid">{categories.map(([id,name,description])=><button key={id} onClick={()=>{setCategory(id);setQuery('')}}><strong>{name}</strong><span>{description}</span></button>)}</div></section><section className="common-issues"><p className="eyebrow">Fastest routes</p><h2>Common Issues</h2><div>{commonIssues.map(([label,id])=><button key={id} onClick={()=>setSelected(PROCESSES.find(process=>process.id===id))}>{label}<span>→</span></button>)}</div></section></div>
    {visible.length>0&&<section><h2>{query?`Results for “${query}”`:categories.find(c=>c[0]===category)?.[1]}</h2><div className="process-grid">{visible.map(process=><button className="process-card" key={process.id} onClick={()=>setSelected(process)}><small>{process.category}</small><strong>{process.title}</strong><span>{process.purpose}</span><div className="process-meta">{process.images?.length>0&&<span>{process.images.length} source {process.images.length===1?'page':'pages'}</span>}{process.visualReferences?.length>0&&<span>{process.visualReferences.length} Zoom {process.visualReferences.length===1?'visual':'visuals'}</span>}</div><b>Open process →</b></button>)}</div></section>}
    <button className="feedback-fab" onClick={()=>setFeedbackOpen(true)}>Report an issue</button>
    {selected&&<ProcessDrawer process={selected} onClose={()=>setSelected(null)} onOpenTraining={onOpenTraining}/>}
    {feedbackOpen&&<div className="modal-backdrop"><div className="profile-panel"><FeedbackForm context={{page_label:'Navigator',process_id:selected?.id??null,category_id:selected?.category??null}} onCancel={()=>setFeedbackOpen(false)} onSubmit={async payload=>{await onFeedback?.(payload);setFeedbackOpen(false)}}/></div></div>}
  </main>
}
