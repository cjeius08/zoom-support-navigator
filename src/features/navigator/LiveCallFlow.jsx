import { useState } from 'react'
import './liveCallFlow.css'

const DEVICES = ['Windows', 'Mac', 'iPhone', 'Android', 'Browser']
const ROLES = ['Host', 'Participant']
const STATUSES = ['Resolved', 'Unresolved', 'Escalation Needed']


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

const CALL_STEPS = [
  {
    name: 'Opening',
    action: 'Greet the caller, introduce yourself, and invite them to explain what they need help with.',
    script: '“Thank you for calling. This is [Name]. How can I help you today?”',
  },
  {
    name: 'Acknowledgment',
    action: 'Briefly restate the concern so the caller knows you understood before troubleshooting.',
    script: '“I understand. I’ll help you work through that.”',
  },
  {
    name: 'Identify',
    action: 'Confirm the caller’s device, whether they are the host or a participant, and the exact symptom.',
    script: '“Before we start, what device are you using, and are you the host or a participant?”',
  },
  {
    name: 'Resolution',
    action: 'Guide one step at a time. Pause after each action and confirm what the caller sees before continuing.',
    script: '“I’ll guide you one step at a time. Let me know what you see after each step.”',
  },
  {
    name: 'Recap',
    action: 'Summarize what changed and confirm whether the original issue is now resolved.',
    script: '“We’ve completed those steps. Is everything working as expected now?”',
  },
  {
    name: 'Adjacent Issues',
    action: 'After the primary concern is addressed, check whether the caller needs help with anything closely related.',
    script: '“Before we finish, is there anything else in Zoom you need help with today?”',
  },
  {
    name: 'Closing',
    action: 'State the final resolution or next action, then close the call clearly and courteously.',
    script: '“Thank you for calling. I’m glad we could work through that with you today.”',
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
  const [internalStatus, setInternalStatus] = useState(null)
  const [internalExpanded, setInternalExpanded] = useState(false)
  const controlled = value !== undefined
  const expandedControlled = controlledExpanded !== undefined
  const device = controlled ? value.device : internalDevice
  const role = controlled ? value.role : internalRole
  const status = controlled ? value.status : internalStatus
  const expanded = expandedControlled ? controlledExpanded : internalExpanded

  function updateContext(field, nextValue) {
    if (!controlled) {
      if (field === 'device') setInternalDevice(nextValue)
      if (field === 'role') setInternalRole(nextValue)
      if (field === 'status') setInternalStatus(nextValue)
    }
    onChange?.({ device, role, status, [field]: nextValue })
  }

  function resetCall() {
    if (!controlled) {
      setInternalDevice(null)
      setInternalRole(null)
      setInternalStatus(null)
    }
    onChange?.({ device: null, role: null, status: null })
  }

  function toggleExpanded() {
    const next = !expanded
    if (!expandedControlled) setInternalExpanded(next)
    onExpandedChange?.(next)
  }

  return <section className="live-call-flow" aria-label="Core Live Call Flow">
    <div className="live-call-flow-heading">
      <div>
        <p className="eyebrow">Live call context</p>
        <h2>Live Call Flow</h2>
        <p>Set the caller context once. OGCon carries it into the troubleshooting route.</p>
      </div>
      <button type="button" className="live-call-reset" onClick={resetCall}>Reset call</button>
    </div>

    <div className="live-call-context" aria-label="Call context">
      <ChoiceGroup label="Device" options={DEVICES} value={device} onChange={next => updateContext('device', next)} />
      <ChoiceGroup label="Caller role" options={ROLES} value={role} onChange={next => updateContext('role', next)} />
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
      <small>7 steps</small>
      <span className="live-call-toggle-icon" aria-hidden="true">{expanded ? '−' : '+'}</span>
    </button>
  </section>
}

export function LiveCallFlowDetails({ onClose }) {
  return <section
    id="live-call-workflow-details"
    className="live-call-workflow-panel"
    aria-label="Detailed Live Call Flow"
  >
    <div className="live-call-workflow-panel-heading">
      <div>
        <p className="eyebrow">Full call workflow</p>
        <h2>Detailed Call Workflow</h2>
        <p>Use these stages as a conversation guide. Keep the call natural and move one step at a time.</p>
      </div>
      {onClose && <button type="button" className="live-call-panel-close" onClick={onClose}>Close detailed flow</button>}
    </div>

    <section className="live-call-guidance-method" aria-label="Locate Describe Guide Confirm method">
      <div className="live-call-guidance-heading">
        <div>
          <p className="eyebrow">Approved agent guidance method</p>
          <h3>Locate → Describe → Guide → Confirm</h3>
        </div>
        <span>Use with every troubleshooting route</span>
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
      <p className="live-call-guidance-rule"><strong>Core rule:</strong> Do not move to the next instruction until the caller confirms what they see or what happened.</p>
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
          {CALL_STEPS.map((step, index) => <tr key={step.name}>
            <th scope="row">
              <span className="live-call-step-number">{index + 1}</span>
              <span>{step.name}</span>
            </th>
            <td>
              <span className="live-call-cell-label">Agent Action</span>
              <p>{step.action}</p>
            </td>
            <td>
              <span className="live-call-cell-label">Suggested Script</span>
              <blockquote>{step.script}</blockquote>
            </td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </section>
}
