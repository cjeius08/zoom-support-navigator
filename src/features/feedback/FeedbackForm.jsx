import { useState } from 'react'

const TYPES = [['missing_information','Missing information'],['incorrect_outdated','Incorrect or outdated'],['not_working','Something not working'],['ui_ux','UI/UX issue'],['change_suggestion','Change suggestion']]

export function FeedbackForm({ onSubmit, onCancel, context = {} }) {
  const [type, setType] = useState('missing_information'); const [what, setWhat] = useState(''); const [suggestion, setSuggestion] = useState(''); const [error, setError] = useState(''); const [saving, setSaving] = useState(false)
  async function submit(event) { event.preventDefault(); if (!what.trim()) return setError('Tell us what you noticed.'); if (what.length > 4000 || suggestion.length > 4000) return setError('Keep feedback under 4000 characters.'); setSaving(true); setError(''); try { await onSubmit({ type, what_noticed: what.trim(), suggested_change: suggestion.trim() || null, ...context }); } catch (e) { setError(e.message); } finally { setSaving(false) } }
  return <form onSubmit={submit} aria-label="Report feedback"><h2>Report an issue</h2><label>Type<select value={type} onChange={e => setType(e.target.value)}>{TYPES.map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select></label><label>What did you notice?<textarea value={what} onChange={e => setWhat(e.target.value)} maxLength={4000} required /></label><label>Suggested change (optional)<textarea value={suggestion} onChange={e => setSuggestion(e.target.value)} maxLength={4000} /></label>{error && <p role="alert">{error}</p>}<div className="dialog-actions"><button type="button" onClick={onCancel}>Cancel</button><button disabled={saving}>{saving ? 'Sending…' : 'Send feedback'}</button></div></form>
}
