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

const agentLinks = [['navigator', 'Navigator', 'page'], ['favorites', 'Favorites', 'page'], ['documentation', 'Call Documentation', 'tool'], ['scope_check', 'Scope Check', 'tool'], ['training', 'Training & Resources', 'page'], ['readiness', 'Readiness Lab', 'tool'], ['updates', 'What’s New / Updates', 'page'], ['feedback', 'Feedback', 'page']]
const adminLinks = [['admin', 'Admin Home', 'page'], ['team', 'Team Management', 'page'], ['usage', 'Usage Analytics', 'page'], ['feedback_queue', 'Feedback Queue', 'page']]

function Icon({ type }) { const paths = { navigator: 'M4 11.5 12 4l8 7.5v8.5H4z', favorites: 'M12 3.4 14.6 8.7l5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.2-4.1 5.8-.8L12 3.4Z', training: 'M4 5h6a3 3 0 0 1 2 3v12a3 3 0 0 0-2-1H4zM20 5h-6a3 3 0 0 0-2 3v12a3 3 0 0 1 2-1h6z', readiness: 'M5 4h14v16H5zM8 8h8M8 12h5M8 16h3M15 15l1.5 1.5L20 13', updates: 'M12 4v8l4 2M4 12a8 8 0 1 0 2.3-5.7L4 8M4 4v4h4', feedback: 'M5 5h14v10H9l-4 4z', admin: 'M12 3l8 4v5c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7z', team: 'M16 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M17 11a3 3 0 0 0-1-5.8M21 20v-2a4 4 0 0 0-2.7-3.8', usage: 'M5 20V10M12 20V4M19 20v-7', feedback_queue: 'M5 4h14v16H5zM8 9h8M8 13h6', documentation: 'M6 3h9l3 3v15H6zM9 10h6M9 14h6M9 18h4M15 3v4h4', scope_check: 'M12 3l7 4v5c0 4.5-3 7.2-7 8-4-.8-7-3.5-7-8V7zM9 12l2 2 4-5' }; return <svg data-testid="nav-icon" aria-hidden="true" viewBox="0 0 24 24"><path d={paths[type] || paths.feedback} /></svg> }

