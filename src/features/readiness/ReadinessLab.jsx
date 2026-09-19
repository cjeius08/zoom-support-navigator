import { useEffect, useMemo, useState } from 'react'
import { READINESS_PARTS } from './readinessLabData'
import {
  checkReadinessAnswer,
  getReadinessState,
  startOrResumeReadiness,
  submitReadinessAttempt,
} from '../../lib/readinessApi'

const ACTIVE_PART_ID = 'foundation-call-flow'

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

function findResumeIndex(questions, answers = []) {
  const checked = new Set(answers.map(answer => answer.questionId))
  const firstOpen = questions.findIndex(question => !checked.has(question.id))
  return firstOpen >= 0 ? firstOpen : Math.max(0, questions.length - 1)
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
  const [selections, setSelections] = useState({})
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const activePart = READINESS_PARTS.find(part => part.id === activePartId) ?? READINESS_PARTS[0]
  const questions = state?.questions || []
  const activeAttempt = state?.activeAttempt || null
  const attempts = state?.attempts || []
  const maxAttempts = state?.maxAttempts || 3
  const lastAttempt = attempts.length ? attempts[attempts.length - 1] : null
  const question = questions[questionIndex] ?? questions[0]
  const answersByQuestion = useMemo(
    () => new Map((activeAttempt?.answers || []).map(answer => [answer.questionId, answer])),
    [activeAttempt?.answers],
  )
  const answer = question ? answersByQuestion.get(question.id) : null
  const selectedOptionId = answer?.selectedOptionId || (question ? selections[question.id] : null)
  const completedCount = activeAttempt?.answers?.length || 0
  const remainingCount = Math.max(questions.length - completedCount, 0)
  const attemptComplete = Boolean(activeAttempt && questions.length > 0 && completedCount === questions.length)
  const submittedCount = attempts.filter(item => item.status === 'submitted').length
  const exhausted = submittedCount >= maxAttempts && !activeAttempt

  useEffect(() => {
    if (!open || !activePart.questionSetVersion) return undefined
    let live = true

    async function load() {
      setLoading(true)
      setError('')
      setState(null)
      try {
        let next = await getReadinessState(activePart.questionSetVersion)
        if (!next?.activeAttempt && (next?.attempts?.length || 0) === 0) {
          next = await startOrResumeReadiness(activePart.questionSetVersion)
        }
        if (!live) return
        setState(next)
        setSelections({})
        if (next?.activeAttempt) {
          setQuestionIndex(findResumeIndex(next.questions || [], next.activeAttempt.answers || []))
        } else {
          setQuestionIndex(0)
        }
      } catch (loadError) {
        if (live) setError(loadError?.message || 'Could not load Readiness Lab.')
      } finally {
        if (live) setLoading(false)
      }
    }

    load()
    return () => { live = false }
  }, [open, activePart.questionSetVersion])

  function selectAnswer(optionId) {
    if (!question || answer || busy) return
    setSelections(current => ({ ...current, [question.id]: optionId }))
  }

  async function checkAnswer() {
    if (!question || !activeAttempt || !selectedOptionId || answer || busy) return
    setBusy(true)
    setError('')
    try {
      await checkReadinessAnswer({
        attemptId: activeAttempt.id,
        questionId: question.id,
        selectedOptionId,
      })
      const next = await getReadinessState(activePart.questionSetVersion)
      setState(next)
    } catch (checkError) {
      setError(checkError?.message || 'Could not save this answer.')
    } finally {
      setBusy(false)
    }
  }

  async function submitAttempt() {
    if (!activeAttempt || !attemptComplete || busy) return
    setBusy(true)
    setError('')
    try {
      await submitReadinessAttempt(activeAttempt.id)
      const next = await getReadinessState(activePart.questionSetVersion)
      setState(next)
      setSelections({})
    } catch (submitError) {
      setError(submitError?.message || 'Could not submit this attempt.')
    } finally {
      setBusy(false)
    }
  }

  async function startNextAttempt() {
    if (activeAttempt || exhausted || busy) return
    setBusy(true)
    setError('')
    try {
      const next = await startOrResumeReadiness(activePart.questionSetVersion)
      setState(next)
      setSelections({})
      setQuestionIndex(findResumeIndex(next?.questions || [], next?.activeAttempt?.answers || []))
    } catch (startError) {
      setError(startError?.message || 'Could not start the next attempt.')
    } finally {
      setBusy(false)
    }
  }

  if (!open) return null

  if (minimized) {
    const miniStatus = activeAttempt
      ? `Attempt ${activeAttempt.attemptNumber} · ${completedCount}/${questions.length || 5} checked`
      : lastAttempt?.status === 'submitted'
        ? `Attempt ${lastAttempt.attemptNumber} complete · ${lastAttempt.score}/${lastAttempt.totalQuestions}`
        : 'Ready'
    return <aside style={{ '--tool-stack-offset': `${Math.max(0, stackIndex) * 4.25}rem` }} className="documentation-dock documentation-dock-minimized readiness-lab-minimized" aria-label="Readiness Lab minimized">
      <button type="button" className="documentation-dock-restore" aria-label="Restore Readiness Lab" onClick={onMinimize}>
        <span>
          <strong>Readiness Lab</strong>
          <small>{miniStatus}</small>
        </span>
        <span aria-hidden="true">▣</span>
      </button>
      <button type="button" className="documentation-dock-close" aria-label="Close Readiness Lab" onClick={onClose}>×</button>
    </aside>
  }

  return <aside className="documentation-dock readiness-lab-dock" aria-labelledby="readiness-lab-title">
    <header className="documentation-dock-header">
      <div>
        <span className="documentation-dock-kicker">Readiness validation</span>
        <h2 id="readiness-lab-title">Readiness Lab</h2>
      </div>
      <div className="documentation-dock-window-actions">
        <button type="button" aria-label="Minimize Readiness Lab" title="Minimize" onClick={onMinimize}>—</button>
        <button type="button" aria-label="Close Readiness Lab" title="Close" onClick={onClose}>×</button>
      </div>
    </header>

    <div className="documentation-dock-body readiness-lab-body">
      <aside className="readiness-open-book">
        <strong>Open-book by design</strong>
        <span>Each available readiness part uses five source-backed questions. Every part keeps its own attempt history, up to three attempts, and closing the lab does not erase unfinished progress.</span>
      </aside>

      {error && <p role="alert">{error}</p>}
      {loading && <p role="status">Loading saved readiness progress…</p>}

      {!loading && state && <>
        <div className="readiness-progress" aria-label="Readiness Lab progress">
          <div>
            <span>{activeAttempt ? `Attempt ${activeAttempt.attemptNumber} of ${maxAttempts}` : `${submittedCount} of ${maxAttempts} attempts submitted`}</span>
            <strong>{activeAttempt ? `${completedCount}/${questions.length} checked · ${remainingCount} remaining` : lastAttempt?.status === 'submitted' ? `Latest score ${lastAttempt.score}/${lastAttempt.totalQuestions}` : 'Ready'}</strong>
          </div>
          <div className="readiness-progress-track" aria-hidden="true">
            <i style={{ width: `${activeAttempt && questions.length ? (completedCount / questions.length) * 100 : lastAttempt?.status === 'submitted' ? 100 : 0}%` }} />
          </div>
        </div>

        {activeAttempt && completedCount > 0 && !attemptComplete && <aside className="readiness-resume-banner" aria-live="polite">
          <strong>Resuming Attempt {activeAttempt.attemptNumber}</strong>
          <span>{completedCount} completed · {remainingCount} remaining</span>
        </aside>}

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
              <span>{question.type || 'Scenario'}</span>
              <small>{answer
                ? `Question ${questionIndex + 1} of ${questions.length} · Checked`
                : `Question ${questionIndex + 1} of ${questions.length} · ${remainingCount} remaining`}</small>
            </div>
            <ResultBadge answer={answer} />
          </header>

          <h3 id="readiness-question-title">{question.prompt}</h3>

          <div className="readiness-answer-options" role="radiogroup" aria-label="Answer choices">
            {(question.options || []).map(option => <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selectedOptionId === option.id}
              disabled={Boolean(answer) || busy}
              onClick={() => selectAnswer(option.id)}
            >
              <span>{option.id.toUpperCase()}</span>
              <p>{option.text}</p>
            </button>)}
          </div>

          <div className="readiness-find-card">
            <div>
              <span>Need a refresher?</span>
              <strong>Find the supporting guidance in Training &amp; Resources.</strong>
              <small>Your saved attempt stays active while you look. The exact answer location is intentionally not shown so you can practice finding it yourself.</small>
            </div>
            <button type="button" disabled={busy} onClick={() => onOpenResource({ view: 'training' })}>Open Training &amp; Resources</button>
          </div>

          {!answer
            ? <button
                type="button"
                className="readiness-check-answer"
                disabled={!selectedOptionId || busy}
                onClick={checkAnswer}
              >{busy ? 'Saving…' : 'Check answer'}</button>
            : <section className={answer.isCorrect ? 'readiness-feedback readiness-feedback-correct' : 'readiness-feedback readiness-feedback-review'} aria-live="polite">
                <strong>{answer.isCorrect ? 'Good judgment.' : 'Review this before moving on.'}</strong>
                <p>{answer.explanation}</p>
                <small>Source: {question.source}</small>
              </section>}

          <footer className="readiness-question-nav">
            <button
              type="button"
              disabled={questionIndex === 0 || busy}
              onClick={() => setQuestionIndex(index => Math.max(0, index - 1))}
            >Previous</button>
            <span>{questionIndex + 1} / {questions.length}</span>
            <button
              type="button"
              disabled={questionIndex === questions.length - 1 || !answer || busy}
              onClick={() => setQuestionIndex(index => Math.min(questions.length - 1, index + 1))}
            >Next</button>
          </footer>
        </section>}

        {activeAttempt && attemptComplete && <section className="readiness-part-result" aria-live="polite">
          <span>All 5 questions checked</span>
          <h3>Submit Attempt {activeAttempt.attemptNumber}</h3>
          <p>Your score and incorrect answers are recorded only when this attempt is submitted. Reset stays locked until submission is complete.</p>
          <button type="button" disabled={busy} onClick={submitAttempt}>{busy ? 'Submitting…' : 'Submit attempt'}</button>
        </section>}

        {!activeAttempt && lastAttempt?.status === 'submitted' && <section className="readiness-part-result" aria-live="polite">
          <span>Attempt {lastAttempt.attemptNumber} submitted</span>
          <h3>{lastAttempt.score}/{lastAttempt.totalQuestions} correct</h3>
          <p>{exhausted
            ? 'All 3 attempts are recorded. No additional attempts can be started.'
            : 'This score is locked in the attempt history. You can start the next attempt when you are ready.'}</p>
        </section>}

        <button
          type="button"
          className="readiness-check-answer"
          disabled={Boolean(activeAttempt) || exhausted || busy}
          title={activeAttempt ? 'Finish and submit the current attempt before resetting.' : exhausted ? 'Maximum of 3 attempts reached.' : undefined}
          onClick={startNextAttempt}
        >
          {exhausted ? '3 of 3 attempts used' : busy ? 'Starting…' : 'Reset for next attempt'}
        </button>

        {activeAttempt && <small>Reset is locked while Attempt {activeAttempt.attemptNumber} is unfinished or not yet submitted.</small>}

        <aside className="readiness-next-parts">
          <strong>Five-part readiness path</strong>
          <ol>
            {READINESS_PARTS.map(part => <li key={part.id}>
              <span>{part.number}</span>
              <div>
                <strong>{part.title}</strong>
                <small>{part.status === 'available' ? `Part ${part.number} available now` : part.purpose}</small>
              </div>
            </li>)}
          </ol>
        </aside>
      </>}
    </div>
  </aside>
}
