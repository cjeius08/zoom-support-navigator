import { useCallback, useEffect, useMemo, useState } from 'react'
import { loadAiAdminReport, reviewAiInteraction, updateAiAnswerReport } from '../../lib/aiApi'
import './aiReports.css'

const TABS = [
  ['overview', 'Overview'],
  ['interactions', 'Interaction Log'],
  ['incorrect', 'Incorrect Answers'],
  ['providers', 'Provider Usage'],
  ['behavior', 'Behavior Insights'],
]

const REVIEW_STATUSES = [
  ['correct', 'Correct'],
  ['partial', 'Partially correct'],
  ['incorrect', 'Incorrect'],
]

const REPORT_STATUSES = [
  ['new', 'New'],
  ['reviewing', 'Reviewing'],
  ['confirmed_incorrect', 'Confirmed incorrect'],
  ['confirmed_correct', 'Confirmed correct'],
  ['resolved', 'Resolved'],
  ['dismissed', 'Dismissed'],
]

const REASON_LABELS = {
  wrong_route: 'Wrong route',
  wrong_step: 'Wrong step or order',
  unsupported_answer: 'Unsupported answer',
  misunderstood_question: 'Misunderstood the issue',
  should_have_clarified: 'Should have clarified',
  outdated_source: 'Outdated source',
  incomplete_answer: 'Incomplete answer',
  hallucination: 'Made up information',
  other: 'Other',
}

function periodStart(period) {
  const now = new Date()
  if (period === 'all') return null
  if (period === 'today') {
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    return start.toISOString()
  }
  const days = period === '7d' ? 7 : 30
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
}

function percent(part, total) {
  return total ? ((part / total) * 100).toFixed(1) + '%' : '—'
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : '—'
}

function formatTokens(value) {
  return Number(value || 0).toLocaleString()
}

function profileLabel(id, profilesById) {
  const person = profilesById.get(id)
  return person?.username || person?.initials || 'Unknown user'
}

function interactionStatusLabel(status) {
  return {
    answered: 'Answered',
    clarification: 'Clarified',
    no_approved_guide: 'No approved guide',
    unavailable: 'AI unavailable',
    blocked: 'Privacy blocked',
    error: 'Error',
  }[status] || status
}

