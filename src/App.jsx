import { useCallback, useEffect, useState } from 'react'
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
import { useUsageTracking } from './features/analytics/usePresence'
import './styles.css'
import './accessibility-ui.css'
import './features/shell/responsiveShell.css'

const EMPTY_REPORT_CONTEXT = {
  selected_tab: null,
  current_section: null,
  active_device: null,
  active_caller_role: null,
  active_common_issue: null,
  process_id: null,
  category_id: null,
}

export default function App() {
  const [activationOpen, setActivationOpen] = useState(false)
  const [error, setError] = useState('')
  const [errorField, setErrorField] = useState('')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('navigator')
  const [trainingVideoId, setTrainingVideoId] = useState(null)
  const [trainingTarget, setTrainingTarget] = useState(null)
  const [navigatorProcessId, setNavigatorProcessId] = useState(null)
  const [navigatorCommonIssueId, setNavigatorCommonIssueId] = useState(null)
  const [reportContext, setReportContext] = useState(EMPTY_REPORT_CONTEXT)
  const [showPassword, setShowPassword] = useState(false)
  const { trackEvent } = useUsageTracking(profile?.id ?? null, profile ? view : null)
  const accessStyle = { '--login-workspace-image': `url(${assetUrl('assets/login-workspace-background.png')})` }

  const updateReportContext = useCallback((nextContext) => {
    setReportContext(current => ({ ...current, ...nextContext }))
  }, [])

  function navigate(nextView) {
    trackEvent({ eventType: 'navigation', routeId: nextView, toolId: 'navigation' })
    if (nextView === 'training') {
      setTrainingVideoId(null)
      setTrainingTarget(null)
    }
    if (nextView === 'navigator') {
      setNavigatorProcessId(null)
      setNavigatorCommonIssueId(null)
    }
    setReportContext(EMPTY_REPORT_CONTEXT)
    setView(nextView)
  }

  function openTraining(videoId) {
    trackEvent({ eventType: 'training_open', routeId: 'training', toolId: typeof videoId === 'string' ? videoId : 'library' })
    setTrainingTarget(null)
    setTrainingVideoId(typeof videoId === 'string' ? videoId : null)
    setReportContext({
      ...EMPTY_REPORT_CONTEXT,
      selected_tab: 'Video Library',
      current_section: typeof videoId === 'string' ? videoId : null,
    })
    setView('training')
  }

  function openReadinessResource(target = {}) {
    if (target.view === 'training') {
      setTrainingVideoId(null)
      setTrainingTarget({ ...target })
      setReportContext({
        ...EMPTY_REPORT_CONTEXT,
        selected_tab: target.section === 'scripts'
          ? 'Scripts & Communication'
          : target.section === 'lessons'
            ? 'Guided Visual Lessons'
            : 'Training & Resources',
        current_section: target.device || target.subsection || target.section || null,
      })
      setView('training')
      return
    }

    if (target.view === 'navigator') {
      setTrainingTarget(null)
      setNavigatorProcessId(target.processId || null)
      setNavigatorCommonIssueId(target.commonIssueId || null)
      setReportContext({
        ...EMPTY_REPORT_CONTEXT,
        process_id: target.processId || null,
        active_common_issue: target.commonIssueId || null,
      })
      setView('navigator')
    }
  }

  function openFeedbackTarget(item) {
    const safeRoutes = new Set(['navigator', 'training', 'updates', 'feedback'])
    if (item?.active_common_issue) {
      setNavigatorProcessId(null)
      setNavigatorCommonIssueId(item.active_common_issue)
      setReportContext({
        ...EMPTY_REPORT_CONTEXT,
        active_common_issue: item.active_common_issue,
        selected_tab: item.selected_tab || null,
        active_device: item.active_device || null,
        active_caller_role: item.active_caller_role || null,
      })
      setView('navigator')
      return
    }
    if (item?.process_id) {
      setNavigatorCommonIssueId(null)
      setNavigatorProcessId(item.process_id)
      setReportContext({
        ...EMPTY_REPORT_CONTEXT,
        process_id: item.process_id,
        category_id: item.category_id || null,
        selected_tab: item.selected_tab || null,
      })
      setView('navigator')
      return
    }
    setNavigatorProcessId(null)
    setNavigatorCommonIssueId(null)
    setReportContext({
      ...EMPTY_REPORT_CONTEXT,
      selected_tab: item?.selected_tab || null,
      current_section: item?.current_section || null,
    })
    setView(safeRoutes.has(item?.route_id) ? item.route_id : 'navigator')
  }

  useEffect(() => { getCurrentProfile().then(setProfile).catch(() => signOut()).finally(() => setLoading(false)) }, [])

  async function submit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const result = validateCredentials(String(form.get('username')), String(form.get('password')))
    const validationField = Object.keys(result.errors)[0]
    if (validationField) {
      setErrorField(validationField)
      setError(result.errors[validationField])
      return
    }
    setError('')
    setErrorField('')
    try {
      setProfile(await loginWithUsername(result.username, String(form.get('password'))))
    } catch (loginError) {
      setErrorField('username')
      setError(loginError.message)
    }
  }

  if (loading) return <main className="access-shell"><p>Loading secure session…</p></main>
  if (profile?.must_change_password) return <ForcePasswordChange onChange={async password => { await changeOwnPassword(password); setProfile(await getCurrentProfile()) }} onLogout={async () => { await signOut(); setProfile(null) }} />
  if (profile) {
    const content = view==='navigator'?<Navigator onOpenTraining={openTraining} onTrackEvent={trackEvent} initialProcessId={navigatorProcessId} initialCommonIssueId={navigatorCommonIssueId} onReportContextChange={updateReportContext}/>:view==='training'?<TrainingResources initialVideoId={trainingVideoId} initialTarget={trainingTarget} onReportContextChange={updateReportContext}/>:view==='updates'?<UpdatesView/>:view==='feedback'?<FeedbackPage onSubmit={submitFeedback} onCancel={()=>navigate('navigator')}/>:view==='admin'?<AdminHome onNavigate={navigate}/>:view==='team'?<TeamManagement/>:view==='usage'?<UsageAnalytics/>:<FeedbackQueue onOpenPage={openFeedbackTarget}/>
    return <AppShell profile={profile} currentView={view} onNavigate={navigate} onOpenReadinessResource={openReadinessResource} onFeedback={submitFeedback} reportContext={reportContext} onPasswordChange={changeOwnPassword} onAvatarChange={async avatarId=>{await updateOwnAvatar(avatarId);setProfile(current=>({...current,avatar_id:avatarId}))}} onLogout={async()=>{await signOut();setProfile(null)}}>{content}</AppShell>
  }

  if (activationOpen) return <main className="access-shell" style={accessStyle}><section className="access-card activation-card"><ActivateAccountForm onActivate={activateAccount} onCancel={()=>setActivationOpen(false)}/></section></main>
  return <main className="access-shell" style={accessStyle}>
    <section className="access-card" aria-label="Ozzie sign in">
      <img
        className="access-brand-logo"
        src={assetUrl('assets/ozzie-login.webp')}
        alt="Ozzie — Ogletree Support Workspace"
      />
      <form onSubmit={submit} noValidate>
        <label>Username<span className="access-input"><svg data-testid="username-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" /></svg><input name="username" autoComplete="username" placeholder="Enter your username" required aria-invalid={errorField === 'username' ? 'true' : undefined} aria-describedby={errorField === 'username' ? 'login-error' : undefined} /></span></label>
        <label>Password<span className="access-input"><svg data-testid="password-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M6 10V7a6 6 0 0 1 12 0v3M5 10h14a2 2 0 0 1 2 2v9H3v-9a2 2 0 0 1 2-2Z" /></svg><input name="password" type={showPassword?'text':'password'} autoComplete="current-password" placeholder="Enter your password" required aria-invalid={errorField === 'password' ? 'true' : undefined} aria-describedby={errorField === 'password' ? 'login-error' : undefined} /><button className="password-toggle" type="button" aria-label={showPassword?'Hide password':'Show password'} onClick={()=>setShowPassword(value=>!value)}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button></span></label>
        {error && <p id="login-error" role="alert">{error}</p>}
        <button className="sign-in-button" type="submit">Sign In <span aria-hidden="true">→</span></button>
      </form>
      <button className="link-button" type="button" onClick={() => setActivationOpen(!activationOpen)}>Activate Account</button>
      <div className="access-card-footer">Better support. Smarter workflows.</div>
    </section>
  </main>
}
