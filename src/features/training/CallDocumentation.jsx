import { useEffect, useMemo, useState } from 'react'

const SOURCE_TITLE = 'Zoom Basic Support Boundaries, Decision Path & Referral Process'

const DEVICE_OPTIONS = [
  'Windows',
  'Mac',
  'Browser',
  'iPhone / iPad',
  'Android',
  'Linux',
  'Other / Unknown',
]

const OUTCOMES = [
  'Resolved',
  'Partially Resolved',
  'Referred for Additional Assistance',
  'Follow-Up Required',
  'No Issue Found / General Assistance',
]

function createInitialDraft() {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)

  return {
    callerName: '',
    phoneNumber: '',
    dateTime: local,
    callerRef: '',
    device: '',
    accessContext: '',
    exactIssue: '',
    stepsResult: '',
    resolutionNextSteps: '',
    recommendedContact: '',
    outcome: '',
  }
}

function Field({ label, hint, children, wide = false }) {
  return <label className={wide ? 'documentation-field documentation-field-wide' : 'documentation-field'}>
    <span>{label}</span>
    {hint && <small>{hint}</small>}
    {children}
  </label>
}

export function formatCallDocumentation(draft) {
  return [
    ['Caller Name', draft.callerName],
    ['Phone Number', draft.phoneNumber],
    ['Date and Time', draft.dateTime ? draft.dateTime.replace('T', ' ') : ''],
    ['Caller Ref', draft.callerRef],
    ['Device / Platform', draft.device],
    ['Device and Access', draft.accessContext],
    ['Exact Issue', draft.exactIssue],
    ['Steps Attempted + Result', draft.stepsResult],
    ['Resolution / Next Steps', draft.resolutionNextSteps],
    ['Recommended Contact (if referred)', draft.recommendedContact],
    ['Call Outcome', draft.outcome],
  ].map(([label, value]) => `${label}: ${value || '—'}`).join('\n')
}

