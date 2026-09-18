import { useState } from 'react'
import {
  OGLETREE_CALL_FLOW_SOURCE,
  OGLETREE_CALL_FLOW_STEPS,
  OGLETREE_RESOLUTION_BRANCH,
  OGLETREE_SIMPLE_AGENT_FORMULA,
} from '../../data/ogletreeCallFlow'
import './liveCallFlow.css'

const DEVICES = ['Windows', 'Mac', 'iPhone', 'Android', 'Browser']
const ROLES = ['Host', 'Participant']
const HEARING_STATUSES = ['Preparing / not started', 'Active hearing']
const IMPACT_OPTIONS = ['Caller only', 'Others affected']
const STATUSES = ['Resolved', 'Unresolved', 'Referral Needed']

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

export function LiveCallFlow({ value, onChange, expanded: controlledExpanded, onExpandedChange }) {
  const [internalDevice, setInternalDevice] = useState(null)
  const [internalRole, setInternalRole] = useState(null)
  const [internalHearingStatus, setInternalHearingStatus] = useState(null)
  const [internalImpact, setInternalImpact] = useState(null)
  const [internalStatus, setInternalStatus] = useState(null)
  const [internalExpanded, setInternalExpanded] = useState(false)
  const controlled = value !== undefined
  const expandedControlled = controlledExpanded !== undefined
  const device = controlled ? value.device : internalDevice
  const role = controlled ? value.role : internalRole
  const hearingStatus = controlled ? value.hearingStatus : internalHearingStatus
  const impact = controlled ? value.impact : internalImpact
  const status = controlled ? value.status : internalStatus
  const expanded = expandedControlled ? controlledExpanded : internalExpanded

  function updateContext(field, nextValue) {
    if (!controlled) {
      if (field === 'device') setInternalDevice(nextValue)
      if (field === 'role') setInternalRole(nextValue)
      if (field === 'hearingStatus') setInternalHearingStatus(nextValue)
      if (field === 'impact') setInternalImpact(nextValue)
      if (field === 'status') setInternalStatus(nextValue)
    }
    onChange?.({ device, role, hearingStatus, impact, status, [field]: nextValue })
  }

  function resetCall() {
    if (!controlled) {
      setInternalDevice(null)
      setInternalRole(null)
      setInternalHearingStatus(null)
      setInternalImpact(null)
      setInternalStatus(null)
    }
    onChange?.({ device: null, role: null, hearingStatus: null, impact: null, status: null })
  }

  function toggleExpanded() {
    const next = !expanded
    if (!expandedControlled) setInternalExpanded(next)
    onExpandedChange?.(next)
  }

  return <section className="live-call-flow" aria-label="Ogletree Tier 1 Live Call Flow">
    <div className="live-call-flow-heading">
      <div>
        <p className="eyebrow">Live call context · Official Ogletree flow</p>
        <h2>Live Call Flow</h2>
        <p>Set the call context early. Hearing status matters because troubleshooting urgency can change once a hearing is already active.</p>
      </div>
      <button type="button" className="live-call-reset" onClick={resetCall}>Reset call</button>
    </div>

    <div className="live-call-context" aria-label="Call context">
      <ChoiceGroup label="Device" options={DEVICES} value={device} onChange={next => updateContext('device', next)} />
      <ChoiceGroup label="Caller role" options={ROLES} value={role} onChange={next => updateContext('role', next)} />
      <ChoiceGroup label="Hearing status" options={HEARING_STATUSES} value={hearingStatus} onChange={next => updateContext('hearingStatus', next)} />
      <ChoiceGroup label="Who is affected" options={IMPACT_OPTIONS} value={impact} onChange={next => updateContext('impact', next)} />
    </div>

    <div className="live-call-resolution">
      <ChoiceGroup
        label="Resolution status"
        options={STATUSES}
        value={status}
        onChange={next => updateContext('status', next)}
        className="live-call-status"
      />
    </div>

    <button
      type="button"
      className="live-call-toggle"
      aria-expanded={expanded}
      aria-controls="live-call-workflow-details"
      onClick={toggleExpanded}
    >
      <span>{expanded ? 'Hide full call flow' : 'View full call flow'}</span>
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
