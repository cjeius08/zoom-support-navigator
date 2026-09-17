import { useEffect, useState } from 'react'
import { validateCredentials } from './features/auth/credentials'
import { ForcePasswordChange } from './features/auth/ForcePasswordChange'
import { activateAccount, changeOwnPassword, getCurrentProfile, loginWithUsername, signOut, updateOwnAvatar } from './lib/authApi'
import { ActivateAccountForm } from './features/auth/ActivateAccountForm'
import { submitFeedback } from './lib/feedbackApi'
import { Navigator } from './features/navigator/Navigator'
import { AppShell } from './features/shell/AppShell'
import { AdminHome, FeedbackQueue, TeamManagement, UsageAnalytics } from './features/admin/AdminViews'
import { TrainingResources } from './features/training/TrainingResources'
import { FeedbackPage } from './features/feedback/FeedbackPage'
import './styles.css'

export default function App() {
  const [activationOpen, setActivationOpen] = useState(false)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('navigator')

  useEffect(() => { getCurrentProfile().then(setProfile).catch(() => signOut()).finally(() => setLoading(false)) }, [])

  async function submit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const result = validateCredentials(String(form.get('username')), String(form.get('password')))
    const validationError = Object.values(result.errors)[0]
    if (validationError) return setError(validationError)
    setError('')
    try { setProfile(await loginWithUsername(result.username, String(form.get('password')))) }
    catch (loginError) { setError(loginError.message) }
  }

  if (loading) return <main className="access-shell"><p>Loading secure session…</p></main>
  if (profile?.must_change_password) return <ForcePasswordChange onChange={async password => { await changeOwnPassword(password); setProfile(await getCurrentProfile()) }} onLogout={async () => { await signOut(); setProfile(null) }} />
  if (profile) {
    const content = view==='navigator'?<Navigator onFeedback={submitFeedback} onOpenTraining={()=>setView('training')}/>:view==='training'?<TrainingResources/>:view==='feedback'?<FeedbackPage onSubmit={submitFeedback}/>:view==='admin'?<AdminHome onNavigate={setView}/>:view==='team'?<TeamManagement/>:view==='usage'?<UsageAnalytics/>:<FeedbackQueue/>
    return <AppShell profile={profile} currentView={view} onNavigate={setView} onPasswordChange={changeOwnPassword} onAvatarChange={async avatarId=>{await updateOwnAvatar(avatarId);setProfile(current=>({...current,avatar_id:avatarId}))}} onLogout={async()=>{await signOut();setProfile(null)}}>{content}</AppShell>
  }

  if (activationOpen) return <main className="access-shell"><section className="access-card"><ActivateAccountForm onActivate={activateAccount} onCancel={()=>setActivationOpen(false)}/></section></main>
  return <main className="access-shell">
    <section className="access-card" aria-labelledby="app-title">
      <div className="access-brand"><p className="eyebrow">Zoom</p><span>Internal Support Workspace</span></div>
      <h1 id="app-title">Support Console</h1>
      <p>Sign in to access the support-process workspace.</p>
      <form onSubmit={submit} noValidate>
        <label>Username<input name="username" autoComplete="username" required /></label>
        <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
        {error && <p role="alert">{error}</p>}
        <button type="submit">Sign In</button>
      </form>
      <button className="link-button" type="button" onClick={() => setActivationOpen(!activationOpen)}>Activate Account</button>
    </section>
  </main>
}
