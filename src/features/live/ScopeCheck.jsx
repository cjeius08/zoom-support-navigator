import { useMemo, useState } from 'react'

const SOURCE_TITLE = 'Zoom Basic Support Boundaries, Decision Path & Referral Process'

export const SCOPE_CATEGORIES = [
  { id: 'basic', label: 'Basic Zoom setup / control / approved troubleshooting', kind: 'assist' },
  { id: 'host', label: 'Host action or meeting-owner permission', kind: 'refer' },
  { id: 'admin', label: 'Zoom admin, account, license, role, or organization access', kind: 'refer' },
  { id: 'device', label: 'Device / OS / network / VPN / firewall / security restriction', kind: 'refer' },
  { id: 'hardware', label: 'Mic / speaker / camera not recognized by the device itself', kind: 'refer' },
  { id: 'proceeding', label: 'Proceeding, recording, privacy, confidentiality, or authorization decision', kind: 'refer' },
]

export const TROUBLESHOOTING_STATUS = [
  { id: 'not-started', label: 'Approved troubleshooting not started yet' },
  { id: 'steps-remain', label: 'Approved troubleshooting steps still remain' },
  { id: 'exhausted', label: 'All approved troubleshooting completed; issue remains' },
  { id: 'resolved', label: 'Issue is resolved' },
]

export const AUTHORITY_STATUS = [
  { id: 'safe', label: 'No — next step stays inside approved scope' },
  { id: 'guess', label: 'Yes — it would require guessing, bypassing, or an unauthorized change' },
  { id: 'unsure', label: 'Not sure whether the caller is authorized' },
]

export function evaluateScope({ category, troubleshooting, authority }) {
  if (troubleshooting === 'resolved') {
    return {
      state: 'resolved',
      label: 'RESOLVED — DOCUMENT & CLOSE',
      title: 'The technical issue is resolved',
      text: 'Confirm the result with the caller, document what was completed, and close the interaction unless another in-scope question remains.',
      reason: 'The approved process says to test and confirm the result before closing.',
    }
  }

  if (authority === 'guess' || authority === 'unsure') {
    return {
      state: 'refer',
      label: 'STOP + REFER',
      title: authority === 'unsure' ? 'Do not guess about access or authorization' : 'The next action is outside approved authority',
      text: 'Stop basic troubleshooting. Explain that the remaining step requires assistance outside the level of access this support team provides.',
      reason: authority === 'unsure'
        ? 'If the caller’s authorization cannot be confirmed, do not bypass controls or make an unapproved change.'
        : 'The approved resource says to stop when continuing would require guessing, bypassing controls, or an unauthorized change.',
    }
  }

  const selectedCategory = SCOPE_CATEGORIES.find(item => item.id === category)
  if (selectedCategory?.kind === 'refer') {
    return {
      state: 'refer',
      label: 'STOP + REFER',
      title: 'A support boundary has been reached',
      text: 'Do not perform unnecessary additional troubleshooting. Explain what has already been checked, then identify the appropriate next support contact.',
      reason: selectedCategory.label,
    }
  }

  if (troubleshooting === 'exhausted') {
    return {
      state: 'refer',
      label: 'STOP + REFER',
      title: 'Approved troubleshooting is exhausted',
      text: 'The issue remains after all approved basic steps. Stop troubleshooting and move to referral for additional assistance.',
      reason: 'The approved resource lists unresolved issues after all approved troubleshooting as an immediate stop / refer trigger.',
    }
  }

  if (category === 'basic' && (troubleshooting === 'not-started' || troubleshooting === 'steps-remain') && authority === 'safe') {
    return {
      state: 'assist',
      label: 'CONTINUE APPROVED TROUBLESHOOTING',
      title: 'The issue is still within basic support scope',
      text: 'Use the relevant approved process, give one instruction at a time, and confirm the result after each meaningful action.',
      reason: 'Basic Zoom setup, navigation, controls, and approved troubleshooting are within scope.',
    }
  }

  return {
    state: 'pending',
    label: 'MORE INFORMATION NEEDED',
    title: 'Complete the scope check',
    text: 'Select the issue type, troubleshooting status, and whether the next step stays within approved authority.',
    reason: 'OGCon will only recommend continue / stop once the information that changes the route is selected.',
  }
}

