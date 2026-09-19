import { useState } from 'react'
import { validateActivation } from './credentials'
import { assetUrl } from '../../lib/assetUrl'

export function ActivateAccountForm({ onActivate, onCancel }) {
  const [error, setError] = useState('')
  const [errorField, setErrorField] = useState('')
  const [saving, setSaving] = useState(false)
  const [complete, setComplete] = useState(false)

  async function submit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const values = {
      initials: String(form.get('initials')).trim().toUpperCase(),
      inviteCode: String(form.get('inviteCode')).trim(),
      username: String(form.get('username')).trim().toLowerCase(),
      password: String(form.get('password')),
      confirmPassword: String(form.get('confirmPassword')),
    }
    const result = validateActivation(values)
    if (!values.inviteCode) result.errors.inviteCode = 'Enter the invite code provided by JA.'
    const firstErrorField = Object.keys(result.errors)[0]
    if (firstErrorField) {
      setErrorField(firstErrorField)
      setError(result.errors[firstErrorField])
      return
    }

    setSaving(true)
    setError('')
    setErrorField('')
    try {
      await onActivate(values)
      setComplete(true)
    } catch (activationError) {
      setErrorField('inviteCode')
      setError(activationError.message)
    } finally {
      setSaving(false)
    }
  }

  if (complete) return <section className="activation-success" aria-labelledby="activation-success-title">
    <img className="activation-success-mascot" src={assetUrl('assets/ozzie-activation-success.webp')} alt="" />
    <div>
      <h2 id="activation-success-title">Account activated</h2>
      <p>You can now sign in with your username and password.</p>
      <button onClick={onCancel}>Return to sign in</button>
    </div>
  </section>

  const fieldErrorProps = field => ({
    'aria-invalid': errorField === field ? 'true' : undefined,
    'aria-describedby': errorField === field ? 'activation-error' : undefined,
  })

  return <div className="activation-experience">
    <form onSubmit={submit} className="activation-form" noValidate>
    <h2>Activate Account</h2>
    <p>Use the initials and one-time invite code provided by JA.</p>
    <label>Initials<input name="initials" autoComplete="off" maxLength={3} required {...fieldErrorProps('initials')} /></label>
    <label>Invite code<input name="inviteCode" autoComplete="one-time-code" required {...fieldErrorProps('inviteCode')} /></label>
    <label>Choose username<input name="username" autoComplete="username" required {...fieldErrorProps('username')} /></label>
    <label>Password<input name="password" type="password" autoComplete="new-password" required {...fieldErrorProps('password')} /></label>
    <label>Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" required {...fieldErrorProps('confirmPassword')} /></label>
    {error && <p id="activation-error" role="alert">{error}</p>}
    <div className="dialog-actions">
      <button type="button" onClick={onCancel}>Cancel</button>
      <button disabled={saving}>{saving ? 'Activating…' : 'Activate'}</button>
    </div>
    </form>
    <div className="activation-mascot-panel" aria-hidden="true">
      <img className="activation-pointer-mascot" src={assetUrl('assets/ozzie-activation-pointer.webp')} alt="" />
    </div>
  </div>
}
