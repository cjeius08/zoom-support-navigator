import { useEffect, useRef, useState } from 'react'
import { assetUrl } from '../../lib/assetUrl'
import { avatarUrl } from '../profile/avatarCatalog'
import { AvatarPicker } from '../profile/AvatarPicker'
import { CONSOLE_METADATA, formatShortConsoleDate, lastUpdatedForAudience } from '../updates/updatesData'
import '../updates/updates.css'
import { useDialogFocus } from '../../lib/useDialogFocus'
import { GlobalFeedbackButton } from '../feedback/GlobalFeedbackButton'
import { CallDocumentation } from '../training/CallDocumentation'
import { ScopeCheck } from '../live/ScopeCheck'
import { ReadinessLab } from '../readiness/ReadinessLab'

function Icon({ type }) {
  const paths = {
    navigator: 'M4 11.5 12 4l8 7.5v8.5H4z',
    favorites: 'M12 3.4 14.6 8.7l5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.2-4.1 5.8-.8L12 3.4Z',
    training: 'M4 5h6a3 3 0 0 1 2 3v12a3 3 0 0 0-2-1H4zM20 5h-6a3 3 0 0 0-2 3v12a3 3 0 0 1 2-1h6z',
    readiness: 'M5 4h14v16H5zM8 8h8M8 12h5M8 16h3M15 15l1.5 1.5L20 13',
    updates: 'M12 4v8l4 2M4 12a8 8 0 1 0 2.3-5.7L4 8M4 4v4h4',
    feedback: 'M5 5h14v10H9l-4 4z',
    admin: 'M12 3l8 4v5c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7z',
    team: 'M16 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M17 11a3 3 0 0 0-1-5.8M21 20v-2a4 4 0 0 0-2.7-3.8',
    usage: 'M5 20V10M12 20V4M19 20v-7',
    feedback_queue: 'M5 4h14v16H5zM8 9h8M8 13h6',
    avatars: 'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4 21a8 8 0 0 1 16 0M4 13a3 3 0 1 0 0 6M20 13a3 3 0 1 1 0 6',
    notes: 'M6 3h9l3 3v15H6zM9 10h6M9 14h6M9 18h4M15 3v4h4',
    documentation: 'M6 3h9l3 3v15H6zM9 10h6M9 14h6M9 18h4M15 3v4h4',
    scope_check: 'M12 3l7 4v5c0 4.5-3 7.2-7 8-4-.8-7-3.5-7-8V7zM9 12l2 2 4-5',
  }
  return <svg data-testid="nav-icon" aria-hidden="true" viewBox="0 0 24 24"><path d={paths[type] || paths.feedback} /></svg>
}

function NavDropdown({ label, active = false, children }) {
  return <details
    name="ozzie-primary-navigation"
    className={`topnav-dropdown ${active ? 'active' : ''}`}
    onToggle={event => {
      if (!event.currentTarget.open) return
      const navigation = event.currentTarget.closest('nav')
      navigation?.querySelectorAll('details.topnav-dropdown[open]').forEach(detail => {
        if (detail !== event.currentTarget) detail.removeAttribute('open')
      })
    }}
  >
    <summary>{label}<svg className="topnav-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5" /></svg></summary>
    <div className="topnav-menu" role="group" aria-label={`${label} menu`}>{children}</div>
  </details>
}

