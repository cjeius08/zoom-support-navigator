import { useEffect, useMemo, useState } from 'react'
import {
  checkReadinessAnswer,
  loadReadinessState,
  startOrResumeReadinessAttempt,
  submitReadinessAttempt,
} from '../../lib/readinessApi'
import { READINESS_PARTS } from './readinessLabData'

const ACTIVE_PART_ID = 'general-zoom-scenarios'

function PartRail({ activePartId, onSelect }) {
  return <div className="readiness-part-rail" role="tablist" aria-label="Readiness Lab parts">
    {READINESS_PARTS.map(part => {
      const available = part.status === 'available'
      return <button
        key={part.id}
        type="button"
        role="tab"
        aria-selected={activePartId === part.id}
        disabled={!available}
        onClick={() => available && onSelect(part.id)}
      >
        <span>{part.number}</span>
        <div>
          <strong>{part.shortTitle}</strong>
          <small>{available ? 'Available now' : 'Coming next'}</small>
        </div>
      </button>
    })}
  </div>
}

function ResultBadge({ answer }) {
  if (!answer) return null
  return <span className={answer.isCorrect ? 'readiness-result readiness-result-correct' : 'readiness-result readiness-result-review'}>
    {answer.isCorrect ? 'Correct' : 'Review this'}
  </span>
}

function AttemptHistory({ attempts = [], maxAttempts = 3 }) {
  return <section className="readiness-attempt-history" aria-labelledby="readiness-attempt-history-title">
    <div>
      <strong id="readiness-attempt-history-title">Attempt history</strong>
      <span>{attempts.length}/{maxAttempts} attempts started</span>
    </div>
    <ol>
      {Array.from({ length: maxAttempts }, (_, index) => {
        const number = index + 1
        const attempt = attempts.find(item => item.attemptNumber === number)
        return <li key={number} className={attempt ? 'recorded' : ''}>
          <span>{number}</span>
          <div>
            <strong>Attempt {number}</strong>
            <small>{!attempt
              ? 'Not started'
              : attempt.status === 'submitted'
                ? `Submitted · ${attempt.score}/${attempt.totalQuestions}`
                : `In progress · ${attempt.checkedCount}/${attempt.totalQuestions} checked`}</small>
          </div>
        </li>
      })}
    </ol>
  </section>
}

