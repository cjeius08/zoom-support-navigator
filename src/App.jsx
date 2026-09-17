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
import { UpdatesView } from './features/updates/UpdatesView'
import { assetUrl } from './lib/assetUrl'
import './styles.css'
import './accessibility-ui.css'
import './features/shell/responsiveShell.css'

export default function App() {
  const [activationOpen, setActivationOpen] = useState(false)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('navigator')
  const [showPassword, setShowPassword] = useState(false)
  const accessStyle = { '--login-workspace-image': `url(${assetUrl('assets/login-workspace-background.png')})` }

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
    const content = view==='navigator'?<Navigator onFeedback={submitFeedback} onOpenTraining={()=>setView('training')}/>:view==='training'?<TrainingResources/>:view==='updates'?<UpdatesView/>:view==='feedback'?<FeedbackPage onSubmit={submitFeedback}/>:view==='admin'?<AdminHome onNavigate={setView}/>:view==='team'?<TeamManagement/>:view==='usage'?<UsageAnalytics/>:<FeedbackQueue/>
    return <AppShell profile={profile} currentView={view} onNavigate={setView} onPasswordChange={changeOwnPassword} onAvatarChange={async avatarId=>{await updateOwnAvatar(avatarId);setProfile(current=>({...current,avatar_id:avatarId}))}} onLogout={async()=>{await signOut();setProfile(null)}}>{content}</AppShell>
  }

  if (activationOpen) return <main className="access-shell" style={accessStyle}><section className="access-card"><ActivateAccountForm onActivate={activateAccount} onCancel={()=>setActivationOpen(false)}/></section></main>
  return <main className="access-shell" style={accessStyle}>
    <section className="access-card" aria-labelledby="app-title">
      <div className="access-brand"><p>Zoom</p><span>Internal Support Workspace</span></div>
      <h1 id="app-title">Support Console</h1>
      <p>Sign in to access the support-process workspace.</p>
      <form onSubmit={submit} noValidate>
        <label>Username<span className="access-input"><svg data-testid="username-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" /></svg><input name="username" autoComplete="username" placeholder="Enter your username" required /></span></label>
        <label>Password<span className="access-input"><svg data-testid="password-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M6 10V7a6 6 0 0 1 12 0v3M5 10h14a2 2 0 0 1 2 2v9H3v-9a2 2 0 0 1 2-2Z" /></svg><input name="password" type={showPassword?'text':'password'} autoComplete="current-password" placeholder="Enter your password" required /><button className="password-toggle" type="button" aria-label={showPassword?'Hide password':'Show password'} onClick={()=>setShowPassword(value=>!value)}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button></span></label>
        {error && <p role="alert">{error}</p>}
        <button className="sign-in-button" type="submit">Sign In <span aria-hidden="true">→</span></button>
      </form>
      <button className="link-button" type="button" onClick={() => setActivationOpen(!activationOpen)}>Activate Account</button>
      <div className="access-card-footer">Better support. Smarter workflows.</div>
    </section>
  </main>
}