function ReviewEditor({ interaction, onSaved }) {
  const [status, setStatus] = useState(interaction.qa_review_status || 'correct')
  const [notes, setNotes] = useState(interaction.qa_review_notes || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function save(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const updated = await reviewAiInteraction(interaction.id, { status, notes })
      onSaved(updated)
      setMessage('QA review saved.')
    } catch (error) {
      setMessage(error?.message || 'Could not save QA review.')
    } finally {
      setSaving(false)
    }
  }

  return <form className="ai-review-editor" onSubmit={save}>
    <label>QA verdict
      <select value={status} onChange={event => setStatus(event.target.value)}>
        {REVIEW_STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
    </label>
    <label>Review notes
      <textarea rows={2} maxLength={6000} value={notes} onChange={event => setNotes(event.target.value)} placeholder="Why is this correct, partial, or incorrect?" />
    </label>
    <div><button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save QA review'}</button>{message && <span role="status">{message}</span>}</div>
  </form>
}

function ReportEditor({ report, onSaved }) {
  const [status, setStatus] = useState(report.status || 'new')
  const [category, setCategory] = useState(report.admin_category || report.reason || 'other')
  const [notes, setNotes] = useState(report.admin_notes || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function save(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const updated = await updateAiAnswerReport(report.id, { status, adminCategory: category, adminNotes: notes })
      onSaved(updated)
      setMessage('Review saved.')
    } catch (error) {
      setMessage(error?.message || 'Could not save report review.')
    } finally {
      setSaving(false)
    }
  }

  return <form className="ai-review-editor" onSubmit={save}>
    <div className="ai-review-grid">
      <label>Status
        <select value={status} onChange={event => setStatus(event.target.value)}>
          {REPORT_STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label>Confirmed category
        <select value={category} onChange={event => setCategory(event.target.value)}>
          {Object.entries(REASON_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
    </div>
    <label>Admin findings / action
      <textarea rows={3} maxLength={6000} value={notes} onChange={event => setNotes(event.target.value)} placeholder="What happened, likely cause, and what should be changed?" />
    </label>
    <div><button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save review'}</button>{message && <span role="status">{message}</span>}</div>
  </form>
}

function StatCard({ label, value, detail }) {
  return <article className="ai-stat-card">
    <span>{label}</span>
    <strong>{value}</strong>
    {detail && <small>{detail}</small>}
  </article>
}

export function AIReports() {
  const [tab, setTab] = useState('overview')
  const [period, setPeriod] = useState('7d')
  const [refreshKey, setRefreshKey] = useState(0)
  const [state, setState] = useState({ loading: true, data: null, error: '' })

  const loader = useCallback(() => loadAiAdminReport({ start: periodStart(period) }), [period])

  useEffect(() => {
    let live = true
    setState(current => ({ ...current, loading: true, error: '' }))
    loader()
      .then(data => live && setState({ loading: false, data, error: '' }))
      .catch(error => live && setState({ loading: false, data: null, error: error?.message || 'Could not load AI reports.' }))
    return () => { live = false }
  }, [loader, refreshKey])

  const data = state.data || { interactions: [], reports: [], profiles: [] }
  const interactions = data.interactions || []
  const reports = data.reports || []
  const profilesById = useMemo(() => new Map((data.profiles || []).map(person => [person.id, person])), [data.profiles])
  const interactionById = useMemo(() => new Map(interactions.map(item => [item.id, item])), [interactions])

  const reviewed = interactions.filter(item => item.qa_review_status)
  const reviewedCorrect = reviewed.filter(item => item.qa_review_status === 'correct').length
  const reviewedPartial = reviewed.filter(item => item.qa_review_status === 'partial').length
  const reviewedIncorrect = reviewed.filter(item => item.qa_review_status === 'incorrect').length
  const reportInteractionIds = new Set(reports.map(item => item.interaction_id))
  const fallbackInteractions = interactions.filter(item => Number(item.fallback_count || 0) > 0)
  const clarificationCount = interactions.filter(item => item.status === 'clarification').length
  const unavailableCount = interactions.filter(item => item.status === 'unavailable').length
  const blockedCount = interactions.filter(item => item.status === 'blocked').length

  const providerStats = useMemo(() => {
    const stats = new Map()
    interactions.forEach(item => {
      const current = stats.get(item.provider) || {
        provider: item.provider,
        requests: 0,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        fallbacks: 0,
        unavailable: 0,
        latencyTotal: 0,
        latencyCount: 0,
      }
      current.requests += 1
      current.inputTokens += Number(item.input_tokens || 0)
      current.outputTokens += Number(item.output_tokens || 0)
      current.totalTokens += Number(item.total_tokens || 0)
      current.fallbacks += Number(item.fallback_count || 0) > 0 ? 1 : 0
      current.unavailable += item.status === 'unavailable' ? 1 : 0
      if (Number.isFinite(Number(item.latency_ms))) {
        current.latencyTotal += Number(item.latency_ms || 0)
        current.latencyCount += 1
      }
      stats.set(item.provider, current)
    })
    return [...stats.values()].sort((a, b) => b.requests - a.requests)
  }, [interactions])

  const userStats = useMemo(() => {
    const stats = new Map()
    interactions.forEach(item => {
      const current = stats.get(item.user_id) || { userId: item.user_id, requests: 0, tokens: 0, reports: 0 }
      current.requests += 1
      current.tokens += Number(item.total_tokens || 0)
      stats.set(item.user_id, current)
    })
    reports.forEach(item => {
      const interaction = interactionById.get(item.interaction_id)
      if (!interaction) return
      const current = stats.get(interaction.user_id) || { userId: interaction.user_id, requests: 0, tokens: 0, reports: 0 }
      current.reports += 1
      stats.set(interaction.user_id, current)
    })
    return [...stats.values()].sort((a, b) => b.requests - a.requests)
  }, [interactions, reports, interactionById])

  const reasonStats = useMemo(() => {
    const counts = new Map()
    reports.forEach(report => {
      const key = report.admin_category || report.reason || 'other'
      counts.set(key, (counts.get(key) || 0) + 1)
    })
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [reports])

  function patchInteraction(updated) {
    setState(current => ({
      ...current,
      data: {
        ...current.data,
        interactions: current.data.interactions.map(item => item.id === updated.id ? { ...item, ...updated } : item),
      },
    }))
  }

  function patchReport(updated) {
    setState(current => ({
      ...current,
      data: {
        ...current.data,
        reports: current.data.reports.map(item => item.id === updated.id ? { ...item, ...updated } : item),
      },
    }))
  }

  return <section className="console-view ai-reports">
    <div className="view-heading ai-reports-heading">
      <div>
        <p className="eyebrow">Admin only</p>
        <h1>Ozzie AI Reports</h1>
        <p>Audit usage, reviewed accuracy, provider behavior, fallbacks, and reported wrong answers without treating unreported interactions as automatically correct.</p>
      </div>
      <button type="button" className="primary-action" onClick={() => setRefreshKey(value => value + 1)}>Refresh now</button>
    </div>

    <div className="ai-report-toolbar">
      <div className="ai-report-tabs" role="tablist" aria-label="AI report views">
        {TABS.map(([value, label]) => <button type="button" role="tab" aria-selected={tab === value} key={value} onClick={() => setTab(value)}>{label}</button>)}
      </div>
      <div className="ai-period-filter" aria-label="AI report period">
        {[['today', 'Today'], ['7d', '7 days'], ['30d', '30 days'], ['all', 'All']].map(([value, label]) =>
          <button type="button" key={value} aria-pressed={period === value} onClick={() => setPeriod(value)}>{label}</button>
        )}
      </div>
    </div>

    {state.loading && <p>Loading AI behavior data…</p>}
    {state.error && <p role="alert">{state.error}</p>}

    {!state.loading && !state.error && tab === 'overview' && <>
      <div className="ai-stat-grid">
        <StatCard label="AI interactions" value={interactions.length.toLocaleString()} detail="Every Ask Ozzie request, including safe fallbacks" />
        <StatCard label="Reported error rate" value={percent(reportInteractionIds.size, interactions.length)} detail={reportInteractionIds.size + ' interactions reported by users'} />
        <StatCard label="QA reviewed" value={reviewed.length.toLocaleString()} detail={reviewedCorrect + ' correct · ' + reviewedPartial + ' partial · ' + reviewedIncorrect + ' incorrect'} />
        <StatCard label="Reviewed accuracy" value={percent(reviewedCorrect, reviewed.length)} detail="Correct ÷ QA-reviewed sample only" />
        <StatCard label="Clarification rate" value={percent(clarificationCount, interactions.length)} detail={clarificationCount + ' asked for one more detail'} />
        <StatCard label="Provider fallback rate" value={percent(fallbackInteractions.length, interactions.length)} detail={fallbackInteractions.length + ' requests switched provider'} />
        <StatCard label="AI unavailable" value={unavailableCount.toLocaleString()} detail="Smart Search remained available" />
        <StatCard label="Privacy blocked" value={blockedCount.toLocaleString()} detail="Sensitive values were not sent to an AI provider" />
      </div>
      <aside className="ai-accuracy-note">
        <strong>How to read accuracy:</strong> Reported error rate is not the same as accuracy. An answer that was never reported is not automatically counted as correct. Use QA Review in the Interaction Log to build a reviewed sample.
      </aside>
      <section className="ai-report-section">
        <h2>Top AI users</h2>
        <div className="ai-compact-list">
          {userStats.slice(0, 10).map(user => <article key={user.userId}>
            <strong>{profileLabel(user.userId, profilesById)}</strong>
            <span>{user.requests} requests</span>
            <span>{formatTokens(user.tokens)} tokens</span>
            <span>{user.reports} reported answers</span>
          </article>)}
          {!userStats.length && <p>No AI usage in this period.</p>}
        </div>
      </section>
    </>}

    {!state.loading && !state.error && tab === 'interactions' && <section className="ai-report-section">
      <div className="ai-section-heading"><div><h2>Interaction Log</h2><p>Stored questions are redacted before they reach this report.</p></div><span>{interactions.length}</span></div>
      <div className="ai-interaction-list">
        {interactions.map(item => <details key={item.id} className="ai-log-card">
          <summary>
            <span><strong>{interactionStatusLabel(item.status)}</strong><small>{profileLabel(item.user_id, profilesById)} · {formatDate(item.created_at)}</small></span>
            <span><b>{item.provider}</b><small>{item.model || 'No model'}</small></span>
            <span><b>{formatTokens(item.total_tokens)}</b><small>tokens</small></span>
            <span><b>{typeof item.confidence === 'number' ? Math.round(item.confidence * 100) + '%' : '—'}</b><small>system confidence</small></span>
          </summary>
          <div className="ai-log-detail">
            <dl>
              <div><dt>Redacted question</dt><dd>{item.redacted_question}</dd></div>
              <div><dt>AI answer</dt><dd>{item.ai_answer || '—'}</dd></div>
              <div><dt>Route</dt><dd>{item.route_id || '—'}</dd></div>
              <div><dt>Sources</dt><dd>{item.source_ids?.length ? item.source_ids.join(', ') : '—'}</dd></div>
              <div><dt>Provider / model</dt><dd>{item.provider} · {item.model || '—'}</dd></div>
              <div><dt>Input / output tokens</dt><dd>{formatTokens(item.input_tokens)} / {formatTokens(item.output_tokens)}</dd></div>
              <div><dt>Fallback path</dt><dd>{item.fallback_path?.length ? item.fallback_path.join(' → ') : 'None'}</dd></div>
              <div><dt>Latency</dt><dd>{item.latency_ms != null ? item.latency_ms + ' ms' : '—'}</dd></div>
              <div><dt>Error / fallback detail</dt><dd>{item.error_code || '—'}</dd></div>
            </dl>
            <ReviewEditor interaction={item} onSaved={patchInteraction} />
          </div>
        </details>)}
        {!interactions.length && <p>No AI interactions in this period.</p>}
      </div>
    </section>}

    {!state.loading && !state.error && tab === 'incorrect' && <section className="ai-report-section">
      <div className="ai-section-heading"><div><h2>Incorrect Answers / Reports</h2><p>Review what the user asked, what AI answered, the provider involved, and the final investigation outcome.</p></div><span>{reports.length}</span></div>
      <div className="ai-interaction-list">
        {reports.map(report => {
          const interaction = interactionById.get(report.interaction_id)
          return <details key={report.id} className="ai-log-card ai-report-card">
            <summary>
              <span><strong>{REASON_LABELS[report.reason] || report.reason}</strong><small>Reported by {profileLabel(report.reporter_user_id, profilesById)} · {formatDate(report.created_at)}</small></span>
              <span><b>{report.status.replaceAll('_', ' ')}</b><small>review status</small></span>
              <span><b>{interaction?.provider || '—'}</b><small>{interaction?.model || 'provider/model'}</small></span>
            </summary>
            <div className="ai-log-detail">
              <dl>
                <div><dt>Redacted question</dt><dd>{interaction?.redacted_question || 'Interaction not in selected period.'}</dd></div>
                <div><dt>AI answer</dt><dd>{interaction?.ai_answer || '—'}</dd></div>
                <div><dt>Route / sources</dt><dd>{interaction ? [interaction.route_id, ...(interaction.source_ids || [])].filter(Boolean).join(', ') || '—' : '—'}</dd></div>
                <div><dt>System confidence</dt><dd>{typeof interaction?.confidence === 'number' ? Math.round(interaction.confidence * 100) + '%' : '—'}</dd></div>
                <div><dt>User details</dt><dd>{report.details || 'No additional detail supplied.'}</dd></div>
                <div><dt>Fallback path</dt><dd>{interaction?.fallback_path?.length ? interaction.fallback_path.join(' → ') : 'None'}</dd></div>
              </dl>
              <ReportEditor report={report} onSaved={patchReport} />
            </div>
          </details>
        })}
        {!reports.length && <p>No AI answer reports in this period.</p>}
      </div>
    </section>}

    {!state.loading && !state.error && tab === 'providers' && <section className="ai-report-section">
      <div className="ai-section-heading"><div><h2>Provider Usage</h2><p>Tracked provider usage and fallback behavior. Provider dashboards remain authoritative for exact free-tier quota remaining.</p></div></div>
      <div className="ai-provider-grid">
        {providerStats.map(item => <article key={item.provider}>
          <header><strong>{item.provider}</strong><span>{item.requests} requests</span></header>
          <dl>
            <div><dt>Input tokens</dt><dd>{formatTokens(item.inputTokens)}</dd></div>
            <div><dt>Output tokens</dt><dd>{formatTokens(item.outputTokens)}</dd></div>
            <div><dt>Total tokens</dt><dd>{formatTokens(item.totalTokens)}</dd></div>
            <div><dt>Requests using fallback</dt><dd>{item.fallbacks}</dd></div>
            <div><dt>Unavailable</dt><dd>{item.unavailable}</dd></div>
            <div><dt>Avg. latency</dt><dd>{item.latencyCount ? Math.round(item.latencyTotal / item.latencyCount) + ' ms' : '—'}</dd></div>
          </dl>
        </article>)}
        {!providerStats.length && <p>No provider usage in this period.</p>}
      </div>
      <aside className="ai-quota-reference">
        <strong>Free-tier reference for this pilot design</strong>
        <p>Groq quotas vary by selected model/account; Cloudflare uses Neurons rather than raw tokens; OpenRouter free routing can have request-based limits. Ozzie records actual requests, tokens, and fallbacks, but it does not guess an exact remaining balance when a provider does not expose a comparable quota value.</p>
      </aside>
    </section>}

    {!state.loading && !state.error && tab === 'behavior' && <section className="ai-report-section">
      <div className="ai-stat-grid compact">
        <StatCard label="Clarifications" value={clarificationCount} detail={percent(clarificationCount, interactions.length)} />
        <StatCard label="Reported answers" value={reports.length} detail={percent(reportInteractionIds.size, interactions.length)} />
        <StatCard label="Fallbacks" value={fallbackInteractions.length} detail={percent(fallbackInteractions.length, interactions.length)} />
        <StatCard label="No AI available" value={unavailableCount} detail={percent(unavailableCount, interactions.length)} />
      </div>
      <div className="ai-behavior-grid">
        <article>
          <h2>Most common reported problems</h2>
          {reasonStats.map(([reason, count]) => <div className="ai-behavior-row" key={reason}><span>{REASON_LABELS[reason] || reason}</span><strong>{count}</strong></div>)}
          {!reasonStats.length && <p>No reported AI problems in this period.</p>}
        </article>
        <article>
          <h2>Who uses AI most</h2>
          {userStats.slice(0, 10).map(user => <div className="ai-behavior-row" key={user.userId}><span>{profileLabel(user.userId, profilesById)}</span><strong>{user.requests}</strong></div>)}
          {!userStats.length && <p>No AI usage in this period.</p>}
        </article>
        <article>
          <h2>What to watch</h2>
          <p>High clarification rates can mean prompts are too vague or route labels overlap. Repeated wrong-route reports can point to Smart Search taxonomy problems. Unsupported-answer or hallucination reports should be treated as source-grounding defects and reviewed first.</p>
        </article>
      </div>
    </section>}
  </section>
}