export function AppShell({ profile, children, onLogout, onAvatarChange, onPasswordChange, onMeetOzzie = () => {}, canMeetOzzie = false, currentView = 'navigator', onNavigate = () => {}, onOpenReadinessResource = () => {}, onFeedback, reportContext = {} }) {
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profileErrorField, setProfileErrorField] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [activeLiveTool, setActiveLiveTool] = useState(null)
  const [liveToolMinimized, setLiveToolMinimized] = useState(false)
  const [compactNav, setCompactNav] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 800)
  const profileDialogRef = useRef(null)
  const menuToggleRef = useRef(null)
  const isAdmin = profile.role === 'creator_admin'
  const accountRoleLabel = isAdmin ? 'Admin' : profile.workspace_role === 'lead' ? 'Lead' : 'Member'
  const visibleLinks = isAdmin ? [...agentLinks, ...adminLinks] : agentLinks
  const style = { '--workspace-image': `url(${assetUrl('assets/login-workspace-background.png')})` }
  const visibleLastUpdated = lastUpdatedForAudience(isAdmin)

  function closeProfile() {
    setProfileOpen(false)
    setAvatarOpen(false)
    setPasswordOpen(false)
    setProfileError('')
    setProfileErrorField('')
  }

  function closeNavigation({ restoreFocus = false } = {}) {
    setOpen(false)
    if (restoreFocus) window.requestAnimationFrame(() => menuToggleRef.current?.focus())
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

  return <div className="app-shell" style={style}>
    <header className="app-header app-header-utility">
      <button
        ref={menuToggleRef}
        className="menu-toggle"
        type="button"
        aria-label="Toggle navigation"
        aria-expanded={open}
        aria-controls="primary-sidebar"
        onClick={() => setOpen(value => !value)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
      <div className="app-header-spacer" aria-hidden="true" />
      <button className="account-menu" aria-expanded={profileOpen} aria-label={`${profile.username} account`} onClick={() => { const next = !profileOpen; setProfileOpen(next); if (next) { setMessage(''); setProfileError(''); setProfileErrorField('') } }}>{avatarUrl(profile.avatar_id) ? <img src={avatarUrl(profile.avatar_id)} alt="" /> : <span className="avatar-fallback">{profile.initials}</span>}<span className="account-copy"><strong>{profile.username}</strong><small>{accountRoleLabel}</small></span><svg className="chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5" /></svg></button>
    </header>

    {open && <button type="button" className="sidebar-backdrop" aria-label="Close navigation" onClick={() => closeNavigation({ restoreFocus: true })} />}

    <aside
      id="primary-sidebar"
      className={`sidebar ${open ? 'open' : ''}`}
      aria-hidden={compactNav ? String(!open) : undefined}
      inert={compactNav && !open ? true : undefined}
      onKeyDown={event => {
        if (compactNav && open && event.key === 'Escape') {
          event.preventDefault()
          closeNavigation({ restoreFocus: true })
        }
      }}
    >
      <div className="sidebar-scroll-region">
        <div className="sidebar-brand" aria-label="Ozzie — Ogletree Support Workspace">
          <img src={assetUrl('assets/ozzie-approved-exact.png')} alt="Ozzie — Ogletree Support Workspace" />
        </div>
        <nav aria-label="Primary navigation">{visibleLinks.map(([id, label, kind]) => kind === 'tool'
          ? <button
              key={id}
              type="button"
              aria-pressed={activeLiveTool === id}
              className={activeLiveTool === id ? 'tool-open' : ''}
              onClick={() => {
                setActiveLiveTool(id)
                setLiveToolMinimized(false)
                closeNavigation()
              }}
            ><Icon type={id} /><span>{label}</span></button>
          : <button key={id} aria-current={currentView === id ? 'page' : undefined} className={currentView === id ? 'active' : ''} onClick={() => { onNavigate(id); closeNavigation() }}><Icon type={id} /><span>{label}</span></button>)}</nav>
      </div>
      <div className="sidebar-footer">
        <div className="console-meta-mini" aria-label="Console metadata">
          <strong>Workspace v{CONSOLE_METADATA.version}</strong>
          <span>Updated {formatShortConsoleDate(visibleLastUpdated)} · Next review {formatShortConsoleDate(CONSOLE_METADATA.nextReview)}</span>
          <span>Workspace Lead {CONSOLE_METADATA.owner}</span>
          <span>Collaborator {CONSOLE_METADATA.collaborator}</span>
        </div>
        <button className="logout-button" onClick={onLogout}>Logout</button>
      </div>
    </aside>

    <main className="app-main">{children}</main>

    <CallDocumentation
      open={activeLiveTool === 'documentation'}
      minimized={liveToolMinimized}
      onMinimize={() => setLiveToolMinimized(value => !value)}
      onClose={() => {
        setActiveLiveTool(null)
        setLiveToolMinimized(false)
      }}
    />
    <ScopeCheck
      open={activeLiveTool === 'scope_check'}
      minimized={liveToolMinimized}
      onMinimize={() => setLiveToolMinimized(value => !value)}
      onClose={() => {
        setActiveLiveTool(null)
        setLiveToolMinimized(false)
      }}
    />
    <ReadinessLab
      open={activeLiveTool === 'readiness'}
      minimized={liveToolMinimized}
      onMinimize={() => setLiveToolMinimized(value => !value)}
      onClose={() => {
        setActiveLiveTool(null)
        setLiveToolMinimized(false)
      }}
      onOpenResource={onOpenReadinessResource}
    />

    <GlobalFeedbackButton currentView={currentView} reportContext={reportContext} onSubmit={onFeedback} />

    {profileOpen && <div className="modal-backdrop" role="presentation" onClick={event => event.target === event.currentTarget && closeProfile()}><div ref={profileDialogRef} tabIndex={-1} className="profile-panel" role="dialog" aria-modal="true" aria-labelledby="profile-title"><div className="profile-summary">{avatarUrl(profile.avatar_id) ? <img src={avatarUrl(profile.avatar_id)} alt="" /> : <span className="avatar-fallback">{profile.initials}</span>}<div><h2 id="profile-title">My Profile</h2><strong>{profile.username}</strong><p>{profile.initials} · {accountRoleLabel}</p></div></div>{message && <p className="success-message" role="status">{message}</p>}{profileError && <p id="profile-error" role="alert">{profileError}</p>}{avatarOpen ? <AvatarPicker selectedId={profile.avatar_id} onCancel={() => setAvatarOpen(false)} onSave={async id => { setMessage(''); setProfileError(''); setProfileErrorField(''); try { await onAvatarChange?.(id); setAvatarOpen(false); setMessage('Avatar updated.') } catch (avatarError) { setProfileError(avatarError?.message || 'Could not update avatar.') } }} /> : passwordOpen ? <form onSubmit={submitPassword} noValidate><h3>Change Password</h3><label>New password<input name="password" type="password" autoComplete="new-password" disabled={passwordSaving} aria-invalid={profileErrorField === 'password' ? 'true' : undefined} aria-describedby={profileErrorField === 'password' ? 'profile-error' : undefined} /></label><label>Confirm password<input name="confirm" type="password" autoComplete="new-password" disabled={passwordSaving} aria-invalid={profileErrorField === 'confirm' ? 'true' : undefined} aria-describedby={profileErrorField === 'confirm' ? 'profile-error' : undefined} /></label><div className="dialog-actions"><button type="button" disabled={passwordSaving} onClick={() => setPasswordOpen(false)}>Cancel</button><button disabled={passwordSaving}>{passwordSaving ? 'Saving…' : 'Save Password'}</button></div></form> : <div className="profile-actions">{canMeetOzzie && <button onClick={() => { closeProfile(); onMeetOzzie?.() }}>Meet Ozzie Again</button>}<button onClick={() => { setMessage(''); setProfileError(''); setProfileErrorField(''); setAvatarOpen(true) }}>Change Avatar</button><button onClick={() => { setMessage(''); setProfileError(''); setProfileErrorField(''); setPasswordOpen(true) }}>Change Password</button><button onClick={onLogout}>Logout</button></div>}</div></div>}
  </div>
}
