import './answerFirst.css'

export function AnswerFirstCard({ answer, onOpenGuide }) {
  if (!answer) return null
  const coverageGap = answer.status === 'coverage_gap'

  return <section
    className={coverageGap ? 'answer-first-card answer-first-card--coverage-gap' : 'answer-first-card'}
    aria-label={coverageGap ? 'Coverage gap — no verified answer' : 'Verified quick answer'}
  >
    <div className="answer-first-heading">
      {!coverageGap && <span className="answer-first-check" aria-hidden="true">✓</span>}
      <strong>{coverageGap ? 'No approved procedure available' : 'Approved next check'}</strong>
      <small>{coverageGap ? 'Coverage gap — confirmation needed' : 'Answer-first pilot'}</small>
    </div>
    {coverageGap && <p className="answer-first-gap-title">{answer.heading}</p>}
    <p className="answer-first-instruction">{answer.answer}</p>
    {answer.confirmation && <p className="answer-first-confirm">
      <strong>Confirm:</strong> {answer.confirmation}
    </p>}
    <div className="answer-first-source">
      <span aria-hidden="true">▤</span>
      <span>{answer.sourceLabel}</span>
    </div>
    {!coverageGap && <div className="answer-first-actions">
      <button type="button" onClick={() => onOpenGuide(answer.guide)}>
        Open guided troubleshooting <span aria-hidden="true">→</span>
      </button>
      {answer.sourceUrl && <a href={answer.sourceUrl} target="_blank" rel="noreferrer">
        Official Zoom reference <span aria-hidden="true">↗</span>
      </a>}
    </div>}
    <p className="answer-first-disclaimer">{coverageGap
      ? 'No verified next-step procedure is documented for this request. Confirm the appropriate support boundary before advising the caller.'
      : 'Use the approved guide to confirm context, follow remaining steps, and check support boundaries before closing the call.'}</p>
  </section>
}