export function CallDocumentation({ onReportContextChange = () => {} }) {
  const [draft, setDraft] = useState(createInitialDraft)
  const [copyState, setCopyState] = useState('idle')
  const formatted = useMemo(() => formatCallDocumentation(draft), [draft])

  useEffect(() => {
    onReportContextChange({
      selected_tab: 'Documentation',
      current_section: draft.outcome ? 'Call outcome · ' + draft.outcome : 'Call documentation draft',
      active_device: draft.device || null,
      active_caller_role: null,
      active_common_issue: null,
      process_id: null,
      category_id: null,
    })
  }, [draft.device, draft.outcome, onReportContextChange])

  function update(key, value) {
    setDraft(current => ({ ...current, [key]: value }))
    if (copyState !== 'idle') setCopyState('idle')
  }

  async function copyDocumentation() {
    try {
      await navigator.clipboard.writeText(formatted)
      setCopyState('copied')
      window.setTimeout(() => setCopyState(current => current === 'copied' ? 'idle' : current), 1600)
    } catch {
      setCopyState('failed')
    }
  }

  function clearDocumentation() {
    if (!window.confirm('Clear this documentation draft for the next call?')) return
    setDraft(createInitialDraft())
    setCopyState('idle')
  }

  return <section className="call-documentation" aria-labelledby="call-documentation-title">
    <div className="documentation-intro">
      <div>
        <p className="eyebrow">Phase 5 · Batch 1 · Documentation workspace</p>
        <h2 id="call-documentation-title">Document the call while the details are fresh</h2>
        <p>Capture only what happened, what was tested, and the next action. Do not document assumptions as facts.</p>
      </div>
      <span className="device-verified">Source-backed</span>
    </div>

    <aside className="documentation-privacy-note" aria-label="Documentation privacy note">
      <strong>Temporary local draft</strong>
      <p>OGCon does not save these caller details or notes. Copy the finished documentation into the approved case system, then clear the draft before the next call.</p>
    </aside>

    <section className="documentation-card" aria-labelledby="caller-details-title">
      <header>
        <div>
          <p className="eyebrow">1 · Caller details</p>
          <h3 id="caller-details-title">Who called and when?</h3>
        </div>
      </header>

      <div className="documentation-grid">
        <Field label="Caller name">
          <input value={draft.callerName} onChange={event => update('callerName', event.target.value)} autoComplete="off" />
        </Field>
        <Field label="Phone number">
          <input value={draft.phoneNumber} onChange={event => update('phoneNumber', event.target.value)} inputMode="tel" autoComplete="off" />
        </Field>
        <Field label="Date and time">
          <input type="datetime-local" value={draft.dateTime} onChange={event => update('dateTime', event.target.value)} />
        </Field>
        <Field label="Caller ref" hint="Use the approved caller/case reference when available.">
          <input value={draft.callerRef} onChange={event => update('callerRef', event.target.value)} autoComplete="off" />
        </Field>
      </div>
    </section>

    <section className="documentation-card" aria-labelledby="issue-details-title">
      <header>
        <div>
          <p className="eyebrow">2 · Device and exact issue</p>
          <h3 id="issue-details-title">Record what the caller is actually seeing</h3>
        </div>
      </header>

      <div className="documentation-grid">
        <Field label="Device / platform">
          <select value={draft.device} onChange={event => update('device', event.target.value)}>
            <option value="">Select device</option>
            {DEVICE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        </Field>
        <Field label="Device and access" hint="Example: Zoom desktop app, browser join, signed in, managed device.">
          <input value={draft.accessContext} onChange={event => update('accessContext', event.target.value)} autoComplete="off" />
        </Field>
        <Field label="Exact issue" hint="Use the caller’s observed symptom or exact error wording." wide>
          <textarea rows="4" value={draft.exactIssue} onChange={event => update('exactIssue', event.target.value)} />
        </Field>
      </div>
    </section>

    <section className="documentation-card" aria-labelledby="troubleshooting-title">
      <header>
        <div>
          <p className="eyebrow">3 · Troubleshooting and result</p>
          <h3 id="troubleshooting-title">What did we try, and what happened?</h3>
        </div>
      </header>

      <div className="documentation-grid">
        <Field label="Steps attempted + result" hint="Document completed steps and the observed result; do not list steps that were not performed." wide>
          <textarea rows="6" value={draft.stepsResult} onChange={event => update('stepsResult', event.target.value)} />
        </Field>
        <Field label="Resolution / next steps" hint="State the current status and the next action discussed with the caller." wide>
          <textarea rows="4" value={draft.resolutionNextSteps} onChange={event => update('resolutionNextSteps', event.target.value)} />
        </Field>
        <Field label="Recommended contact (if referred)" hint="Leave blank when no referral was needed.">
          <input value={draft.recommendedContact} onChange={event => update('recommendedContact', event.target.value)} autoComplete="off" />
        </Field>
      </div>
    </section>

    <section className="documentation-card" aria-labelledby="call-outcome-title">
      <header>
        <div>
          <p className="eyebrow">4 · Call outcome</p>
          <h3 id="call-outcome-title">How did the interaction end?</h3>
        </div>
      </header>

      <div className="documentation-outcomes" role="group" aria-label="Call outcome">
        {OUTCOMES.map(outcome => <button
          key={outcome}
          type="button"
          aria-pressed={draft.outcome === outcome}
          onClick={() => update('outcome', outcome)}
        >{outcome}</button>)}
      </div>
    </section>

    <section className="documentation-output" aria-labelledby="documentation-output-title">
      <div>
        <p className="eyebrow">Copy-ready handoff</p>
        <h3 id="documentation-output-title">Documentation preview</h3>
        <p>Keep this factual and concise before placing it in the approved case system.</p>
      </div>
      <pre>{formatted}</pre>
      <div className="documentation-actions">
        <button type="button" className="documentation-copy" onClick={copyDocumentation}>
          {copyState === 'copied' ? 'Copied documentation' : 'Copy documentation'}
        </button>
        <button type="button" className="documentation-clear" onClick={clearDocumentation}>Clear documentation</button>
        {copyState === 'failed' && <span role="status">Copy failed. Select the preview text manually.</span>}
      </div>
    </section>

    <footer className="documentation-source">
      <span>Approved source</span>
      <strong>{SOURCE_TITLE}</strong>
      <p>Batch 2 will add the scope / roadblock decision path. Batch 3 will add referral guidance based on the approved referral matrix.</p>
    </footer>
  </section>
}
