import { useEffect, useRef, useState } from 'react'
import { assetUrl } from '../../lib/assetUrl'
import { processSections } from './processText'
import { relatedTrainingForCategory } from '../../data/trainingVideos'

const TABS = [['quick','Quick View'],['visual','Visual Guide'],['source','Source Pages'],['full','Full Process']]

const trainingCategoryByProcessCategory = { join: 'Joining Meetings', audio: 'Audio & Microphone', video: 'Camera & Video', controls: 'Meeting Controls', sharing: 'Screen Sharing', devices: 'Devices & App' }

export function ProcessDrawer({ process, onClose, onOpenTraining }) {
  const [tab, setTab] = useState('quick'); const closeRef = useRef(null); const [copied,setCopied]=useState(false)
  useEffect(() => { closeRef.current?.focus(); const key=e=>e.key==='Escape'&&onClose(); document.addEventListener('keydown',key); return()=>document.removeEventListener('keydown',key) }, [onClose])
  async function copySteps(){ await navigator.clipboard?.writeText(process.steps.map((s,i)=>`${i+1}. ${s}`).join('\n')); setCopied(true) }
  return <div className="drawer-backdrop" role="presentation" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><aside className="process-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
    <header className="drawer-header"><div><span className="process-category">{process.category}</span><h2 id="drawer-title">{process.title}</h2><p>{process.purpose}</p></div><button ref={closeRef} className="drawer-close" aria-label="Close process" onClick={onClose}>×</button></header>
    <div className="process-tabs" role="tablist" aria-label="Process views">{TABS.map(([id,label])=><button key={id} role="tab" aria-selected={tab===id} onClick={()=>setTab(id)}>{label}</button>)}</div>
    <div className="drawer-content">
      {tab==='quick'&&<section aria-label="Quick View"><div className="section-heading"><h3>Quick Route</h3><button onClick={copySteps}>{copied?'Copied':'Copy Quick Steps'}</button></div><ol className="quick-steps">{process.steps.map((step,index)=><li key={`${index}-${step}`}><span>{index+1}</span><p>{step}</p></li>)}</ol><div className="refer-card"><h3>When to Refer</h3><p>{process.referral}</p></div>{trainingCategoryByProcessCategory[process.category] && relatedTrainingForCategory(trainingCategoryByProcessCategory[process.category]).length > 0 && <div className="related-training"><p className="eyebrow">Related training</p><p>Find approved Zoom training for this support category.</p><button onClick={onOpenTraining}>Open Training &amp; Resources</button></div>}</section>}
      {tab==='visual'&&<section aria-label="Visual Guide">{process.visualReferences?.length?<div className="visual-list">{process.visualReferences.map((item,index)=><article className="visual-card" key={`${index}-${item.title}`}><div className="visual-card-head"><span>Visual {index+1}</span><strong>{item.status||'Matched to process'}</strong></div><h3>{item.title}</h3><img loading="lazy" src={assetUrl(item.image)} alt={item.title}/><div className="visual-guidance"><div><b>Locate &amp; Guide</b><p>{item.documentStep}</p><p>{item.instruction}</p></div><div><b>Confirm</b><p>{item.expectedResult}</p></div></div><footer>{item.platform&&<span>{item.platform}</span>}{item.sourceUrl&&<a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.sourceName||'Source'}</a>}</footer></article>)}</div>:<div className="empty-state"><h3>No visual reference available for this process yet</h3><p>Use Quick View or the source pages for source-backed guidance.</p></div>}</section>}
      {tab==='source'&&<section aria-label="Source Pages">{process.images?.length?<div className="source-pages">{process.images.map((image,index)=><figure key={image}><div><span>Page {index+1} of {process.images.length}</span><a href={assetUrl(image)} target="_blank" rel="noreferrer">Open full size</a></div><img loading="lazy" src={assetUrl(image)} alt={`${process.title} source page ${index+1}`}/></figure>)}</div>:<div className="empty-state"><h3>No source pages available</h3></div>}</section>}
      {tab==='full'&&<section className="full-process" aria-label="Full Process">{processSections(process.text).map((section,index)=><section className={section.heading.toLowerCase().includes('sample script')?'script-section':''} key={`${index}-${section.heading}`}><h3>{section.heading}</h3>{section.lines.map((line,lineIndex)=><p key={lineIndex}>{line}</p>)}</section>)}</section>}
    </div>
  </aside></div>
}