export function ReadinessLab({
  open = false,
  minimized = false,
  onMinimize = () => {},
  onClose = () => {},
  onOpenResource = () => {},
}) {
  const [activePartId, setActivePartId] = useState(ACTIVE_PART_ID)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [state, setState] = useState(null)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  async function refreshState({ startFirstIfEmpty = false } = {}) {
    const next = await loadReadinessState()
    if (startFirstIfEmpty && !next.activeAttempt && (next.attempts || []).length === 0) {
      return startOrResumeReadinessAttempt()
    }
    return next
  }

  useEffect(() => {
    if (!open) return undefined
    let live = true
    setLoading(true)
    setError('')
    refreshState({ startFirstIfEmpty: true })
      .then(next => {
        if (!live) return
        setState(next)
        setSelectedAnswers({})
      })
      .catch(loadError => {
        if (live) setError(loadError?.message || 'Could not load Readiness Lab.')
      })
      .finally(() => {
        if (live) setLoading(false)
      })
    return () => {
      live = false
    }
  }, [open])

  const activePart = READINESS_PARTS.find(part => part.id === activePartId) ?? READINESS_PARTS[0]
  const questions = activePartId === ACTIVE_PART_ID ? state?.questions || [] : []
  const question = questions[questionIndex] ?? questions[0]
  const activeAttempt = state?.activeAttempt || null
  const attempts = state?.attempts || []
  const maxAttempts = state?.maxAttempts || 3
  const checkedAnswers = useMemo(
    () => activeAttempt?.answers || [],
    [activeAttempt?.answers],
  )
  const answerByQuestion = useMemo(
    () => new Map(checkedAnswers.map(answer => [answer.questionId, answer])),
    [checkedAnswers],
  )
  const completedCount = checkedAnswers.length
  const allChecked = questions.length > 0 && completedCount === questions.length
  const latestSubmitted = [...attempts].reverse().find(attempt => attempt.status === 'submitted') || null
  const nextAttemptNumber = attempts.length + 1
  const canStartNext = !activeAttempt && attempts.length > 0 && attempts.length < maxAttempts
  const attemptsExhausted = !activeAttempt && attempts.length >= maxAttempts

  async function selectAnswer(optionId) {
    if (!question || answerByQuestion.has(question.id) || busy) return
    setSelectedAnswers(current => ({ ...current, [question.id]: optionId }))
  }

  async function checkAnswer() {
    if (!question || !activeAttempt || busy) return
    const selectedOptionId = selectedAnswers[question.id]
    if (!selectedOptionId || answerByQuestion.has(question.id)) return

    setBusy('check')
    setError('')
    try {
      await checkReadinessAnswer({
        attemptId: activeAttempt.id,
        questionId: question.id,
        selectedOptionId,
      })
      const next = await refreshState()
      setState(next)
    } catch (checkError) {
      setError(checkError?.message || 'Could not save this answer.')
    } finally {
      setBusy('')
    }
  }

  async function submitAttempt() {
    if (!activeAttempt || !allChecked || busy) return
    setBusy('submit')
    setError('')
    try {
      await submitReadinessAttempt(activeAttempt.id)
      const next = await refreshState()
      setState(next)
      setSelectedAnswers({})
      setQuestionIndex(0)
    } catch (submitError) {
      setError(submitError?.message || 'Could not submit this attempt.')
    } finally {
      setBusy('')
    }
  }

  async function startNextAttempt() {
    if (!canStartNext || busy) return
    setBusy('start')
    setError('')
    try {
      const next = await startOrResumeReadinessAttempt()
      setState(next)
      setSelectedAnswers({})
      setQuestionIndex(0)
    } catch (startError) {
      setError(startError?.message || 'Could not start the next attempt.')
    } finally {
      setBusy('')
    }
  }

  if (!open) return null

  if (minimized) {
    return <aside className="documentation-dock documentation-dock-minimized readiness-lab-minimized" aria-label="Readiness Lab minimized">
      <button type="button" className="documentation-dock-restore" aria-label="Restore Readiness Lab" onClick={onMinimize}>
        <span>
          <strong>Readiness Lab</strong>
          <small>{activeAttempt
            ? `Attempt ${activeAttempt.attemptNumber} · ${completedCount}/${activeAttempt.totalQuestions} checked`
            : latestSubmitted
              ? `Attempt ${latestSubmitted.attemptNumber} submitted · ${latestSubmitted.score}/${latestSubmitted.totalQuestions}`
              : 'Loading readiness state…'}</small>
        </span>
        <span aria-hidden="true">▣</span>
      </button>
      <button type="button" className="documentation-dock-close" aria-label="Close Readiness Lab" onClick={onClose}>×</button>
    </aside>
  }

  const checkedAnswer = question ? answerByQuestion.get(question.id) : null
  const selectedOptionId = checkedAnswer?.selectedOptionId || (question ? selectedAnswers[question.id] : null)

  return <aside className="documentation-dock readiness-lab-dock" aria-labelledby="readiness-lab-title">
    <header className="documentation-dock-header">
      <div>
        <span className="documentation-dock-kicker">Phase 6 · Readiness validation</span>
        <h2 id="readiness-lab-title">Readiness Lab</h2>
      </div>
      <div className="documentation-dock-window-actions">
        <button type="button" aria-label="Minimize Readiness Lab" title="Minimize" onClick={onMinimize}>—</button>
        <button type="button" aria-label="Close Readiness Lab" title="Close" onClick={onClose}>×</button>
      </div>
    </header>

    <div className="documentation-dock-body readiness-lab-body">
      <aside className="readiness-open-book">
        <strong>Open-book by design · answers are server-locked</strong>
        <span>Use Find in Workspace whenever you need it. Once you press Check answer, that choice is permanently recorded for the current attempt. Closing, refreshing, or reopening cannot erase it.</span>
      </aside>

      {loading && <p className="readiness-loading" role="status">Loading your saved readiness attempt…</p>}
      {error && <p className="readiness-error" role="alert">{error}</p>}

      {!loading && state && <>
        <div className="readiness-progress" aria-label="Readiness Lab progress">
          <div>
            <span>{activeAttempt ? `Attempt ${activeAttempt.attemptNumber} progress` : 'Current status'}</span>
            <strong>{activeAttempt
              ? `${completedCount}/${activeAttempt.totalQuestions} checked`
              : attemptsExhausted
                ? '3 attempts completed'
                : latestSubmitted
                  ? `Attempt ${latestSubmitted.attemptNumber} submitted`
                  : 'Ready to start'}</strong>
          </div>
          <div className="readiness-progress-track" aria-hidden="true">
            <i style={{ width: activeAttempt ? `${(completedCount / activeAttempt.totalQuestions) * 100}%` : latestSubmitted ? '100%' : '0%' }} />
          </div>
        </div>

        <PartRail activePartId={activePartId} onSelect={(partId) => {
          setActivePartId(partId)
          setQuestionIndex(0)
        }} />

        <section className="readiness-part-summary" aria-labelledby="readiness-part-title">
          <div>
            <span>Part {activePart.number} of {READINESS_PARTS.length}</span>
            <h3 id="readiness-part-title">{activePart.title}</h3>
          </div>
          <p>{activePart.purpose}</p>
        </section>

        {activeAttempt && question && <section className="readiness-question" aria-labelledby="readiness-question-title">
          <header>
            <div>
              <span>{question.type}</span>
              <small>Question {questionIndex + 1} of {questions.length}</small>
            </div>
            <ResultBadge answer={checkedAnswer} />
          </header>

          <h3 id="readiness-question-title">{question.prompt}</h3>

          <div className="readiness-answer-options" role="radiogroup" aria-label="Answer choices">
            {question.options.map(option => {
              const isSelected = selectedOptionId === option.id
              const isCorrectChoice = checkedAnswer?.correctOptionId === option.id
              return <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={Boolean(checkedAnswer) || Boolean(busy)}
                className={checkedAnswer
                  ? isCorrectChoice
                    ? 'answer-correct'
                    : isSelected
                      ? 'answer-incorrect'
                      : ''
                  : ''}
                onClick={() => selectAnswer(option.id)}
              >
                <span>{option.id.toUpperCase()}</span>
                <p>{option.text}</p>
              </button>
            })}
          </div>

          <div className="readiness-find-card">
            <div>
              <span>Find it in the workspace</span>
              <strong>{question.locationLabel}</strong>
              <small>The active attempt stays saved while you look.</small>
            </div>
            <button type="button" onClick={() => onOpenResource(question.resourceTarget)}>Find in Workspace</button>
          </div>

          {!checkedAnswer
            ? <button
                type="button"
                className="readiness-check-answer"
                disabled={!selectedOptionId || Boolean(busy)}
                onClick={checkAnswer}
              >{busy === 'check' ? 'Saving answer…' : 'Check answer'}</button>
            : <section className={checkedAnswer.isCorrect ? 'readiness-feedback readiness-feedback-correct' : 'readiness-feedback readiness-feedback-review'} aria-live="polite">
                <strong>{checkedAnswer.isCorrect ? 'Good judgment.' : 'Review this before moving on.'}</strong>
                <p>{checkedAnswer.explanation}</p>
                <small>Source: {question.source}</small>
              </section>}

          <footer className="readiness-question-nav">
            <button
              type="button"
              disabled={questionIndex === 0 || Boolean(busy)}
              onClick={() => setQuestionIndex(index => Math.max(0, index - 1))}
            >Previous</button>
            <span>{questionIndex + 1} / {questions.length}</span>
            <button
              type="button"
              disabled={questionIndex === questions.length - 1 || Boolean(busy)}
              onClick={() => setQuestionIndex(index => Math.min(questions.length - 1, index + 1))}
            >Next</button>
          </footer>
        </section>}

        {activeAttempt && <section className="readiness-attempt-actions">
          <button
            type="button"
            className="readiness-reset-disabled"
            disabled
            aria-describedby="readiness-reset-rule"
          >Reset / New Attempt</button>
          <small id="readiness-reset-rule">Locked while Attempt {activeAttempt.attemptNumber} is incomplete or not yet submitted. Finish all {activeAttempt.totalQuestions} questions and submit first.</small>

          {allChecked && <button
            type="button"
            className="readiness-submit-attempt"
            disabled={Boolean(busy)}
            onClick={submitAttempt}
          >{busy === 'submit' ? 'Submitting attempt…' : `Submit Attempt ${activeAttempt.attemptNumber}`}</button>}
        </section>}

        {!activeAttempt && latestSubmitted && <section className="readiness-part-result" aria-live="polite">
          <span>Attempt {latestSubmitted.attemptNumber} recorded</span>
          <h3>{latestSubmitted.score}/{latestSubmitted.totalQuestions} final score</h3>
          <p>This score and its incorrect answers are permanently recorded in Readiness Lab reporting. Starting another attempt will not overwrite it.</p>
          {canStartNext
            ? <button type="button" disabled={Boolean(busy)} onClick={startNextAttempt}>
                {busy === 'start' ? 'Starting…' : `Start Attempt ${nextAttemptNumber}`}
              </button>
            : <button type="button" disabled>{attemptsExhausted ? '3 attempts used' : 'Next attempt unavailable'}</button>}
        </section>}

        <AttemptHistory attempts={attempts} maxAttempts={maxAttempts} />

        <aside className="readiness-next-parts">
          <strong>Five-part readiness path</strong>
          <ol>
            {READINESS_PARTS.map(part => <li key={part.id}>
              <span>{part.number}</span>
              <div>
                <strong>{part.title}</strong>
                <small>{part.status === 'available' ? '5 general Zoom scenarios available now' : part.purpose}</small>
              </div>
            </li>)}
          </ol>
        </aside>
      </>}
    </div>
  </aside>
}
