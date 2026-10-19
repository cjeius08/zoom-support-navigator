import './answerFirst.css'

export function AnswerFirstCard({ answer, onOpenGuide }) {
  if (!answer) return null

  return <section className="answer-first-card" aria-label="Verified quick answer">
    <div className="answer-first-heading">
      <span className="answer-first-check" aria-hidden="true">✓</span>
      <strong>Approved next check</strong>
      <small>Answer-first pilot</small>
    </div>
    <p className="answer-first-instruction">{answer.answer}</p>
    {answer.confirmation && <p className="answer-first-confirm">
      <strong>Confirm:</strong> {answer.confirmation}
    </p>}
    <div className="answer-first-source">
      <span aria-hidden="true">▤</span>
      <span>{answer.sourceLabel}</span>
    </div>
    <div className="answer-first-actions">
      <button type="button" onClick={() => onOpenGuide(answer.guide)}>
        Open guided troubleshooting <span aria-hidden="true">→</span>
      </button>
      {answer.sourceUrl && <a href={answer.sourceUrl} target="_blank" rel="noreferrer">
        Official Zoom reference <span aria-hidden="true">↗</span>
      </a>}
    </div>
    <p className="answer-first-disclaimer">Use the approved guide to confirm context, follow remaining steps, and check support boundaries before closing the call.</p>
  </section>
}
