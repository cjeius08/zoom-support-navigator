import { useState } from 'react'
import { avatarUrl } from '../profile/avatarCatalog'
import { AvatarPicker } from '../profile/AvatarPicker'

export function AppShell({ profile, children, onLogout, onAvatarChange }) {
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const isAdmin = profile.role === 'creator_admin'
  return <div className="app-shell">
    <header className="app-header"><button className="menu-toggle" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>☰</button><div><strong>Zoom Support</strong><small>Navigator</small></div><button className="account-menu" aria-label={`${profile.username} account`} onClick={() => setProfileOpen(true)}>{avatarUrl(profile.avatar_id) ? <img src={avatarUrl(profile.avatar_id)} alt="" /> : <span className="avatar-fallback">{profile.initials}</span>}<span>{profile.initials}</span><span>{profile.username}</span></button></header>
    <aside className={`sidebar ${open ? 'open' : ''}`}><nav aria-label="Primary navigation"><a href="#navigator">Navigator</a>{isAdmin && <><a href="#admin">Admin Home</a><a href="#team">Team Management</a><a href="#usage">Usage Analytics</a><a href="#feedback">Feedback</a></>}</nav><button className="logout-button" onClick={onLogout}>Logout</button></aside>
    <main className="app-main">{children}</main>
    {profileOpen && <div className="modal-backdrop" role="presentation" onClick={event => event.target === event.currentTarget && setProfileOpen(false)}><div className="profile-panel" role="dialog" aria-modal="true" aria-labelledby="profile-title"><h2 id="profile-title">My Profile</h2><p><strong>{profile.username}</strong> · {profile.role === 'creator_admin' ? 'JA Admin' : 'Agent'}</p><AvatarPicker selectedId={profile.avatar_id} onCancel={() => setProfileOpen(false)} onSave={async id => { await onAvatarChange?.(id); setProfileOpen(false) }} /></div></div>}
  </div>
}
