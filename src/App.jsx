import { useCallback, useEffect, useRef, useState } from 'react'
import { validateCredentials } from './features/auth/credentials'
import { ForcePasswordChange } from './features/auth/ForcePasswordChange'
import { activateAccount, changeOwnPassword, getCurrentProfile, loginWithUsername, markOzzieIntroSeen, signOut, updateOwnAvatar } from './lib/authApi'
import { getBundledAvatarRecords } from './features/profile/avatarCatalog'
import { loadAvatarLibrary } from './lib/avatarLibraryApi'
import { ActivateAccountForm } from './features/auth/ActivateAccountForm'
import { submitFeedback } from './lib/feedbackApi'
import { Navigator } from './features/navigator/Navigator'
import { AppShell } from './features/shell/AppShell'
import { AdminHome, FeedbackQueue, TeamManagement, UsageAnalytics } from './features/admin/AdminViews'
import { AvatarLibraryManagement } from './features/admin/AvatarLibraryManagement'
import { SavedNotesPage } from './features/admin/SavedNotesPage'
import { MySavedNotesPage } from './features/notes/MySavedNotesPage'
import { TrainingResources } from './features/training/TrainingResources'
import { FeedbackPage } from './features/feedback/FeedbackPage'
import { UpdatesView } from './features/updates/UpdatesView'
import { FavoritesView } from './features/favorites/FavoritesView'
import { ProcessDocuments } from './features/knowledge/ProcessDocuments'
import { useFavorites } from './features/favorites/useFavorites'
import { useRecentlyViewed } from './features/favorites/useRecentlyViewed'
import { OzzieWelcome } from './features/onboarding/OzzieWelcome'
import { assetUrl } from './lib/assetUrl'
import { useUsageTracking } from './features/analytics/usePresence'
import { completeWorkspaceNavigation, createWorkspaceNavigationState, resolveWorkspaceNavigationState, startWorkspaceNavigation } from './lib/workspaceNavigationHistory'
import { applyTheme, readStoredTheme, storeTheme } from './features/theme/theme'
import './styles.css'
import './accessibility-ui.css'
import './features/shell/responsiveShell.css'
import './features/shell/headerNavRevamp.css'
import './features/shell/loginRevamp.css'
import './features/theme/themeSystem.css'
import './pilotReadiness.css'

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
  const [avatarLibrary, setAvatarLibrary] = useState(() => getBundledAvatarRecords())
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('navigator')
  const [trainingVideoId, setTrainingVideoId] = useState(null)
  const [trainingTarget, setTrainingTarget] = useState(null)
  const [navigatorProcessId, setNavigatorProcessId] = useState(null)
  const [navigatorCommonIssueId, setNavigatorCommonIssueId] = useState(null)
  const [reportContext, setReportContext] = useState(EMPTY_REPORT_CONTEXT)
  const [documentationHandoff, setDocumentationHandoff] = useState(null)
  const [callResetToken, setCallResetToken] = useState(0)
  const [savedNotesUserId, setSavedNotesUserId] = useState('')
  const [mySavedNoteId, setMySavedNoteId] = useState('')
  const [navigationHistory, setNavigationHistory] = useState([])
  const navigationUserIdRef = useRef(null)
  const [showPassword, setShowPassword] = useState(false)
  const [ozzieIntroOpen, setOzzieIntroOpen] = useState(false)
  const [ozzieIntroReplay, setOzzieIntroReplay] = useState(false)
  const [ozzieIntroSaving, setOzzieIntroSaving] = useState(false)
  const [ozzieIntroError, setOzzieIntroError] = useState('')
  const [theme, setTheme] = useState(readStoredTheme)
  const { trackEvent } = useUsageTracking(profile?.id ?? null, profile ? view : null)
  const {
    favorites,
    loading: favoritesLoading,
    error: favoritesError,
    isFavorite,
    isFavoriteBusy,
    toggleFavorite,
  } = useFavorites(profile?.id ?? null)
  const {
    recentlyViewed,
    loading: recentLoading,
    clearing: clearingRecent,
    error: recentError,
    rememberRecentView,
    clearRecentViews,
  } = useRecentlyViewed(profile?.id ?? null)
  const accessStyle = { '--login-workspace-image': `url(${assetUrl('assets/login-workspace-background.png')})` }
  const ozzieIntroVideoSrc = assetUrl('assets/Ozzie2.mp4')

  const refreshAvatarLibrary = useCallback(async () => {
    try {
      setAvatarLibrary(await loadAvatarLibrary())
    } catch {
      // Keep the bundled catalog available if a deployment has not applied the
      // avatar-library migration yet.
      setAvatarLibrary(getBundledAvatarRecords())
    }
  }, [])

  const updateReportContext = useCallback((nextContext) => {
    setReportContext(current => ({ ...current, ...nextContext }))
  }, [])
  const addToCallDocumentation = useCallback((handoff) => {
    setDocumentationHandoff(handoff)
  }, [])

  const clearDocumentationHandoff = useCallback(() => {
    setDocumentationHandoff(null)
  }, [])
  const startNewCall = useCallback(() => {
    setDocumentationHandoff(null)
    setReportContext(EMPTY_REPORT_CONTEXT)
    setCallResetToken(current => current + 1)
  }, [])



  function currentNavigationSnapshot() {
    return {
      view,
      trainingVideoId,
      trainingTarget,
      navigatorProcessId,
      navigatorCommonIssueId,
      savedNotesUserId,
      mySavedNoteId,
      reportContext: { ...reportContext },
    }
  }

  function rememberCurrentPage() {
    const snapshot = currentNavigationSnapshot()
    setNavigationHistory(history => [...history.slice(-29), snapshot])
    window.history.pushState(startWorkspaceNavigation(window.history.state, snapshot), '', window.location.href)
  }

  function restoreNavigationSnapshot(snapshot) {
    setView(snapshot.view || 'navigator')
    setTrainingVideoId(snapshot.trainingVideoId || null)
    setTrainingTarget(snapshot.trainingTarget || null)
    setNavigatorProcessId(snapshot.navigatorProcessId || null)
    setNavigatorCommonIssueId(snapshot.navigatorCommonIssueId || null)
    setSavedNotesUserId(snapshot.savedNotesUserId || '')
    setMySavedNoteId(snapshot.mySavedNoteId || '')
    setReportContext(snapshot.reportContext || EMPTY_REPORT_CONTEXT)
  }

  function goBack() {
    if (!navigationHistory.length) return
    if (window.history.state?.ozzieWorkspaceHistory === true) {
      window.history.back()
      return
    }
    const previous = navigationHistory[navigationHistory.length - 1]
    setNavigationHistory(history => history.slice(0, -1))
    restoreNavigationSnapshot(previous)
    trackEvent({ eventType: 'navigation', routeId: previous.view || 'navigator', toolId: 'back' })
  }

  function navigate(nextView) {
    const resetsTraining = nextView === 'training' && (trainingVideoId || trainingTarget)
    const resetsNavigator = nextView === 'navigator' && (navigatorProcessId || navigatorCommonIssueId)
    const changesPage = nextView !== view || resetsTraining || resetsNavigator
    if (changesPage) rememberCurrentPage()

    trackEvent({ eventType: 'navigation', routeId: nextView, toolId: 'navigation' })
    if (nextView === 'training') {
      setTrainingVideoId(null)
      setTrainingTarget(null)
    }
    if (nextView === 'navigator') {
      setNavigatorProcessId(null)
      setNavigatorCommonIssueId(null)
    }
    if (nextView === 'saved_notes') {
      setSavedNotesUserId('')
    }
    if (nextView === 'my_saved_notes') {
      setMySavedNoteId('')
    }
    setReportContext(EMPTY_REPORT_CONTEXT)
    setView(nextView)
  }

  function openSavedNotes(userId = '') {
    rememberCurrentPage()
    trackEvent({ eventType: 'navigation', routeId: 'saved_notes', toolId: userId ? 'saved_notes_user' : 'saved_notes' })
    setSavedNotesUserId(userId || '')
    setReportContext(EMPTY_REPORT_CONTEXT)
    setView('saved_notes')
  }

  function openMySavedNotes(noteId = '') {
    rememberCurrentPage()
    trackEvent({ eventType: 'navigation', routeId: 'my_saved_notes', toolId: noteId ? 'my_saved_note' : 'my_saved_notes' })
    setMySavedNoteId(noteId || '')
    setReportContext(EMPTY_REPORT_CONTEXT)
    setView('my_saved_notes')
  }

  function openTraining(videoId) {
    rememberCurrentPage()
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


  function openDeviceSandbox() {
    rememberCurrentPage()
    setTrainingVideoId(null)
    setTrainingTarget({ section: 'devices', device: 'windows', sandboxOpen: true })
    trackEvent({ eventType: 'tool_open', routeId: 'training', toolId: 'windows-device-sandbox' })
    setReportContext({
      ...EMPTY_REPORT_CONTEXT,
      selected_tab: 'Device Walkthroughs',
      current_section: 'Interactive Windows Sandbox',
      active_device: 'windows',
    })
    setView('training')
  }

  function openReadinessResource(target = {}) {
    if (target.view === 'training') {
      rememberCurrentPage()
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
      rememberCurrentPage()
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
    rememberCurrentPage()
    const safeRoutes = new Set(['navigator', 'favorites', 'process_documents', 'training', 'updates', 'feedback', 'admin', 'avatar_library', 'team', 'usage', 'saved_notes', 'my_saved_notes', 'feedback_queue'])
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

  function openFavoriteProcess(processId) {
    rememberCurrentPage()
    trackEvent({ eventType: 'process_open', routeId: 'favorites', processId, toolId: 'favorites' })
    setNavigatorCommonIssueId(null)
    setNavigatorProcessId(processId)
    setReportContext({
      ...EMPTY_REPORT_CONTEXT,
      process_id: processId,
    })
    setView('navigator')
  }

  function openFavoriteCommonIssue(commonIssueId) {
    rememberCurrentPage()
    trackEvent({ eventType: 'tool_open', routeId: 'favorites', toolId: `common_issue_${commonIssueId}_favorite` })
    setNavigatorProcessId(null)
    setNavigatorCommonIssueId(commonIssueId)
    setReportContext({
      ...EMPTY_REPORT_CONTEXT,
      active_common_issue: commonIssueId,
    })
    setView('navigator')
  }

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => { getCurrentProfile().then(setProfile).catch(() => signOut()).finally(() => setLoading(false)) }, [])

  useEffect(() => {
    if (!profile?.id) {
      navigationUserIdRef.current = null
      return
    }
    if (navigationUserIdRef.current === profile.id) return

    navigationUserIdRef.current = profile.id
    setNavigationHistory([])
    window.history.replaceState(createWorkspaceNavigationState(currentNavigationSnapshot()), '', window.location.href)
  }, [profile?.id])

  useEffect(() => {
    if (!profile?.id) return
    const state = window.history.state
    if (!state?.pending || state.ozzieWorkspaceHistory !== true) return

    window.history.replaceState(completeWorkspaceNavigation(state, currentNavigationSnapshot()), '', window.location.href)
  }, [profile?.id, view, trainingVideoId, trainingTarget, navigatorProcessId, navigatorCommonIssueId, savedNotesUserId, mySavedNoteId, reportContext, navigationHistory])

  useEffect(() => {
    if (!profile?.id) return undefined
    function restoreBrowserNavigation(event) {
      const restored = resolveWorkspaceNavigationState(event.state)
      if (!restored) return
      setNavigationHistory(restored.backStack)
      restoreNavigationSnapshot(restored.snapshot)
      trackEvent({ eventType: 'navigation', routeId: restored.snapshot.view || 'navigator', toolId: 'back' })
    }

    window.addEventListener('popstate', restoreBrowserNavigation)
    return () => window.removeEventListener('popstate', restoreBrowserNavigation)
  }, [profile?.id, trackEvent])

  useEffect(() => {
    if (!profile) {
      setAvatarLibrary(getBundledAvatarRecords())
      return undefined
    }
    refreshAvatarLibrary()
    return undefined
  }, [profile, refreshAvatarLibrary])

  useEffect(() => {
    if (profile && !profile.must_change_password && !profile.ozzie_intro_seen_at) {
      setOzzieIntroReplay(false)
      setOzzieIntroError('')
      setOzzieIntroOpen(true)
    }
  }, [profile])

  function changeTheme(nextTheme) {
    const savedTheme = storeTheme(nextTheme)
    setTheme(savedTheme)
  }

  async function finishOzzieIntro() {
    if (ozzieIntroReplay || profile?.ozzie_intro_seen_at) {
      setOzzieIntroOpen(false)
      setOzzieIntroReplay(false)
      setOzzieIntroError('')
      return
    }

    setOzzieIntroSaving(true)
    setOzzieIntroError('')
    try {
      const seenAt = await markOzzieIntroSeen()
      setProfile(current => ({
        ...current,
        ozzie_intro_seen_at: seenAt || new Date().toISOString(),
      }))
      setOzzieIntroOpen(false)
    } catch (introError) {
      setOzzieIntroError(introError?.message || 'Could not save the Ozzie introduction status.')
    } finally {
      setOzzieIntroSaving(false)
    }
  }

  function replayOzzieIntro() {
    setOzzieIntroReplay(true)
    setOzzieIntroError('')
    setOzzieIntroOpen(true)
  }

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
      setNavigationHistory([])
      setProfile(await loginWithUsername(result.username, String(form.get('password'))))
    } catch (loginError) {
      setErrorField('username')
      setError(loginError.message)
    }
  }

  if (loading) return <main className="access-shell"><p>Loading secure session…</p></main>
  if (profile?.must_change_password) return <ForcePasswordChange onChange={async password => { await changeOwnPassword(password); setProfile(await getCurrentProfile()) }} onLogout={async () => { await signOut(); setProfile(null) }} />
  if (profile) {
    const content = view === 'navigator'
      ? <Navigator
          onOpenTraining={openTraining}
          onOpenDeviceSandbox={openDeviceSandbox}
          onTrackEvent={trackEvent}
          onAddToDocumentation={addToCallDocumentation}
          onNewCall={startNewCall}
          initialProcessId={navigatorProcessId}
          initialCommonIssueId={navigatorCommonIssueId}
          onReportContextChange={updateReportContext}
          isFavorite={isFavorite}
          isFavoriteBusy={isFavoriteBusy}
          onToggleFavorite={toggleFavorite}
          onResourceViewed={rememberRecentView}
        />
      : view === 'favorites'
        ? <FavoritesView
            favorites={favorites}
            loading={favoritesLoading}
            error={favoritesError}
            busyFor={isFavoriteBusy}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            recentlyViewed={recentlyViewed}
            recentLoading={recentLoading}
            recentError={recentError}
            clearingRecent={clearingRecent}
            onClearRecentlyViewed={clearRecentViews}
            onOpenProcess={openFavoriteProcess}
            onOpenCommonIssue={openFavoriteCommonIssue}
          />
        : view === 'process_documents'
          ? <ProcessDocuments onTrackEvent={trackEvent} onReportContextChange={updateReportContext}/>
        : view === 'training'
          ? <TrainingResources initialVideoId={trainingVideoId} initialTarget={trainingTarget} onReportContextChange={updateReportContext} trackEvent={trackEvent}/>
          : view === 'updates'
            ? <UpdatesView isAdmin={profile.role === 'creator_admin'}/>
            : view === 'feedback'
              ? <FeedbackPage onSubmit={submitFeedback} onCancel={navigationHistory.length ? goBack : ()=>navigate('navigator')}/>
              : view === 'admin'
                ? <AdminHome onNavigate={navigate} avatars={avatarLibrary}/>
                : view === 'avatar_library'
                  ? <AvatarLibraryManagement isAdmin={profile.role === 'creator_admin'} onChanged={refreshAvatarLibrary}/>
                : view === 'team'
                  ? <TeamManagement avatars={avatarLibrary}/>
                  : view === 'usage'
                    ? <UsageAnalytics onOpenSavedNotes={openSavedNotes}/>
                    : view === 'saved_notes'
                      ? <SavedNotesPage initialUserId={savedNotesUserId}/>
                      : view === 'my_saved_notes'
                        ? <MySavedNotesPage initialNoteId={mySavedNoteId}/>
                        : <FeedbackQueue onOpenPage={openFeedbackTarget}/>
    return <>
      <AppShell
        profile={profile}
        currentView={view}
        onNavigate={navigate}
        onBack={goBack}
        canGoBack={navigationHistory.length > 0}
        onOpenReadinessResource={openReadinessResource}
        theme={theme}
        onThemeChange={changeTheme}
        onOpenMySavedNotes={openMySavedNotes}
        documentationHandoff={documentationHandoff}
        onDocumentationHandoffApplied={clearDocumentationHandoff}
        callResetToken={callResetToken}
        onFeedback={submitFeedback}
        reportContext={reportContext}
        avatars={avatarLibrary}
        onPasswordChange={changeOwnPassword}
        onAvatarChange={async avatarId=>{await updateOwnAvatar(avatarId);setProfile(current=>({...current,avatar_id:avatarId}))}}
        onMeetOzzie={replayOzzieIntro}
        canMeetOzzie
        onLogout={async()=>{await signOut();setProfile(null);setNavigationHistory([]);setOzzieIntroOpen(false);setOzzieIntroReplay(false)}}
      >{content}</AppShell>
      <OzzieWelcome
        open={ozzieIntroOpen}
        replay={ozzieIntroReplay}
        videoSrc={ozzieIntroVideoSrc}
        busy={ozzieIntroSaving}
        error={ozzieIntroError}
        onContinue={finishOzzieIntro}
        onClose={finishOzzieIntro}
      />
    </>
  }

  if (activationOpen) return <main className="access-shell" style={accessStyle}><section className="access-card activation-card"><ActivateAccountForm onActivate={activateAccount} onCancel={()=>setActivationOpen(false)}/></section></main>
  return <main className="access-shell access-shell-login" style={accessStyle}>
    <div className="login-layout">
      <section className="access-card login-card" aria-label="Ozzie sign in">
        <header className="login-welcome">
          <h1>Welcome Back!</h1>
          <p>Sign in to your Ozzie account</p>
        </header>
        <form onSubmit={submit} noValidate>
          <label>Username<span className="access-input"><svg data-testid="username-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" /></svg><input name="username" autoComplete="username" placeholder="Enter your username" required aria-invalid={errorField === 'username' ? 'true' : undefined} aria-describedby={errorField === 'username' ? 'login-error' : undefined} /></span></label>
          <label>Password<span className="access-input"><svg data-testid="password-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M6 10V7a6 6 0 0 1 12 0v3M5 10h14a2 2 0 0 1 2 2v9H3v-9a2 2 0 0 1 2-2Z" /></svg><input name="password" type={showPassword?'text':'password'} autoComplete="current-password" placeholder="Enter your password" required aria-invalid={errorField === 'password' ? 'true' : undefined} aria-describedby={errorField === 'password' ? 'login-error' : undefined} /><button className="password-toggle" type="button" aria-label={showPassword?'Hide password':'Show password'} onClick={()=>setShowPassword(value=>!value)}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button></span></label>
          {error && <p id="login-error" role="alert">{error}</p>}
          <button className="sign-in-button" type="submit">Sign In <span aria-hidden="true">→</span></button>
        </form>
        <button className="link-button" type="button" onClick={() => setActivationOpen(!activationOpen)}>Activate Account</button>
        <div className="access-card-footer">Better support. Smarter workflows.</div>
      </section>

      <aside className="login-brand-panel" aria-label="Ozzie workspace introduction">
        <img
          className="login-brand-logo"
          src={assetUrl('assets/ozzie-hq.png?v=8071125')}
          alt="Ozzie — Ogletree Support Workspace"
        />
        <p className="login-brand-support">Your guide to faster answers<br />and better support.</p>
        <p className="login-brand-script">One workspace.<br />Clearer paths.<br />Faster answers.</p>
      </aside>
    </div>
  </main>
}