export function AppShell({ profile, children, onLogout, onAvatarChange, onPasswordChange, onMeetOzzie = () => {}, canMeetOzzie = false, currentView = 'navigator', onNavigate = () => {}, onBack = () => {}, canGoBack = false, onOpenReadinessResource = () => {}, onOpenMySavedNotes = () => {}, documentationHandoff = null, onDocumentationHandoffApplied = () => {}, theme = 'ozzie', onThemeChange = () => {}, onFeedback, reportContext = {}, avatars }) {
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [appearanceOpen, setAppearanceOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profileErrorField, setProfileErrorField] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [liveTools, setLiveTools] = useState({
    documentation: 'closed',
    scope_check: 'closed',
    readiness: 'closed',
  })
  const [compactNav, setCompactNav] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 800)
  useEffect(() => {
    if (!documentationHandoff?.id) return
    setLiveTools(current => {
      const next = { ...current, documentation: 'open' }
      Object.keys(next).forEach(key => {
        if (key !== 'documentation' && next[key] === 'open') next[key] = 'minimized'
      })
      return next
    })
  }, [documentationHandoff?.id])

  const profileDialogRef = useRef(null)
  const menuToggleRef = useRef(null)
  const isAdmin = profile.role === 'creator_admin'
  const accountRoleLabel = isAdmin ? 'Admin' : profile.workspace_role === 'lead' ? 'Lead' : 'Member'
  const style = { '--workspace-image': `url(${assetUrl('assets/login-workspace-background.png')})` }
  const visibleLastUpdated = lastUpdatedForAudience(isAdmin)

  const minimizedLiveTools = Object.entries(liveTools)
    .filter(([, state]) => state === 'minimized')
    .map(([id]) => id)

  const callFlowActive = currentView === 'my_saved_notes' || liveTools.documentation !== 'closed' || liveTools.scope_check !== 'closed'
  const knowledgeActive = ['favorites', 'process_documents', 'training', 'updates'].includes(currentView)
  const reportsActive = ['feedback', 'usage', 'feedback_queue'].includes(currentView)
  const adminActive = ['admin', 'team', 'avatar_library', 'saved_notes'].includes(currentView)

  function openLiveTool(id) {
    setLiveTools(current => {
      const next = { ...current }
      Object.keys(next).forEach(key => {
        if (key === id) next[key] = 'open'
        else if (next[key] === 'open') next[key] = 'minimized'
      })
      return next
    })
  }

  function toggleLiveToolMinimized(id) {
    setLiveTools(current => {
      const next = { ...current }
      if (current[id] === 'minimized') {
        Object.keys(next).forEach(key => {
          if (key === id) next[key] = 'open'
          else if (next[key] === 'open') next[key] = 'minimized'
        })
      } else if (current[id] === 'open') {
        next[id] = 'minimized'
      }
      return next
    })
  }

  function closeLiveTool(id) {
    setLiveTools(current => ({ ...current, [id]: 'closed' }))
  }

  function closeProfile() {
    setProfileOpen(false)
    setAvatarOpen(false)
    setPasswordOpen(false)
    setAppearanceOpen(false)
    setProfileError('')
    setProfileErrorField('')
  }

  function closeNavigation({ restoreFocus = false } = {}) {
    setOpen(false)
    if (restoreFocus) window.requestAnimationFrame(() => menuToggleRef.current?.focus())
  }

  function finishNav(event) {
    event.currentTarget.closest('details')?.removeAttribute('open')
    closeNavigation()
  }

  function navigateFromHeader(event, view) {
    finishNav(event)
    onNavigate(view)
  }

  function openToolFromHeader(event, id) {
    finishNav(event)
    openLiveTool(id)
  }

  useEffect(() => {
    const updateCompactNav = () => {
      const compact = window.innerWidth <= 800
      setCompactNav(compact)
      if (!compact) setOpen(false)
    }
    window.addEventListener('resize', updateCompactNav)
    updateCompactNav()
    return () => window.removeEventListener('resize', updateCompactNav)
  }, [])

  useDialogFocus(profileDialogRef, profileOpen, closeProfile)

  async function submitPassword(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const password = String(form.get('password'))
    const confirm = String(form.get('confirm'))
    setMessage('')
    if (password.length < 8) {
      setProfileErrorField('password')
      return setProfileError('Password must be at least 8 characters.')
    }
    if (password !== confirm) {
      setProfileErrorField('confirm')
      return setProfileError('Passwords do not match.')
    }
    setProfileError('')
    setProfileErrorField('')
    setPasswordSaving(true)
    try {
      await onPasswordChange?.(password)
      setMessage('Password changed.')
      setPasswordOpen(false)
    } catch (changeError) {
      setProfileErrorField('password')
      setProfileError(changeError?.message || 'Could not change password.')
    } finally {
      setPasswordSaving(false)
    }
  }

  return <div className="app-shell app-shell-horizontal" style={style}>
    <header className="app-header app-header-horizontal">
      <div className="app-header-brand-row">
        <div className="ozzie-brand-dock" aria-label="Ozzie — Ogletree Support Workspace">
          <img src={assetUrl('assets/ozzie-hq.png')} alt="Ozzie — Ogletree Support Workspace" />
        </div>

        <button
          ref={menuToggleRef}
          className="menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen(value => !value)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          <span>Menu</span>
        </button>

        <button className="account-menu" aria-expanded={profileOpen} aria-label={`${profile.username} account`} onClick={() => { const next = !profileOpen; setProfileOpen(next); if (next) { setMessage(''); setProfileError(''); setProfileErrorField('') } }}>
          {avatarUrl(profile.avatar_id, avatars) ? <img src={avatarUrl(profile.avatar_id, avatars)} alt="" /> : <span className="avatar-fallback">{profile.initials}</span>}
          <span className="account-copy"><strong>{profile.username}</strong><small>{accountRoleLabel}</small></span>
          <svg className="chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5" /></svg>
        </button>
      </div>

      <nav
        id="primary-navigation"
        className={`top-navigation ${open ? 'open' : ''}`}
        aria-label="Primary navigation"
        aria-hidden={compactNav ? String(!open) : undefined}
        inert={compactNav && !open ? true : undefined}
        onKeyDown={event => {
          if (compactNav && open && event.key === 'Escape') {
            event.preventDefault()
            closeNavigation({ restoreFocus: true })
          }
        }}
      >
        <button
          type="button"
          className={`topnav-link ${currentView === 'navigator' ? 'active' : ''}`}
          aria-current={currentView === 'navigator' ? 'page' : undefined}
          onClick={event => navigateFromHeader(event, 'navigator')}
        >Home</button>

        <NavDropdown label="Call Flow" active={callFlowActive}>
          <button type="button" aria-label="Call Documentation" aria-pressed={liveTools.documentation !== 'closed'} onClick={event => openToolFromHeader(event, 'documentation')}><Icon type="documentation" /><span><strong>Call Documentation</strong><small>Capture notes without leaving your current page.</small></span></button>
          <button type="button" aria-label="My Saved Notes" onClick={event => { finishNav(event); onOpenMySavedNotes('') }}><Icon type="notes" /><span><strong>My Saved Notes</strong><small>Review your saved notes and follow-ups.</small></span></button>
          <button type="button" aria-label="Scope Check" aria-pressed={liveTools.scope_check !== 'closed'} onClick={event => openToolFromHeader(event, 'scope_check')}><Icon type="scope_check" /><span><strong>Scope Check</strong><small>Confirm the correct support boundary and next step.</small></span></button>
        </NavDropdown>

        <NavDropdown label="Knowledge" active={knowledgeActive}>
          <button type="button" aria-label="Favorites" onClick={event => navigateFromHeader(event, 'favorites')}><Icon type="favorites" /><span><strong>Favorites</strong><small>Your saved support references.</small></span></button>
          <button type="button" aria-label="Process Documents" onClick={event => navigateFromHeader(event, 'process_documents')}><Icon type="documentation" /><span><strong>Process Documents</strong><small>Original source pages organized by process title.</small></span></button>
          <button type="button" aria-label="Training & Resources" onClick={event => navigateFromHeader(event, 'training')}><Icon type="training" /><span><strong>Training & Resources</strong><small>Guides, scripts, visual lessons, and training.</small></span></button>
          <button type="button" aria-label="What’s New / Updates" onClick={event => navigateFromHeader(event, 'updates')}><Icon type="updates" /><span><strong>What’s New / Updates</strong><small>Recent workspace changes and release notes.</small></span></button>
        </NavDropdown>

        <button
          type="button"
          className={`topnav-link ${liveTools.readiness !== 'closed' ? 'active' : ''}`}
          aria-pressed={liveTools.readiness !== 'closed'}
          onClick={event => openToolFromHeader(event, 'readiness')}
        >Readiness Lab</button>

        <NavDropdown label="Reports" active={reportsActive}>
          <button type="button" aria-label="Feedback" onClick={event => navigateFromHeader(event, 'feedback')}><Icon type="feedback" /><span><strong>Feedback</strong><small>Send an issue, suggestion, or workspace report.</small></span></button>
          {isAdmin && <button type="button" aria-label="Usage Analytics" onClick={event => navigateFromHeader(event, 'usage')}><Icon type="usage" /><span><strong>Usage Analytics</strong><small>Review workspace usage and activity.</small></span></button>}
          {isAdmin && <button type="button" aria-label="Feedback Queue" onClick={event => navigateFromHeader(event, 'feedback_queue')}><Icon type="feedback_queue" /><span><strong>Feedback Queue</strong><small>Review and manage submitted feedback.</small></span></button>}
        </NavDropdown>

        {isAdmin && <NavDropdown label="Admin" active={adminActive}>
          <button type="button" aria-label="Admin Home" onClick={event => navigateFromHeader(event, 'admin')}><Icon type="admin" /><span><strong>Admin Home</strong><small>Workspace administration overview.</small></span></button>
          <button type="button" aria-label="Saved Notes" onClick={event => navigateFromHeader(event, 'saved_notes')}><Icon type="notes" /><span><strong>Saved Notes</strong><small>Review protected notes and follow-ups.</small></span></button>
          <button type="button" aria-label="Team Management" onClick={event => navigateFromHeader(event, 'team')}><Icon type="team" /><span><strong>Team Management</strong><small>Manage users, access, and accounts.</small></span></button>
          <button type="button" aria-label="Avatar Library" onClick={event => navigateFromHeader(event, 'avatar_library')}><Icon type="avatars" /><span><strong>Avatar Library</strong><small>Add or remove available profile avatars.</small></span></button>
        </NavDropdown>}
      </nav>
    </header>

    {open && <button type="button" className="nav-backdrop" aria-label="Close navigation" onClick={() => closeNavigation({ restoreFocus: true })} />}

    <main className="app-main app-main-horizontal">
      {currentView !== 'navigator' && <div className="workspace-page-nav">
        <button
          type="button"
          className="workspace-back-button"
          onClick={onBack}
          disabled={!canGoBack}
          aria-label="Back to previous page"
          title={canGoBack ? 'Back to previous page' : 'No previous page'}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6M8 12h10" /></svg>
          <span>Back</span>
        </button>
      </div>}
      {children}

      <footer className="workspace-meta-footer" aria-label="Console metadata">
        <strong>Workspace v{CONSOLE_METADATA.version}</strong>
        <span>Updated {formatShortConsoleDate(visibleLastUpdated)} · Next review {formatShortConsoleDate(CONSOLE_METADATA.nextReview)}</span>
        <span>Workspace Lead {CONSOLE_METADATA.owner}</span>
        <span>Collaborator {CONSOLE_METADATA.collaborator}</span>
      </footer>
    </main>

    <CallDocumentation
      open={liveTools.documentation !== 'closed'}
      onOpenSavedNotes={noteId => onOpenMySavedNotes(noteId)}
      minimized={liveTools.documentation === 'minimized'}
      stackIndex={minimizedLiveTools.indexOf('documentation')}
      prefill={documentationHandoff}
      onPrefillApplied={onDocumentationHandoffApplied}
      onMinimize={() => toggleLiveToolMinimized('documentation')}
      onClose={() => closeLiveTool('documentation')}
    />
    <ScopeCheck
      open={liveTools.scope_check !== 'closed'}
      minimized={liveTools.scope_check === 'minimized'}
      stackIndex={minimizedLiveTools.indexOf('scope_check')}
      onMinimize={() => toggleLiveToolMinimized('scope_check')}
      onClose={() => closeLiveTool('scope_check')}
    />
    <ReadinessLab
      open={liveTools.readiness !== 'closed'}
      minimized={liveTools.readiness === 'minimized'}
      stackIndex={minimizedLiveTools.indexOf('readiness')}
      onMinimize={() => toggleLiveToolMinimized('readiness')}
      onClose={() => closeLiveTool('readiness')}
      onOpenResource={onOpenReadinessResource}
    />

    <GlobalFeedbackButton currentView={currentView} reportContext={reportContext} onSubmit={onFeedback} />

    {profileOpen && <div className="modal-backdrop" role="presentation" onClick={event => event.target === event.currentTarget && closeProfile()}><div ref={profileDialogRef} tabIndex={-1} className="profile-panel" role="dialog" aria-modal="true" aria-labelledby="profile-title"><div className="profile-summary">{avatarUrl(profile.avatar_id, avatars) ? <img src={avatarUrl(profile.avatar_id, avatars)} alt="" /> : <span className="avatar-fallback">{profile.initials}</span>}<div><h2 id="profile-title">My Profile</h2><strong>{profile.username}</strong><p>{profile.initials} · {accountRoleLabel}</p></div></div>{message && <p className="success-message" role="status">{message}</p>}{profileError && <p id="profile-error" role="alert">{profileError}</p>}{avatarOpen ? <AvatarPicker selectedId={profile.avatar_id} avatars={avatars} onCancel={() => setAvatarOpen(false)} onSave={async id => { setMessage(''); setProfileError(''); setProfileErrorField(''); try { await onAvatarChange?.(id); setAvatarOpen(false); setMessage('Avatar updated.') } catch (avatarError) { setProfileError(avatarError?.message || 'Could not update avatar.') } }} /> : passwordOpen ? <form onSubmit={submitPassword} noValidate><h3>Change Password</h3><label>New password<input name="password" type="password" autoComplete="new-password" disabled={passwordSaving} aria-invalid={profileErrorField === 'password' ? 'true' : undefined} aria-describedby={profileErrorField === 'password' ? 'profile-error' : undefined} /></label><label>Confirm password<input name="confirm" type="password" autoComplete="new-password" disabled={passwordSaving} aria-invalid={profileErrorField === 'confirm' ? 'true' : undefined} aria-describedby={profileErrorField === 'confirm' ? 'profile-error' : undefined} /></label><div className="dialog-actions"><button type="button" disabled={passwordSaving} onClick={() => setPasswordOpen(false)}>Cancel</button><button disabled={passwordSaving}>{passwordSaving ? 'Saving…' : 'Save Password'}</button></div></form> : appearanceOpen ? <section className="theme-picker" aria-labelledby="appearance-title">
      <div className="theme-picker-copy">
        <h3 id="appearance-title">Appearance</h3>
        <p>Choose a color theme. Ozzie branding, logo, layout, content, and features stay unchanged.</p>
      </div>
      <div className="theme-options" role="group" aria-label="Workspace theme">
        <button type="button" className="theme-option" data-theme-option="ozzie" aria-pressed={theme === 'ozzie'} onClick={() => onThemeChange('ozzie')}>
          <span className="theme-preview-swatch" aria-hidden="true"><span></span><span></span><span></span></span>
          <strong>Ozzie Original</strong>
          <small>The original Ozzie navy, cyan, and blue workspace colors.</small>
        </button>
        <button type="button" className="theme-option" data-theme-option="alaga" aria-pressed={theme === 'alaga'} onClick={() => onThemeChange('alaga')}>
          <span className="theme-preview-swatch" aria-hidden="true"><span></span><span></span><span></span></span>
          <strong>Alaga Theme</strong>
          <small>Ozzie with the Alaga red and coral color palette only.</small>
        </button>
      </div>
      <div className="theme-picker-actions"><button type="button" onClick={() => setAppearanceOpen(false)}>Back to Profile</button></div>
    </section> : <div className="profile-actions">{canMeetOzzie && <button onClick={() => { closeProfile(); onMeetOzzie?.() }}>Meet Ozzie Again</button>}<button onClick={() => { setMessage(''); setProfileError(''); setProfileErrorField(''); setAvatarOpen(true) }}>Change Avatar</button><button onClick={() => { setMessage(''); setProfileError(''); setProfileErrorField(''); setPasswordOpen(true) }}>Change Password</button><button onClick={() => { setMessage(''); setProfileError(''); setProfileErrorField(''); setAppearanceOpen(true) }}>Appearance</button><button onClick={onLogout}>Logout</button></div>}</div></div>}
  </div>
}
