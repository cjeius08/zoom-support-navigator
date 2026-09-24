import { useMemo, useState } from 'react'
import {
  AUTHORITY_STATUS,
  REFERRAL_ROADBLOCKS,
  SCOPE_CATEGORIES,
  SOURCE_TITLE,
  TROUBLESHOOTING_STATUS,
  evaluateScope,
  getReferralGuidance,
  getReferralRoadblocks,
} from './scopeCheckData'

export function ScopeCheck({ open = false, minimized = false, stackIndex = 0, onMinimize = () => {}, onClose = () => {} }) {
  const [answers, setAnswers] = useState({
    category: '',
    troubleshooting: '',
    authority: '',
  })
  const [roadblockId, setRoadblockId] = useState('')
  const [copyState, setCopyState] = useState('idle')

  const result = useMemo(() => evaluateScope(answers), [answers])
  const roadblocks = useMemo(() => getReferralRoadblocks(answers), [answers])
  const referral = useMemo(() => getReferralGuidance(roadblockId), [roadblockId])

  function update(key, value) {
    setAnswers(current => ({ ...current, [key]: value }))
    setRoadblockId('')
    setCopyState('idle')
  }

  function reset() {
    setAnswers({ category: '', troubleshooting: '', authority: '' })
    setRoadblockId('')
    setCopyState('idle')
  }

  async function copyHandoff() {
    if (!referral) return
    try {
      await navigator.clipboard.writeText(referral.language)
      setCopyState('copied')
      window.setTimeout(() => setCopyState(current => current === 'copied' ? 'idle' : current), 1600)
    } catch {
      setCopyState('failed')
    }
  }

  if (!open) return null

  if (minimized) {
    return <aside style={{ '--tool-stack-offset': `${Math.max(0, stackIndex) * 4.25}rem`, '--tool-stack-offset-compact': `${Math.max(0, stackIndex) * 3.25}rem` }} className="documentation-dock documentation-dock-minimized scope-check-minimized" aria-label="Scope Check minimized">
      <button type="button" className="documentation-dock-restore" aria-label="Restore Scope Check" title="Restore Scope Check" onClick={onMinimize}>
        <span>
          <strong>Scope Check</strong>
          <small>{referral ? referral.contact : result.state === 'pending' ? 'Decision not complete' : result.label}</small>
        </span>
        <span aria-hidden="true">▣</span>
      </button>
      <button type="button" className="documentation-dock-close" aria-label="Close Scope Check" onClick={onClose}>×</button>
    </aside>
  }

  return <aside className="documentation-dock scope-check-dock" aria-labelledby="scope-check-title">
    <header className="documentation-dock-header">
      <div>
        <span className="documentation-dock-kicker">Referral decision + handoff</span>
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
        <span>Resolve what is within approved scope. When the remaining action requires outside access or authority, stop and direct the caller to the correct contact.</span>
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

      {result.state === 'refer' && <section className="scope-referral-picker" aria-labelledby="scope-roadblock-title">
        <div className="scope-referral-picker-heading">
          <span>4</span>
          <div>
            <h3 id="scope-roadblock-title">What exact roadblock did you identify?</h3>
            <p>Choose the closest approved matrix item. This determines who owns the next step and the handoff wording.</p>
          </div>
        </div>

        {roadblocks.recommended.length > 0 && <div className="scope-roadblock-group">
          <strong>Likely matches</strong>
          <div className="scope-options scope-roadblock-options">
            {roadblocks.recommended.map(option => <button
              key={option.id}
              type="button"
              aria-pressed={roadblockId === option.id}
              onClick={() => {
                setRoadblockId(option.id)
                setCopyState('idle')
              }}
            >{option.label}</button>)}
          </div>
        </div>}

        <details className="scope-other-roadblocks">
          <summary>Show other approved roadblocks</summary>
          <div className="scope-options scope-roadblock-options">
            {roadblocks.other.map(option => <button
              key={option.id}
              type="button"
              aria-pressed={roadblockId === option.id}
              onClick={() => {
                setRoadblockId(option.id)
                setCopyState('idle')
              }}
            >{option.label}</button>)}
          </div>
        </details>
      </section>}

      {result.state === 'refer' && referral && <section className="scope-handoff-card" aria-live="polite">
        <div className="scope-handoff-contact">
          <span>WHO OWNS THE NEXT STEP</span>
          <strong>{referral.contact}</strong>
        </div>

        <div className="scope-handoff-boundary">
          <span>AGENT BOUNDARY</span>
          <p>{referral.boundary}</p>
        </div>

        <div className="scope-handoff-language">
          <span>APPROVED HANDOFF WORDING</span>
          <blockquote>“{referral.language}”</blockquote>
          <button type="button" onClick={copyHandoff}>
            {copyState === 'copied' ? 'Copied handoff wording' : 'Copy handoff wording'}
          </button>
          {copyState === 'failed' && <small role="status">Copy failed. Select the wording manually.</small>}
        </div>

        <div className="scope-handoff-documentation">
          <span>DOCUMENTATION CONTACT</span>
          <p>{referral.contact}</p>
          <small>Enter this contact type in Call Documentation. Do not invent a person’s name, phone number, email address, or support channel.</small>
        </div>
      </section>}

      {result.state === 'refer' && !referral && <aside className="scope-referral-next">
        <strong>Select the exact roadblock before ending the call</strong>
        <span>Do not guess who should be contacted. Choose the closest approved referral-matrix item above, then use the displayed contact and wording.</span>
      </aside>}

      <footer className="scope-check-footer">
        <button type="button" className="scope-reset" onClick={reset}>Reset scope check</button>
        <small>Source: {SOURCE_TITLE}</small>
      </footer>
    </div>
  </aside>
}
