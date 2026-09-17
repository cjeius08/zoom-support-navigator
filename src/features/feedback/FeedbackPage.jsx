import { useState } from 'react'
import { FeedbackForm } from './FeedbackForm'

export function FeedbackPage({ onSubmit, onCancel = () => {} }) {
  const [sent, setSent] = useState(false)
  return <section className="console-view feedback-page"><p className="eyebrow">Support Console</p><h1>Feedback</h1><p>Report missing information, a process issue, or a Console improvement. Your report includes only the page context you choose—not customer or call content.</p>{sent ? <div className="empty-state"><h2>Feedback sent</h2><p>Thank you. JA can review the report in the Feedback Queue.</p><button onClick={() => setSent(false)}>Send another report</button></div> : <div className="feedback-form-panel"><FeedbackForm context={{ route_id: 'feedback', page_label: 'Feedback' }} onCancel={onCancel} onSubmit={async (payload) => { await onSubmit(payload); setSent(true) }} /></div>}</section>
}
