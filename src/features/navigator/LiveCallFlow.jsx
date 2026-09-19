import { useState } from 'react'
import {
  OGLETREE_CALL_FLOW_SOURCE,
  OGLETREE_CALL_FLOW_STEPS,
  OGLETREE_RESOLUTION_BRANCH,
  OGLETREE_SIMPLE_AGENT_FORMULA,
} from '../../data/ogletreeCallFlow'
import './liveCallFlow.css'

const GUIDANCE_METHOD = [
  {
    name: 'Locate',
    detail: 'Find the correct Zoom area, platform, label, or control before asking the caller to act.',
  },
  {
    name: 'Describe',
    detail: 'Explain what the control looks like and what it does using the visible Zoom label.',
  },
  {
    name: 'Guide',
    detail: 'Give one action at a time, then pause. If the screen differs, stop and reassess instead of guessing.',
  },
  {
    name: 'Confirm',
    detail: 'Verify what changed or test the function before moving to the next step or closing the call.',
  },
]

function ChoiceGroup({ label, options, value, onChange, className = '' }) {
  return <div className={`live-call-choice-group ${className}`}>
    <span className="live-call-choice-label">{label}</span>
    <div className="live-call-choice-options" role="group" aria-label={label}>
      {options.map(option => <button
        type="button"
        key={option}
        aria-pressed={value === option}
        className={value === option ? 'selected' : ''}
        onClick={() => onChange(option)}
      >
        {option}
      </button>)}
    </div>
  </div>
}

export function LiveCallFlow({ expanded: controlledExpanded, onExpandedChange }) {
  const [internalExpanded, setInternalExpanded] = useState(false)
  const expandedControlled = controlledExpanded !== undefined
  const expanded = expandedControlled ? controlledExpanded : internalExpanded

  function toggleExpanded() {
    const next = !expanded
    if (!expandedControlled) setInternalExpanded(next)
    onExpandedChange?.(next)
  }

  return <section className="live-call-flow live-call-flow-approved" aria-label="Approved Ogletree Live Call Flow">
    <div className="live-call-flow-heading live-call-flow-heading-approved">
      <div>
        <p className="eyebrow">Approved call flow</p>
        <h2>Live Call Flow</h2>
        <p>Use the official Ogletree call sequence as your live reference. Expand only when you need the full approved workflow.</p>
      </div>
    </div>

    <button
      type="button"
      className="live-call-toggle"
      aria-expanded={expanded}
      aria-controls="live-call-workflow-details"
      onClick={toggleExpanded}
    >
      <span>{expanded ? 'Hide approved call flow' : 'View approved call flow'}</span>
      <small>{OGLETREE_CALL_FLOW_STEPS.length} steps</small>
      <span className="live-call-toggle-icon" aria-hidden="true">{expanded ? '−' : '+'}</span>
    </button>
  </section>
}

export function LiveCallFlowDetails({ onClose }) {
  return <section
    id="live-call-workflow-details"
    className="live-call-workflow-panel"
    aria-label="Detailed Ogletree Tier 1 Live Call Flow"
  >
    <div className="live-call-workflow-panel-heading">
      <div>
        <p className="eyebrow">Official Tier 1 call workflow</p>
        <h2>Detailed Call Workflow</h2>
        <p>Follow the call stages in order, but keep the conversation natural. Listen before troubleshooting and confirm the caller’s result before closing.</p>
      </div>
      {onClose && <button type="button" className="live-call-panel-close" onClick={onClose}>Close detailed flow</button>}
    </div>

    <section className="live-call-agent-formula" aria-label="Simple Agent Formula">
      <div>
        <p className="eyebrow">Simple agent formula</p>
        <h3>{OGLETREE_SIMPLE_AGENT_FORMULA.join(' → ')}</h3>
      </div>
      <small>Source · {OGLETREE_CALL_FLOW_SOURCE.title}</small>
    </section>

    <section className="live-call-guidance-method" aria-label="Locate Describe Guide Confirm method">
      <div className="live-call-guidance-heading">
        <div>
          <p className="eyebrow">Troubleshooting guidance method</p>
          <h3>Locate → Describe → Guide → Confirm</h3>
        </div>
        <span>Use inside Step 7 · Troubleshooting</span>
      </div>
      <div className="live-call-guidance-grid">
        {GUIDANCE_METHOD.map((stage, index) => <article key={stage.name}>
          <span>{index + 1}</span>
          <div>
            <strong>{stage.name}</strong>
            <p>{stage.detail}</p>
          </div>
        </article>)}
      </div>
      <p className="live-call-guidance-rule"><strong>Core rule:</strong> Do not move to the next troubleshooting instruction until the caller confirms what they see or what happened.</p>
    </section>

    <div className="live-call-table-wrap">
      <table className="live-call-table" aria-label="Live call flow">
        <thead>
          <tr>
            <th scope="col">Step</th>
            <th scope="col">Agent Action</th>
            <th scope="col">Suggested Script</th>
          </tr>
        </thead>
        <tbody>
          {OGLETREE_CALL_FLOW_STEPS.map(step => <tr key={step.id}>
            <th scope="row">
              <span className="live-call-step-number">{step.number}</span>
              <span>{step.name}</span>
            </th>
            <td>
              <span className="live-call-cell-label">Agent Action</span>
              <strong className="live-call-objective">{step.objective}</strong>
              <p>{step.action}</p>
            </td>
            <td>
              <span className="live-call-cell-label">Suggested Script</span>
              <blockquote>“{step.script}”</blockquote>
            </td>
          </tr>)}
        </tbody>
      </table>
    </div>

    <section className="live-call-resolution-branch" aria-labelledby="resolution-branch-title">
      <div className="live-call-resolution-branch-heading">
        <p className="eyebrow">After Step 8 · Confirm resolution</p>
        <h3 id="resolution-branch-title">Resolved?</h3>
      </div>
      <div className="live-call-resolution-paths">
        <article className="live-call-resolution-path live-call-resolution-path-resolved">
          <strong>{OGLETREE_RESOLUTION_BRANCH.resolved.label}</strong>
          <p>{OGLETREE_RESOLUTION_BRANCH.resolved.path.join(' → ')}</p>
        </article>
        <article className="live-call-resolution-path live-call-resolution-path-unresolved">
          <strong>{OGLETREE_RESOLUTION_BRANCH.unresolved.label}</strong>
          <p>{OGLETREE_RESOLUTION_BRANCH.unresolved.path.join(' → ')}</p>
        </article>
      </div>
      <aside>
        <strong>Escalation / referral note</strong>
        <p>{OGLETREE_RESOLUTION_BRANCH.boundaryNote}</p>
      </aside>
    </section>
  </section>
}