export function ScopeCheck({ open = false, minimized = false, onMinimize = () => {}, onClose = () => {} }) {
  const [answers, setAnswers] = useState({
    category: '',
    troubleshooting: '',
    authority: '',
  })

  const result = useMemo(() => evaluateScope(answers), [answers])

  function update(key, value) {
    setAnswers(current => ({ ...current, [key]: value }))
  }

  function reset() {
    setAnswers({ category: '', troubleshooting: '', authority: '' })
  }

  if (!open) return null

  if (minimized) {
    return <aside className="documentation-dock documentation-dock-minimized scope-check-minimized" aria-label="Scope Check minimized">
      <button type="button" className="documentation-dock-restore" aria-label="Restore Scope Check" onClick={onMinimize}>
        <span>
          <strong>Scope Check</strong>
          <small>{result.state === 'pending' ? 'Decision not complete' : result.label}</small>
        </span>
        <span aria-hidden="true">▣</span>
      </button>
      <button type="button" className="documentation-dock-close" aria-label="Close Scope Check" onClick={onClose}>×</button>
    </aside>
  }

  return <aside className="documentation-dock scope-check-dock" aria-labelledby="scope-check-title">
    <header className="documentation-dock-header">
      <div>
        <span className="documentation-dock-kicker">Phase 5 · Batch 2 · Live tool</span>
        <h2 id="scope-check-title">Scope Check</h2>
      </div>
      <div className="documentation-dock-window-actions">
        <button type="button" aria-label="Minimize Scope Check" title="Minimize" onClick={onMinimize}>—</button>
        <button type="button" aria-label="Close Scope Check" title="Close" onClick={onClose}>×</button>
      </div>
    </header>

    <div className="documentation-dock-body scope-check-body">
      <aside className="scope-key-principle">
        <strong>Key principle</strong>
        <span>We do not need to fix every issue. Resolve what is within approved scope and recognize when the issue has moved outside that scope.</span>
      </aside>

      <section className="scope-question">
        <p><span>1</span> What kind of remaining action does the issue require?</p>
        <div className="scope-options">
          {SCOPE_CATEGORIES.map(option => <button
            key={option.id}
            type="button"
            aria-pressed={answers.category === option.id}
            onClick={() => update('category', option.id)}
          >{option.label}</button>)}
        </div>
      </section>

      <section className="scope-question">
        <p><span>2</span> Where are you in the approved troubleshooting process?</p>
        <div className="scope-options">
          {TROUBLESHOOTING_STATUS.map(option => <button
            key={option.id}
            type="button"
            aria-pressed={answers.troubleshooting === option.id}
            onClick={() => update('troubleshooting', option.id)}
          >{option.label}</button>)}
        </div>
      </section>

      <section className="scope-question">
        <p><span>3</span> Would the next step require guessing, bypassing a control, or making a change the caller may not be authorized to make?</p>
        <div className="scope-options">
          {AUTHORITY_STATUS.map(option => <button
            key={option.id}
            type="button"
            aria-pressed={answers.authority === option.id}
            onClick={() => update('authority', option.id)}
          >{option.label}</button>)}
        </div>
      </section>

      <section className={`scope-decision scope-decision-${result.state}`} aria-live="polite">
        <span>{result.label}</span>
        <h3>{result.title}</h3>
        <p>{result.text}</p>
        <small>{result.reason}</small>
      </section>

      {result.state === 'refer' && <aside className="scope-referral-next">
        <strong>Next in Batch 3</strong>
        <span>OGCon will identify the appropriate referral contact and give approved handoff wording. For now, stop the basic troubleshooting and do not invent a contact or promise an escalation.</span>
      </aside>}

      <footer className="scope-check-footer">
        <button type="button" className="scope-reset" onClick={reset}>Reset scope check</button>
        <small>Source: {SOURCE_TITLE}</small>
      </footer>
    </div>
  </aside>
}
