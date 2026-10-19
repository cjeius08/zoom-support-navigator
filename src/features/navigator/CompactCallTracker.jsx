import { useState } from 'react'
import { OGLETREE_CALL_FLOW_STEPS } from '../../data/ogletreeCallFlow'
import './compactCallTracker.css'

// Display only: the call-stage tracker never marks any support instruction as done.
// The agent controls progression and confirms results in the approved guide.
export function CompactCallTracker({ index = 0, onChange = () => {}, placement = 'home' }) {
  const [expanded, setExpanded] = useState(false)
  const step = OGLETREE_CALL_FLOW_STEPS[Math.max(0, Math.min(index, OGLETREE_CALL_FLOW_STEPS.length - 1))]
  const isDrawer = placement === 'drawer'
  return <section className={`compact-call-tracker compact-call-tracker--${placement}`} aria-label="Compact Approved Call Flow Tracker">
    <div className="compact-call-tracker-heading">
      <span className="compact-call-tracker-mark" aria-hidden="true">◉</span>
      <strong>Live Call Flow</strong>
      <span className="compact-call-tracker-number">Stage {step.number} / {OGLETREE_CALL_FLOW_STEPS.length}</span>
    </div>
    <div className="compact-call-tracker-progress" aria-hidden="true"><span style={{ width: `${step.number / OGLETREE_CALL_FLOW_STEPS.length * 100}%` }}/></div>
    <div className="compact-call-tracker-current">
      <strong>{step.name}</strong>
      <button type="button" className="compact-call-details-toggle" aria-expanded={expanded} onClick={() => setExpanded(open => !open)}>
        {expanded ? 'Hide script' : 'View script'}
      </button>
    </div>
    {expanded && <div className="compact-call-tracker-details">
      <p>{step.action}</p>
      <blockquote>“{step.script}”</blockquote>
      {step.id === 'troubleshoot' && <small>For each troubleshooting action: Locate → Describe → Guide → Confirm. Do not proceed without checking the caller’s result.</small>}
    </div>}
    <div className="compact-call-tracker-actions">
      <button type="button" aria-label={isDrawer ? 'Previous Call Stage in guide' : 'Previous Call Stage'} disabled={index <= 0} onClick={() => onChange(Math.max(0, index - 1))}>← Previous</button>
      <button type="button" aria-label={isDrawer ? 'Next Call Stage in guide' : 'Next Call Stage'} disabled={index >= OGLETREE_CALL_FLOW_STEPS.length - 1} onClick={() => onChange(Math.min(OGLETREE_CALL_FLOW_STEPS.length - 1, index + 1))}>Next →</button>
    </div>
  </section>
}
