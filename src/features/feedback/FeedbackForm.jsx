import { useId, useRef, useState } from 'react'

const TYPES = [['missing_information','Missing information'],['incorrect_outdated','Incorrect or outdated'],['not_working','Something not working'],['ui_ux','UI/UX issue'],['change_suggestion','Change suggestion']]

export function FeedbackForm({ onSubmit, onCancel, context = {} }) {
  const [type, setType] = useState('missing_information')
  const [what, setWhat] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [error, setError] = useState('')
  const [errorField, setErrorField] = useState('')
  const [saving, setSaving] = useState(false)
  // Each form gets its own alert ID even when page + floating dialog coexist.
  const errorId = useId()
  const whatRef = useRef(null)
  const suggestionRef = useRef(null)

  async function submit(event) {
    event.preventDefault()
    if (!what.trim()) {
      setErrorField('what')
      whatRef.current?.focus()
      return setError('Tell us what you noticed.')
    }
    if (what.length > 4000) {
      setErrorField('what')
      whatRef.current?.focus()
      return setError('Keep feedback under 4000 characters.')
    }
    if (suggestion.length > 4000) {
      setErrorField('suggestion')
      suggestionRef.current?.focus()
      return setError('Keep feedback under 4000 characters.')
    }

    setSaving(true)
    setError('')
    setErrorField('')
    try {
      await onSubmit({
        type,
        what_noticed: what.trim(),
        suggested_change: suggestion.trim() || null,
        ...context,
      })
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSaving(false)
    }
  }

  return <form onSubmit={submit} aria-label="Report feedback" noValidate>
    <h2>Report an issue</h2>
    <label>Type<select value={type} onChange={event => setType(event.target.value)}>{TYPES.map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select></label>
    <label>What did you notice?
      <textarea
        ref={whatRef}
        value={what}
        onChange={event => setWhat(event.target.value)}
        maxLength={4000}
        required
        aria-invalid={errorField === 'what' ? 'true' : undefined}
        aria-describedby={errorField === 'what' ? errorId : undefined}
      />
    </label>
    <label>Suggested change (optional)
      <textarea
        ref={suggestionRef}
        value={suggestion}
        onChange={event => setSuggestion(event.target.value)}
        maxLength={4000}
        aria-invalid={errorField === 'suggestion' ? 'true' : undefined}
        aria-describedby={errorField === 'suggestion' ? errorId : undefined}
      />
    </label>
    {error && <p id={errorId} role="alert">{error}</p>}
    <div className="dialog-actions">
      <button type="button" onClick={onCancel}>Cancel</button>
      <button disabled={saving}>{saving ? 'Sending…' : 'Send feedback'}</button>
    </div>
  </form>
}
