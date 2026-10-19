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
import { FlexHubReference } from './features/knowledge/FlexHubReference'
import { useFavorites } from './features/favorites/useFavorites'
import { useRecentlyViewed } from './features/favorites/useRecentlyViewed'
import { findCommandPage } from './features/command/commandSearch'
import { OzzieWelcome } from './features/onboarding/OzzieWelcome'
import { assetUrl } from './lib/assetUrl'
import { OzzieBrandImage } from './components/OzzieBrandImage'
import { useUsageTracking } from './features/analytics/usePresence'
import { completeWorkspaceNavigation, createWorkspaceNavigationState, resolveWorkspaceNavigationState, startWorkspaceNavigation } from './lib/workspaceNavigationHistory'
import { applyTheme, readStoredTheme, storeTheme } from './features/theme/theme'
import './styles.css'
import './accessibility-ui.css'
import './features/shell/responsiveShell.css'
import './features/shell/headerNavRevamp.css'
import './features/shell/loginRevamp.css'
import './features/theme/themeSystem.css'
import './features/theme/dayNight.css'
import './features/theme/typography.css'
import './features/theme/logoLock.css'
import './features/theme/foundation.css'
import './features/shell/headerReadability.css'
import './features/theme/readabilityTokens.css'
import './features/theme/readabilityKnowledge.css'
import './features/theme/readabilityFlows.css'
import './features/theme/readabilityDocumentation.css'
import './features/theme/readabilityAdmin.css'
import './pilotReadiness.css'
import './features/theme/zoomReadability.css'
import './features/theme/workspaceBatch1.css'
import './features/theme/workspaceBatch2.css'
import './features/theme/readabilitySearchHostFix.css'
import './features/theme/batch2Cleanup.css'
import './features/theme/workspaceBatch3.css'
import './features/theme/workspaceBatch4.css'
import './features/shell/headerBatch5.css'
import './features/dashboard/dashboardBatch6.css'
import './features/dashboard/dashboardReference.css'
import './features/shell/headerReference.css'
import './features/shell/headerOverlapFix.css'
import './features/theme/linearBlueBlack.css'
import './features/theme/finalQaBatch9.css'
import './features/theme/faqCompact.css'
import './features/command/commandCenter.css'
import './features/shell/batch12Login.css'

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
  const [sessionStartupError, setSessionStartupError] = useState('')
  const [sessionRetry, setSessionRetry] = useState(0)
  const [signingIn, setSigningIn] = useState(false)
  const [signInPhase, setSignInPhase] = useState('')
  const [signInSlow, setSignInSlow] = useState(false)
  const signInBusyRef = useRef(false)
  const slowLoginTimerRef = useRef(null)
  const [view, setView] = useState('navigator')
  const [commandOpen, setCommandOpen] = useState(false)
  const [commandRole, setCommandRole] = useState('Host')
  const [commandLaunch, setCommandLaunch] = useState(null)
  const consumeCommandLaunch = useCallback(() => setCommandLaunch(null), [])
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
    setCommandLaunch(null)
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

  function selectCommandResult(item) {
    if (item.kind === 'page') {
      if (!findCommandPage(item.id, profile?.role === 'creator_admin')) return
      navigate(item.id)
      return
    }
    if (!['process','issue','host','roadblock','faq'].includes(item.kind)) return
    const role = item.role === 'Participant' ? 'Participant' : 'Host'
    setCommandRole(role)
    navigate('navigator')
    // A new object for every selection reopens even the same guide, without
    // remounting Navigator or losing a separate Call Documentation draft.
    setCommandLaunch({ kind: item.kind, id: item.id, role })
    trackEvent({ eventType: 'tool_open', routeId: 'navigator', toolId: 'command_center' })
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
      current_section: 'Zoom Training Environment',
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
    const safeRoutes = new Set(['navigator', 'favorites', 'process_documents', 'flex_hub', 'training', 'updates', 'feedback', 'admin', 'avatar_library', 'team', 'usage', 'saved_notes', 'my_saved_notes', 'feedback_queue'])
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

  useEffect(() => {
    let active = true
    let timeoutId
    setLoading(true)
    setSessionStartupError('')
    // A slow or disconnected auth service should not leave the login gate
    // spinning forever. This is a read-only lookup; Retry is safe.
    const deadline = new Promise((_, reject) => {
      timeoutId = window.setTimeout(() => reject(new Error('Session check timed out')), 16000)
    })
    Promise.race([getCurrentProfile(), deadline])
      .then(currentProfile => { if (active) setProfile(currentProfile) })
      .catch(() => {
        if (active) setSessionStartupError('Could not check your saved session. Your account has not been signed out.')
      })
      .finally(() => {
        window.clearTimeout(timeoutId)
        if (active) setLoading(false)
      })
    return () => {
      active = false
      window.clearTimeout(timeoutId)
    }
  }, [sessionRetry])

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
    // Synchronous lock: prevents repeated requests to the auth service (which
    // enforces temporary account lockouts after failed password attempts).
    if (signInBusyRef.current) return
    const form = new FormData(event.currentTarget)
    const result = validateCredentials(String(form.get('username')), String(form.get('password')))
    const validationField = Object.keys(result.errors)[0]
    if (validationField) {
      setErrorField(validationField)
      setError(result.errors[validationField])
      return
    }

    signInBusyRef.current = true
    setSigningIn(true)
    setSignInPhase('Connecting securely…')
    setSignInSlow(false)
    setError('')
    setErrorField('')
    slowLoginTimerRef.current = window.setTimeout(() => setSignInSlow(true), 7000)
    try {
      setNavigationHistory([])
      const authenticatedProfile = await loginWithUsername(result.username, String(form.get('password')), setSignInPhase)
      setProfile(authenticatedProfile)
    } catch (loginError) {
      setErrorField('username')
      setError(loginError?.message || 'Unable to sign in. Please try again.')
    } finally {
      if (slowLoginTimerRef.current !== null) window.clearTimeout(slowLoginTimerRef.current)
      slowLoginTimerRef.current = null
      signInBusyRef.current = false
      setSigningIn(false)
      setSignInSlow(false)
      setSignInPhase('')
    }
  }

  if (loading) return <main className="access-shell"><p role="status">Loading secure session…</p></main>
  if (sessionStartupError) return <main className="access-shell">
    <section className="access-card login-card" aria-label="Session connection issue">
      <h1>Session check is taking longer than expected</h1>
      <p role="alert">{sessionStartupError}</p>
      <p>Check your connection and try again. No account details have been changed.</p>
      <button type="button" className="sign-in-button" onClick={() => setSessionRetry(value => value + 1)}>Retry session check</button>
      <button type="button" className="link-button" onClick={async () => {
        try { await signOut() }
        finally { setProfile(null); setSessionStartupError('') }
      }}>Sign out instead</button>
    </section>
  </main>
  if (profile?.must_change_password) return <ForcePasswordChange onChange={async password => { await changeOwnPassword(password); setProfile(await getCurrentProfile()) }} onLogout={async () => { await signOut(); setProfile(null) }} />
  if (profile) {
    const content = view === 'navigator'
      ? <Navigator
          profile={profile}
          onOpenFavorites={() => navigate('favorites')}
          onOpenFeedback={() => navigate('feedback')}
          onOpenUpdates={() => navigate('updates')}
          theme={theme}
          onThemeChange={changeTheme}
          isAdmin={profile.role === 'creator_admin'}
          onOpenTraining={openTraining}
          onOpenFlexHub={() => navigate('flex_hub')}
          onOpenDeviceSandbox={openDeviceSandbox}
          onTrackEvent={trackEvent}
          onAddToDocumentation={addToCallDocumentation}
          onNewCall={() => { startNewCall(); setCommandRole('Host'); setCommandLaunch(null) }}
          initialProcessId={navigatorProcessId}
          initialCommonIssueId={navigatorCommonIssueId}
          initialRole={commandRole}
          commandLaunch={commandLaunch}
          onCallerRoleChange={setCommandRole}
          onCommandConsumed={consumeCommandLaunch}
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
          ? <ProcessDocuments onTrackEvent={trackEvent} onReportContextChange={updateReportContext} onOpenReference={navigate}/>
        : view === 'flex_hub'
          ? <FlexHubReference onOpenVideo={openTraining} onReportContextChange={updateReportContext} trackEvent={trackEvent}/>
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
        onDashboardSearch={() => setCommandOpen(true)}
        commandOpen={commandOpen}
        commandRole={commandRole}
        onCommandClose={() => setCommandOpen(false)}
        onCommandSelect={selectCommandResult}
        onDashboardUpdates={() => navigate('updates')}
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
  return <main className="access-shell access-shell-login">
    <div className="login-layout">
      <aside className="login-brand-panel" aria-label="Introducing Ozzie for Ogletree">
        <div className="login-brand-plate"><OzzieBrandImage variant="full" className="login-brand-logo" /></div>
        <div className="login-brand-headline">
          <h2>Work smarter<br /><span>with Ozzie</span></h2>
          <p>One workspace. Clearer paths. Faster answers.</p>
        </div>
        <div className="login-benefits">
          <div className="login-benefit">
            <span className="login-benefit-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 4h16v12H9l-5 4V4Z" /><path d="M8 9h8M8 12h5" /></svg></span>
            <div><strong>Get answers faster</strong><p>Find the help you need, when you need it, in one place.</p></div>
          </div>
          <div className="login-benefit">
            <span className="login-benefit-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></span>
            <div><strong>Stay organized</strong><p>Access tools, resources, and guides in one workspace.</p></div>
          </div>
          <div className="login-benefit">
            <span className="login-benefit-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M13 2 4 13h7l-1 9 10-12h-7V2Z" /></svg></span>
            <div><strong>Do more, together</strong><p>Work confidently with your team and move support forward.</p></div>
          </div>
        </div>
      </aside>

      <section className="access-card login-card" aria-label="Ozzie sign in">
        <div className="login-brand-plate login-form-brand"><OzzieBrandImage variant="full" className="login-brand-logo" /></div>
        <header className="login-welcome">
          <h1>Welcome Back!</h1>
          <p>Sign in to your Ozzie account</p>
        </header>
        <form onSubmit={submit} noValidate>
          <label>Username<span className="access-input"><svg data-testid="username-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" /></svg><input name="username" autoComplete="username" placeholder="Enter your username" disabled={signingIn} required aria-invalid={errorField === 'username' ? 'true' : undefined} aria-describedby={errorField === 'username' ? 'login-error' : undefined} /></span></label>
          <label>Password<span className="access-input"><svg data-testid="password-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M6 10V7a6 6 0 0 1 12 0v3M5 10h14a2 2 0 0 1 2 2v9H3v-9a2 2 0 0 1 2-2Z" /></svg><input name="password" type={showPassword?'text':'password'} autoComplete="current-password" placeholder="Enter your password" disabled={signingIn} required aria-invalid={errorField === 'password' ? 'true' : undefined} aria-describedby={errorField === 'password' ? 'login-error' : undefined} /><button className="password-toggle" type="button" disabled={signingIn} aria-label={showPassword?'Hide password':'Show password'} onClick={()=>setShowPassword(value=>!value)}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button></span></label>
          {error && <p id="login-error" role="alert">{error}</p>}
          {signingIn && <div className="ozzie-login-progress" role="status" aria-live="polite">
            <span className="ozzie-login-progress-dot" aria-hidden="true" />
            <span>{signInPhase}</span>
            {signInSlow && <small>The secure login service is responding slowly. Please wait—do not submit again.</small>}
          </div>}
          <button className="sign-in-button" type="submit" disabled={signingIn} aria-busy={signingIn}>
            {signingIn ? 'Signing In…' : 'Sign In'} <span aria-hidden="true">{signingIn ? '·' : '→'}</span>
          </button>
        </form>
        <div className="login-activation">
          <span>Have an invite code?</span>
          <button className="link-button" type="button" onClick={() => setActivationOpen(!activationOpen)}>Activate Account</button>
        </div>
        <div className="access-card-footer">Better support. Smarter workflows.</div>
      </section>
    </div>
  </main>
}
