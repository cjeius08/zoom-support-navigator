import { useMemo, useState } from 'react'
import { FOUNDATION_QUESTIONS, READINESS_PARTS } from './readinessLabData'

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

function ResultBadge({ attempt }) {
  if (!attempt?.checked) return null
  return <span className={attempt.correct ? 'readiness-result readiness-result-correct' : 'readiness-result readiness-result-review'}>
    {attempt.correct ? 'Correct' : 'Review this'}
  </span>
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
  const [attempts, setAttempts] = useState({})

  const activePart = READINESS_PARTS.find(part => part.id === activePartId) ?? READINESS_PARTS[0]
  const questions = activePartId === ACTIVE_PART_ID ? FOUNDATION_QUESTIONS : []
  const question = questions[questionIndex] ?? questions[0]

  const completedCount = useMemo(
    () => FOUNDATION_QUESTIONS.filter(item => attempts[item.id]?.checked).length,
    [attempts],
  )
  const score = useMemo(
    () => FOUNDATION_QUESTIONS.filter(item => attempts[item.id]?.checked && attempts[item.id]?.correct).length,
    [attempts],
  )
  const partComplete = completedCount === FOUNDATION_QUESTIONS.length

  function selectAnswer(optionId) {
    if (!question || attempts[question.id]?.checked) return
    setAttempts(current => ({
      ...current,
      [question.id]: { selected: optionId, checked: false, correct: false },
    }))
  }

  function checkAnswer() {
    if (!question) return
    const attempt = attempts[question.id]
    if (!attempt?.selected || attempt.checked) return
    setAttempts(current => ({
      ...current,
      [question.id]: {
        ...attempt,
        checked: true,
        correct: attempt.selected === question.correctOptionId,
      },
    }))
  }

  function restartPart() {
    setAttempts({})
    setQuestionIndex(0)
  }

  if (!open) return null

  if (minimized) {
    return <aside className="documentation-dock documentation-dock-minimized readiness-lab-minimized" aria-label="Readiness Lab minimized">
      <button type="button" className="documentation-dock-restore" aria-label="Restore Readiness Lab" onClick={onMinimize}>
        <span>
          <strong>Readiness Lab</strong>
          <small>Part 1 · {completedCount}/{FOUNDATION_QUESTIONS.length} checked</small>
        </span>
        <span aria-hidden="true">▣</span>
      </button>
      <button type="button" className="documentation-dock-close" aria-label="Close Readiness Lab" onClick={onClose}>×</button>
    </aside>
  }

  const attempt = question ? attempts[question.id] : null

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
        <strong>Open-book by design</strong>
        <span>This measures whether you can find and apply the right workspace guidance—not whether you memorized every line. Use Find in Workspace whenever you need it.</span>
      </aside>

      <div className="readiness-progress" aria-label="Readiness Lab progress">
        <div>
          <span>Part 1 progress</span>
          <strong>{completedCount}/{FOUNDATION_QUESTIONS.length} checked</strong>
        </div>
        <div className="readiness-progress-track" aria-hidden="true">
          <i style={{ width: `${(completedCount / FOUNDATION_QUESTIONS.length) * 100}%` }} />
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

      {question && <section className="readiness-question" aria-labelledby="readiness-question-title">
        <header>
          <div>
            <span>{question.type}</span>
            <small>Question {questionIndex + 1} of {questions.length}</small>
          </div>
          <ResultBadge attempt={attempt} />
        </header>

        <h3 id="readiness-question-title">{question.prompt}</h3>

        <div className="readiness-answer-options" role="radiogroup" aria-label="Answer choices">
          {question.options.map(option => <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={attempt?.selected === option.id}
            disabled={attempt?.checked}
            onClick={() => selectAnswer(option.id)}
          >
            <span>{option.id.toUpperCase()}</span>
            <p>{option.text}</p>
          </button>)}
        </div>

        <div className="readiness-find-card">
          <div>
            <span>Find it in the workspace</span>
            <strong>{question.locationLabel}</strong>
            <small>Your current question and progress will stay open while you look.</small>
          </div>
          <button type="button" onClick={() => onOpenResource(question.resourceTarget)}>Find in Workspace</button>
        </div>

        {!attempt?.checked
          ? <button
              type="button"
              className="readiness-check-answer"
              disabled={!attempt?.selected}
              onClick={checkAnswer}
            >Check answer</button>
          : <section className={attempt.correct ? 'readiness-feedback readiness-feedback-correct' : 'readiness-feedback readiness-feedback-review'} aria-live="polite">
              <strong>{attempt.correct ? 'Good judgment.' : 'Review this before moving on.'}</strong>
              <p>{question.explanation}</p>
              <small>Source: {question.source}</small>
            </section>}

        <footer className="readiness-question-nav">
          <button
            type="button"
            disabled={questionIndex === 0}
            onClick={() => setQuestionIndex(index => Math.max(0, index - 1))}
          >Previous</button>
          <span>{questionIndex + 1} / {questions.length}</span>
          <button
            type="button"
            disabled={questionIndex === questions.length - 1}
            onClick={() => setQuestionIndex(index => Math.min(questions.length - 1, index + 1))}
          >Next</button>
        </footer>
      </section>}

      {partComplete && <section className="readiness-part-result" aria-live="polite">
        <span>Part 1 complete</span>
        <h3>{score}/{FOUNDATION_QUESTIONS.length} first-attempt answers correct</h3>
        <p>{score === FOUNDATION_QUESTIONS.length
          ? 'Strong foundation. Parts 2–5 will test device awareness, troubleshooting judgment, scope/referral decisions, and complete live-call readiness.'
          : 'Use the review feedback and Find in Workspace links to strengthen the missed areas before the remaining readiness parts are added.'}</p>
        <button type="button" onClick={restartPart}>Restart Part 1</button>
      </section>}

      <aside className="readiness-next-parts">
        <strong>Five-part readiness path</strong>
        <ol>
          {READINESS_PARTS.map(part => <li key={part.id}>
            <span>{part.number}</span>
            <div>
              <strong>{part.title}</strong>
              <small>{part.status === 'available' ? 'Part 1 available now' : part.purpose}</small>
            </div>
          </li>)}
        </ol>
      </aside>
    </div>
  </aside>
}
