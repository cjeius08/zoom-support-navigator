import { useEffect, useMemo, useState } from 'react'
import { askOzzieAi, logBlockedAiRequest, reportAiAnswer } from '../../lib/aiApi'
import { sanitizeAiText } from '../../lib/aiPrivacy'
import { buildApprovedAiSources } from './aiCandidateSearch'
import './ozzieAiAssist.css'

const REPORT_REASONS = [
  ['wrong_route', 'Wrong route'],
  ['wrong_step', 'Wrong step or order'],
  ['unsupported_answer', 'Unsupported answer'],
  ['misunderstood_question', 'Misunderstood the issue'],
  ['should_have_clarified', 'Should have asked a question'],
  ['outdated_source', 'Outdated source'],
  ['incomplete_answer', 'Incomplete answer'],
  ['hallucination', 'Made up information'],
  ['other', 'Other'],
]

function toRouteCandidate(route) {
  return {
    kind: 'common_issue',
    id: route.id,
    title: route.title,
    subtitle: route.subtitle,
    category: route.categoryId,
    classification: route.classification,
    confirm: (route.confirm || []).slice(0, 4),
    checks: (route.checks || []).slice(0, 5).map(check => ({
      title: check.title,
      instruction: check.instruction,
      expected: check.expected,
    })),
    matchTerms: (route.searchPhrases || []).slice(0, 12),
  }
}

function toProcessCandidate(process) {
  return {
    kind: 'process',
    id: process.id,
    title: process.title,
    purpose: process.purpose,
    category: process.category,
    steps: (process.steps || []).slice(0, 8),
    matchTerms: [process.title, process.keywords].filter(Boolean),
  }
}

function confidenceLabel(value) {
  if (typeof value !== 'number') return ''
  if (value >= 0.82) return 'Strong match'
  if (value >= 0.65) return 'Good match'
  return 'Needs more detail'
}

