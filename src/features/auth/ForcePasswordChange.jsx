import { useState } from 'react'

export function ForcePasswordChange({ onChange, onLogout }) {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [errorField, setErrorField] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event) {
    event.preventDefault()
    if (password.length < 8) {
      setErrorField('password')
      return setError('New password must be at least 8 characters.')
    }
    if (password !== confirmation) {
      setErrorField('confirmation')
      return setError('New passwords must match.')
    }

    setError('')
    setErrorField('')
    setSaving(true)
    try {
      await onChange(password)
    } catch (changeError) {
      setErrorField('password')
      setError(changeError.message || 'Password change failed.')
    } finally {
      setSaving(false)
    }
  }

  return <main className="access-shell"><section className="access-card" aria-labelledby="password-change-title">
    <p className="eyebrow">Password change required</p>
    <h1 id="password-change-title">Set a new password</h1>
    <p>Your temporary password must be changed before you can access the Navigator.</p>
    <form onSubmit={submit} noValidate>
      <label>New Password<input aria-label="New Password" type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="new-password" aria-invalid={errorField === 'password' ? 'true' : undefined} aria-describedby={errorField === 'password' ? 'forced-password-error' : undefined} /></label>
      <label>Confirm New Password<input aria-label="Confirm New Password" type="password" value={confirmation} onChange={event => setConfirmation(event.target.value)} autoComplete="new-password" aria-invalid={errorField === 'confirmation' ? 'true' : undefined} aria-describedby={errorField === 'confirmation' ? 'forced-password-error' : undefined} /></label>
      {error && <p id="forced-password-error" role="alert">{error}</p>}
      <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Change Password'}</button>
    </form>
    <button className="link-button" type="button" onClick={onLogout}>Logout</button>
  </section></main>
}