export function OzzieAiAssist({
  query,
  routeMatches = [],
  processMatches = [],
  callContext = {},
  onOpenRoute = () => {},
  onOpenProcess = () => {},
  onTrackEvent,
}) {
  const [state, setState] = useState({ loading: false, result: null, error: '' })
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('wrong_route')
  const [reportDetails, setReportDetails] = useState('')
  const [reportState, setReportState] = useState({ saving: false, sent: false, error: '' })

  const approvedSources = useMemo(
    () => buildApprovedAiSources(query, routeMatches, processMatches),
    [query, routeMatches, processMatches],
  )

  const candidates = useMemo(() => [
    ...approvedSources.routes.map(toRouteCandidate),
    ...approvedSources.processes.map(toProcessCandidate),
  ].slice(0, 8), [approvedSources])

  useEffect(() => {
    setState({ loading: false, result: null, error: '' })
    setReportOpen(false)
    setReportState({ saving: false, sent: false, error: '' })
  }, [query])

  const selectedCandidate = state.result?.routeId
    ? candidates.find(candidate => candidate.id === state.result.routeId)
    : null

  async function askOzzie() {
    const privacy = sanitizeAiText(query)
    setReportOpen(false)
    setReportState({ saving: false, sent: false, error: '' })

    if (!query.trim()) return
    if (privacy.blocked) {
      const interactionId = await logBlockedAiRequest(privacy.reason)
      setState({
        loading: false,
        error: '',
        result: {
          status: 'blocked',
          interactionId,
          message: 'Remove the sensitive value and describe only the support issue. Ozzie AI does not need passwords, full payment card numbers, or government IDs.',
        },
      })
      return
    }

    setState({ loading: true, result: null, error: '' })
    onTrackEvent?.({ eventType: 'tool_open', routeId: 'navigator', toolId: 'ozzie_ai_ask' })

    try {
      const result = await askOzzieAi({
        question: privacy.safeText,
        feature: 'ask_ozzie',
        candidates,
        context: {
          active_device: callContext.device || null,
          active_caller_role: callContext.role || null,
          call_status: callContext.status || null,
        },
      })
      setState({ loading: false, result, error: '' })
    } catch (error) {
      setState({
        loading: false,
        result: null,
        error: error?.message || 'Ozzie AI could not answer right now. Smart Search is still available.',
      })
    }
  }

  function openRecommended() {
    if (!selectedCandidate) return
    if (selectedCandidate.kind === 'common_issue') {
      const route = approvedSources.routes.find(item => item.id === selectedCandidate.id)
      if (route) onOpenRoute(route)
    } else {
      const process = approvedSources.processes.find(item => item.id === selectedCandidate.id)
      if (process) onOpenProcess(process)
    }
  }

  async function submitReport(event) {
    event.preventDefault()
    if (!state.result?.interactionId || reportState.saving) return
    setReportState({ saving: true, sent: false, error: '' })
    try {
      await reportAiAnswer({
        interactionId: state.result.interactionId,
        reason: reportReason,
        details: reportDetails,
      })
      setReportState({ saving: false, sent: true, error: '' })
      setReportOpen(false)
      onTrackEvent?.({ eventType: 'tool_open', routeId: 'navigator', toolId: 'ozzie_ai_answer_reported' })
    } catch (error) {
      setReportState({ saving: false, sent: false, error: error?.message || 'Could not submit the AI answer report.' })
    }
  }

  const result = state.result

  return <section className="ozzie-ai-assist" aria-label="Ozzie AI Assist">
    <div className="ozzie-ai-launch">
      <div>
        <span className="ozzie-ai-badge" aria-hidden="true">AI</span>
        <span>
          <strong>Need help interpreting the issue?</strong>
          <small>Ask Ozzie to interpret the same text — shorthand, typos, and natural descriptions are okay.</small>
        </span>
      </div>
      <button type="button" onClick={askOzzie} disabled={!query.trim() || state.loading}>
        {state.loading ? 'Checking…' : 'Ask Ozzie'}
      </button>
    </div>

    <p className="ozzie-ai-privacy-note">Smart Search stays active without AI. Ozzie AI is only called when you choose Ask Ozzie. Do not enter passwords, full card numbers, or government IDs.</p>

    {state.error && <div className="ozzie-ai-message is-warning" role="alert">{state.error}</div>}

    {result && <article className={`ozzie-ai-result is-${result.status}`} aria-live="polite">
      <header>
        <div>
          <p className="eyebrow">Ozzie AI Assist</p>
          <h3>
            {result.status === 'answered' ? 'Suggested next step'
              : result.status === 'clarification' ? 'One detail needed'
                : result.status === 'blocked' ? 'Sensitive information blocked'
                  : result.status === 'no_approved_guide' ? 'No approved match yet'
                    : 'AI unavailable — Smart Search still works'}
          </h3>
        </div>
        {typeof result.confidence === 'number' && <span className="ozzie-ai-confidence">{confidenceLabel(result.confidence)}</span>}
      </header>

      {result.status === 'answered' && <>
        <p className="ozzie-ai-answer">{result.answer}</p>
        {result.reason && <p className="ozzie-ai-reason"><strong>Why:</strong> {result.reason}</p>}
        {selectedCandidate && <div className="ozzie-ai-source">
          <span>Based on approved Ozzie content</span>
          <strong>{selectedCandidate.title}</strong>
        </div>}
        <div className="ozzie-ai-actions">
          {selectedCandidate && <button type="button" onClick={openRecommended}>Open approved guide →</button>}
          {result.interactionId && !reportState.sent && <button type="button" className="secondary" onClick={() => setReportOpen(value => !value)}>Report answer</button>}
          {reportState.sent && <span role="status">Reported for review ✓</span>}
        </div>
      </>}

      {result.status === 'clarification' && <p className="ozzie-ai-answer">{result.clarificationQuestion}</p>}
      {result.status === 'blocked' && <p>{result.message}</p>}
      {result.status === 'no_approved_guide' && <p>{result.message || 'I could not find an approved Ozzie guide that supports an answer yet. Use the Smart Search results or escalate through the approved process.'}</p>}
      {result.status === 'unavailable' && <p>{result.message}</p>}

      {reportOpen && <form className="ozzie-ai-report-form" onSubmit={submitReport}>
        <label>
          What was wrong?
          <select value={reportReason} onChange={event => setReportReason(event.target.value)}>
            {REPORT_REASONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label>
          Details <span>(optional)</span>
          <textarea value={reportDetails} maxLength={4000} rows={3} onChange={event => setReportDetails(event.target.value)} placeholder="What should Ozzie have done instead?" />
        </label>
        {reportState.error && <p role="alert">{reportState.error}</p>}
        <div className="ozzie-ai-report-actions">
          <button type="button" className="secondary" onClick={() => setReportOpen(false)} disabled={reportState.saving}>Cancel</button>
          <button type="submit" disabled={reportState.saving}>{reportState.saving ? 'Sending…' : 'Send report'}</button>
        </div>
      </form>}
    </article>}
  </section>
}
