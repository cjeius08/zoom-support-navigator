import { useMemo, useState } from 'react'
import './sandboxLab.css'

const DEVICES = [
  { id: 'windows11', label: 'Windows 11', family: 'Desktop', shell: 'windows', accent: '⊞' },
  { id: 'macos', label: 'macOS', family: 'Desktop', shell: 'mac', accent: '⌘' },
  { id: 'ios', label: 'iPhone / iPad', family: 'Mobile', shell: 'ios', accent: '◉' },
  { id: 'android', label: 'Android', family: 'Mobile', shell: 'android', accent: '◆' },
  { id: 'chromeos', label: 'ChromeOS / Web', family: 'Browser', shell: 'web', accent: '◎' },
]

const WORKSPACES = {
  home: { label: 'Home', icon: '⌂' },
  meetings: { label: 'Meetings', icon: '▣' },
  chat: { label: 'Team Chat', icon: '◫' },
  calendar: { label: 'Calendar', icon: '□' },
  contacts: { label: 'Contacts', icon: '♙' },
}

const SETTINGS = [
  { id: 'general', label: 'General', icon: '⚙' },
  { id: 'audio', label: 'Audio', icon: '🎙' },
  { id: 'video', label: 'Video & effects', icon: '◉' },
  { id: 'meetings', label: 'Meetings & webinars', icon: '▣' },
  { id: 'chat', label: 'Chat', icon: '◫' },
  { id: 'share', label: 'Share screen', icon: '⇧' },
  { id: 'accessibility', label: 'Accessibility', icon: 'Aa' },
]

function deviceClass(device) {
  return ['zoom-sim-device', device.family.toLowerCase(), device.shell].join(' ')
}

function DesktopRail({ workspace, onWorkspace, onSettings, onMore }) {
  return (
    <aside className="zoom-sim-rail" aria-label="Zoom Workplace navigation">
      <div className="zoom-sim-brand" aria-label="Zoom Workplace">
        <span className="zoom-sim-brand-mark">Z</span>
        <strong>Zoom Workplace</strong>
      </div>

      <nav className="zoom-sim-rail-nav">
        {Object.entries(WORKSPACES).map(([id, item]) => (
          <button
            key={id}
            type="button"
            className={workspace === id ? 'active' : ''}
            onClick={() => onWorkspace(id)}
          >
            <span>{item.icon}</span>
            <small>{item.label}</small>
          </button>
        ))}
        <button type="button" onClick={onMore}>
          <span>•••</span>
          <small>More</small>
        </button>
      </nav>

      <button type="button" className="zoom-sim-settings-button" onClick={onSettings}>
        <span>⚙</span>
        <small>Settings</small>
      </button>
    </aside>
  )
}

function MobileNav({ workspace, onWorkspace, onMore }) {
  const tabs = [
    ['home', '⌂', 'Home'],
    ['meetings', '▣', 'Meetings'],
    ['chat', '◫', 'Team Chat'],
  ]

  return (
    <nav className="zoom-sim-mobile-nav" aria-label="Zoom mobile navigation">
      {tabs.map(([id, icon, label]) => (
        <button
          key={id}
          type="button"
          className={workspace === id ? 'active' : ''}
          onClick={() => onWorkspace(id)}
        >
          <span>{icon}</span>
          <small>{label}</small>
        </button>
      ))}
      <button type="button" onClick={onMore}>
        <span>•••</span>
        <small>More</small>
      </button>
    </nav>
  )
}

function HomeWorkspace({ mobile = false, onStartMeeting, onOpenSettings, onJoin, onSchedule }) {
  return (
    <section className="zoom-sim-workspace-panel" aria-label="Zoom Home">
      <div className="zoom-sim-home-copy">
        <p className="zoom-sim-kicker">Today</p>
        <h2>Good morning</h2>
        <p>Practice the same entry points agents commonly guide customers toward.</p>
      </div>

      <div className="zoom-sim-quick-actions">
        <button type="button" onClick={onStartMeeting}>
          <span className="zoom-sim-action-icon new">▣</span>
          <strong>New Meeting</strong>
          <small>Start an instant meeting</small>
        </button>
        <button type="button" onClick={onJoin}>
          <span className="zoom-sim-action-icon">＋</span>
          <strong>Join</strong>
          <small>Join with meeting ID</small>
        </button>
        <button type="button" onClick={onSchedule}>
          <span className="zoom-sim-action-icon">□</span>
          <strong>Schedule</strong>
          <small>Create a meeting</small>
        </button>
        {!mobile && (
          <button type="button" onClick={onOpenSettings}>
            <span className="zoom-sim-action-icon">⚙</span>
            <strong>Settings</strong>
            <small>Audio, video, and app preferences</small>
          </button>
        )}
      </div>

      <div className="zoom-sim-upcoming-card">
        <div>
          <span className="zoom-sim-time">10:00 AM</span>
          <div>
            <strong>Support Training Practice</strong>
            <small>Today · 45 min</small>
          </div>
        </div>
        <button type="button" onClick={onStartMeeting}>Start</button>
      </div>
    </section>
  )
}

function MeetingsWorkspace({ onStartMeeting, onView }) {
  return (
    <section className="zoom-sim-workspace-panel">
      <div className="zoom-sim-section-heading">
        <div>
          <p className="zoom-sim-kicker">Meetings</p>
          <h2>Upcoming</h2>
        </div>
        <button type="button" className="zoom-sim-primary" onClick={onStartMeeting}>Start New Meeting</button>
      </div>

      <div className="zoom-sim-meeting-list">
        <article>
          <div className="zoom-sim-date-block"><strong>22</strong><small>SEP</small></div>
          <div>
            <strong>Support Training Practice</strong>
            <small>10:00 AM · Personal Meeting Room</small>
          </div>
          <button type="button" onClick={onStartMeeting}>Start</button>
        </article>
        <article>
          <div className="zoom-sim-date-block"><strong>23</strong><small>SEP</small></div>
          <div>
            <strong>Team Calibration</strong>
            <small>2:00 PM · 30 minutes</small>
          </div>
          <button type="button" onClick={onView}>View</button>
        </article>
      </div>
    </section>
  )
}

function ChatWorkspace() {
  const [activeChat, setActiveChat] = useState('alex')
  const [draft, setDraft] = useState('')
  const [sentMessages, setSentMessages] = useState([])

  const activeName = activeChat === 'alex' ? 'Alex T.' : 'Riley S.'

  function sendMessage(event) {
    event.preventDefault()
    const message = draft.trim()
    if (!message) return
    setSentMessages(current => [...current, message])
    setDraft('')
  }

  return (
    <section className="zoom-sim-workspace-panel zoom-sim-chat-workspace">
      <div className="zoom-sim-chat-list">
        <label className="zoom-sim-chat-search">⌕ <input aria-label="Search chats" placeholder="Search chats" /></label>
        <button type="button" className={activeChat === 'alex' ? 'active' : ''} onClick={() => setActiveChat('alex')}><span>AT</span><div><strong>Alex T.</strong><small>Can you check audio?</small></div></button>
        <button type="button" className={activeChat === 'riley' ? 'active' : ''} onClick={() => setActiveChat('riley')}><span>RS</span><div><strong>Riley S.</strong><small>Thanks!</small></div></button>
      </div>
      <div className="zoom-sim-chat-thread">
        <header><strong>{activeName}</strong><small>Available</small></header>
        {activeChat === 'alex'
          ? <><div className="zoom-sim-message incoming">Can you check where the microphone setting is?</div><div className="zoom-sim-message outgoing">Sure — open Settings, then Audio.</div></>
          : <><div className="zoom-sim-message incoming">Thanks for the help earlier!</div></>}
        {sentMessages.map((message, index) => <div className="zoom-sim-message outgoing" key={`${activeChat}-${index}`}>{message}</div>)}
        <form className="zoom-sim-compose-form" onSubmit={sendMessage}>
          <input aria-label={`Message ${activeName}`} value={draft} onChange={event => setDraft(event.target.value)} placeholder={`Message ${activeName}`} />
          <button type="submit">Send</button>
        </form>
      </div>
    </section>
  )
}

function GenericWorkspace({ workspace }) {
  const item = WORKSPACES[workspace] || WORKSPACES.home
  return (
    <section className="zoom-sim-workspace-panel">
      <div className="zoom-sim-home-copy">
        <p className="zoom-sim-kicker">{item.label}</p>
        <h2>{item.label}</h2>
        <p>This area is included so agents can practice where common Zoom Workplace workspaces live in the navigation.</p>
      </div>
      <div className="zoom-sim-placeholder-grid">
        <div></div><div></div><div></div><div></div>
      </div>
    </section>
  )
}

function SandboxActionDialog({ type, onClose, onStartMeeting, onNotice }) {
  const [meetingId, setMeetingId] = useState('123 456 7890')
  const [displayName, setDisplayName] = useState('STAGING_ADMIN')
  const [topic, setTopic] = useState('Support Training Practice')
  const [date, setDate] = useState('2026-09-22')
  const [time, setTime] = useState('10:00')

  if (!type) return null

  if (type === 'join') {
    return (
      <div className="zoom-sim-action-overlay" role="dialog" aria-modal="true" aria-label="Join Meeting">
        <section className="zoom-sim-action-dialog">
          <header><div><strong>Join Meeting</strong><small>Training simulation</small></div><button type="button" aria-label="Close Join Meeting" onClick={onClose}>×</button></header>
          <label>Meeting ID or personal link name<input value={meetingId} onChange={event => setMeetingId(event.target.value)} /></label>
          <label>Your name<input value={displayName} onChange={event => setDisplayName(event.target.value)} /></label>
          <label className="zoom-sim-inline-check"><input type="checkbox" defaultChecked /> Remember my name for future meetings</label>
          <label className="zoom-sim-inline-check"><input type="checkbox" /> Do not connect to audio</label>
          <footer><button type="button" onClick={onClose}>Cancel</button><button type="button" className="zoom-sim-primary" onClick={() => { onClose(); onStartMeeting() }} disabled={!meetingId.trim() || !displayName.trim()}>Join</button></footer>
        </section>
      </div>
    )
  }

  if (type === 'schedule') {
    return (
      <div className="zoom-sim-action-overlay" role="dialog" aria-modal="true" aria-label="Schedule Meeting">
        <section className="zoom-sim-action-dialog">
          <header><div><strong>Schedule Meeting</strong><small>Training simulation</small></div><button type="button" aria-label="Close Schedule Meeting" onClick={onClose}>×</button></header>
          <label>Topic<input value={topic} onChange={event => setTopic(event.target.value)} /></label>
          <div className="zoom-sim-dialog-grid"><label>Date<input type="date" value={date} onChange={event => setDate(event.target.value)} /></label><label>Time<input type="time" value={time} onChange={event => setTime(event.target.value)} /></label></div>
          <label className="zoom-sim-inline-check"><input type="checkbox" defaultChecked /> Waiting Room</label>
          <label className="zoom-sim-inline-check"><input type="checkbox" /> Mute participants upon entry</label>
          <footer><button type="button" onClick={onClose}>Cancel</button><button type="button" className="zoom-sim-primary" onClick={() => { onNotice(`Meeting scheduled: ${topic} · ${date} ${time}`); onClose() }}>Save</button></footer>
        </section>
      </div>
    )
  }

  const title = type === 'more' ? 'More Zoom Workplace Apps'
    : type === 'meeting-details' ? 'Meeting Details'
      : type === 'create' ? 'Create'
        : type === 'activity' ? 'Activity'
          : type === 'calendar-panel' ? 'Calendar'
            : type === 'history' ? 'History'
              : type === 'ai-chat' ? 'AI Companion'
                : 'My Profile'
  return (
    <div className="zoom-sim-action-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <section className="zoom-sim-action-dialog">
        <header><div><strong>{title}</strong><small>Training simulation</small></div><button type="button" aria-label={`Close ${title}`} onClick={onClose}>×</button></header>
        {type === 'more' ? (
          <div className="zoom-sim-app-grid">
            {['Whiteboard', 'Docs', 'Clips', 'Tasks', 'Notes', 'Hub'].map(label => <button type="button" key={label} onClick={() => onNotice(`${label} opened in the training simulator.`)}><span>□</span><strong>{label}</strong></button>)}
          </div>
        ) : type === 'create' ? (
          <div className="zoom-sim-create-menu-grid">
            <button type="button" onClick={() => { onClose(); onStartMeeting() }}><span>▣</span><strong>Meeting</strong><small>Start a new meeting</small></button>
            <button type="button" onClick={() => onNotice('New chat composer opened in the simulator.')}><span>◫</span><strong>Chat</strong><small>Start a conversation</small></button>
            <button type="button" onClick={() => onNotice('New Zoom Doc opened in the simulator.')}><span>□</span><strong>Doc</strong><small>Create a document</small></button>
            <button type="button" onClick={() => onNotice('New Clip flow opened in the simulator.')}><span>◉</span><strong>Clip</strong><small>Record a clip</small></button>
          </div>
        ) : type === 'activity' ? (
          <div className="zoom-sim-detail-list"><div><span>Now</span><strong>No new activity</strong></div><div><span>Earlier</span><strong>Support Training Practice starts at 10:00 AM</strong></div></div>
        ) : type === 'calendar-panel' ? (
          <div className="zoom-sim-detail-list"><div><span>10:00 AM</span><strong>Support Training Practice</strong></div><div><span>2:00 PM</span><strong>Team Calibration</strong></div><button type="button" className="zoom-sim-primary" onClick={() => { onClose(); onStartMeeting() }}>Start 10:00 AM meeting</button></div>
        ) : type === 'history' ? (
          <div className="zoom-sim-detail-list"><div><span>Recent</span><strong>Home</strong></div><div><span>Recent</span><strong>Audio settings</strong></div><div><span>Recent</span><strong>Meetings</strong></div></div>
        ) : type === 'ai-chat' ? (
          <div className="zoom-sim-profile-dialog"><div className="zoom-sim-profile-avatar">AI</div><strong>AI Companion</strong><small>Training simulation</small><button type="button" onClick={() => onNotice('AI Companion prompt simulated.')}>Ask a question</button></div>
        ) : type === 'meeting-details' ? (
          <div className="zoom-sim-detail-list">
            <div><span>Topic</span><strong>Team Calibration</strong></div>
            <div><span>When</span><strong>Sep 23 · 2:00 PM</strong></div>
            <div><span>Meeting ID</span><strong>987 654 3210</strong></div>
            <button type="button" className="zoom-sim-primary" onClick={() => { onClose(); onStartMeeting() }}>Start Meeting</button>
          </div>
        ) : (
          <div className="zoom-sim-profile-dialog">
            <div className="zoom-sim-profile-avatar">ST</div>
            <strong>STAGING_ADMIN</strong>
            <small>Training profile · Available</small>
            <button type="button" onClick={() => onNotice('Availability menu opened in the simulator.')}>Availability</button>
            <button type="button" onClick={() => onNotice('Status message editor opened in the simulator.')}>Set status message</button>
            <button type="button" onClick={() => onNotice('Settings opened from the profile menu in the simulator.')}>Settings</button>
            <button type="button" onClick={() => onNotice('Check for Updates simulated.')}>Check for Updates</button>
            <button type="button" onClick={() => onNotice('Help opened in the simulator.')}>Help</button>
          </div>
        )}
        <footer><button type="button" onClick={onClose}>Close</button></footer>
      </section>
    </div>
  )
}

function SettingsWindow({ activeTab, onTab, onClose, cameraOn, onCamera, device }) {
  const [speakerTesting, setSpeakerTesting] = useState(false)
  const [micTesting, setMicTesting] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  return (
    <div className="zoom-sim-settings-overlay" role="dialog" aria-modal="true" aria-label="Zoom Settings">
      <section className="zoom-sim-settings-window">
        <header>
          <div>
            <strong>Settings</strong>
            <span>{device.label}</span>
          </div>
          <button type="button" aria-label="Close Settings" onClick={onClose}>×</button>
        </header>

        <div className="zoom-sim-settings-body">
          <aside>
            <label className="zoom-sim-settings-search">⌕ <input placeholder="Search settings" /></label>
            {SETTINGS.map(item => (
              <button
                key={item.id}
                type="button"
                className={activeTab === item.id ? 'active' : ''}
                onClick={() => onTab(item.id)}
              >
                <span>{item.icon}</span>{item.label}
              </button>
            ))}
          </aside>

          <main>
            {activeTab === 'general' && (
              <div className="zoom-sim-setting-section">
                <h2>General</h2>
                <p>Zoom Workplace app preferences</p>
                <label><input type="checkbox" defaultChecked /> Start Zoom Workplace when I start Windows</label>
                <label><input type="checkbox" /> Minimize Zoom Workplace to the notification area when closed</label>
                <label><input type="checkbox" defaultChecked /> Keep Zoom Workplace up to date automatically</label>
                <div className="zoom-sim-select-row"><span>Color mode</span><select defaultValue="system"><option value="system">System</option><option>Light</option><option>Dark</option></select></div>
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="zoom-sim-setting-section">
                <h2>Audio</h2>
                <p>Speaker and microphone</p>
                <div className="zoom-sim-device-setting">
                  <label>Speaker<select defaultValue="system-speaker"><option value="system-speaker">Same as System</option><option>Speakers (Realtek Audio)</option><option>USB Headset</option></select></label>
                  <button type="button" onClick={() => setSpeakerTesting(value => !value)}>{speakerTesting ? 'Stop Test' : 'Test Speaker'}</button>
                </div>
                <label className="zoom-sim-volume">Output volume<input type="range" min="0" max="100" defaultValue="72" /></label>
                <div className="zoom-sim-device-setting">
                  <label>Microphone<select defaultValue="system-mic"><option value="system-mic">Same as System</option><option>Microphone Array</option><option>USB Headset Microphone</option></select></label>
                  <button type="button" onClick={() => setMicTesting(value => !value)}>{micTesting ? 'Stop Test' : 'Test Mic'}</button>
                </div>
                <label className="zoom-sim-volume">Input volume<input type="range" min="0" max="100" defaultValue="64" /></label>
                <label><input type="checkbox" defaultChecked /> Automatically adjust microphone volume</label>
                {speakerTesting && <p className="zoom-sim-test-status">🔊 Test tone playing · simulated speaker output</p>}
                {micTesting && <p className="zoom-sim-test-status">🎙 Input level moving · simulated microphone test</p>}
                <button type="button" className="zoom-sim-link-button" onClick={() => setAdvancedOpen(value => !value)}>{advancedOpen ? 'Hide Advanced' : 'Advanced'}</button>
                {advancedOpen && <div className="zoom-sim-advanced-settings"><label><input type="checkbox" defaultChecked /> Echo cancellation</label><label><input type="checkbox" /> Original sound for musicians</label><label><input type="checkbox" defaultChecked /> Automatically sync headset buttons</label></div>}
              </div>
            )}

            {activeTab === 'video' && (
              <div className="zoom-sim-setting-section">
                <h2>Video & effects</h2>
                <p>Camera, appearance, and video preferences</p>
                <div className={cameraOn ? 'zoom-sim-camera-preview on' : 'zoom-sim-camera-preview'}>
                  <span>{cameraOn ? 'Camera preview active' : 'Camera preview'}</span>
                </div>
                <div className="zoom-sim-device-setting">
                  <label>Camera<select><option>Integrated Camera</option><option>USB Camera</option></select></label>
                  <button type="button" onClick={onCamera}>{cameraOn ? 'Turn Off' : 'Turn On'}</button>
                </div>
                <label><input type="checkbox" defaultChecked /> HD video</label>
                <label><input type="checkbox" /> Mirror my video preview</label>
                <label><input type="checkbox" /> Touch up my appearance</label>
                <label><input type="checkbox" /> Adjust for low light</label>
                <label><input type="checkbox" /> Portrait lighting</label>
              </div>
            )}
            {activeTab === 'meetings' && <div className="zoom-sim-setting-section"><h2>Meetings & webinars</h2><p>Join experience and in-meeting preferences</p><label><input type="checkbox" /> Keep my camera off</label><label><input type="checkbox" defaultChecked /> Keep meeting controls visible</label><label><input type="checkbox" /> Show meeting timer</label><label><input type="checkbox" defaultChecked /> Press and hold Space key to temporarily unmute</label></div>}
            {activeTab === 'chat' && <div className="zoom-sim-setting-section"><h2>Chat</h2><p>Sidebar, notifications, and message preferences</p><label><input type="checkbox" defaultChecked /> Show unread message badge</label><label><input type="checkbox" defaultChecked /> Show link previews</label><label><input type="checkbox" /> Mute notifications while in a meeting</label></div>}
            {activeTab === 'share' && <div className="zoom-sim-setting-section"><h2>Share screen</h2><p>Screen sharing behavior</p><label><input type="checkbox" defaultChecked /> Show Zoom windows during screen share</label><label><input type="checkbox" /> Silence system notifications when sharing desktop</label><label><input type="checkbox" defaultChecked /> Side-by-side mode</label></div>}
            {activeTab === 'accessibility' && <div className="zoom-sim-setting-section"><h2>Accessibility</h2><p>Captions and display preferences</p><label className="zoom-sim-volume">Closed captioning font size<input type="range" min="80" max="160" defaultValue="100" /></label><label><input type="checkbox" /> Always show captions</label><label><input type="checkbox" defaultChecked /> Screen reader alerts</label></div>}
          </main>
        </div>
      </section>
    </div>
  )
}

function AudioJoinDialog({ mobile, onJoin, onClose }) {
  return (
    <div className="zoom-sim-audio-dialog" role="dialog" aria-label="Join Audio">
      <strong>{mobile ? 'Join Audio' : 'Join Audio'}</strong>
      <p>{mobile ? 'Choose how you want to hear and speak in the meeting.' : 'Choose how you would like to join the meeting audio.'}</p>
      <button type="button" className="zoom-sim-primary" onClick={onJoin}>
        {mobile ? 'Wi-Fi or Cellular Data' : 'Join with Computer Audio'}
      </button>
      <button type="button" onClick={onClose}>{mobile ? 'Cancel' : 'Test Speaker and Microphone'}</button>
    </div>
  )
}

function ParticipantsPanel({ onClose, onInvite }) {
  return (
    <aside className="zoom-sim-meeting-panel">
      <header><strong>Participants (3)</strong><button type="button" onClick={onClose}>×</button></header>
      <div className="zoom-sim-participant you"><span>ST</span><div><strong>You</strong><small>Host</small></div><b>🎙</b></div>
      <div className="zoom-sim-participant"><span>AT</span><div><strong>Alex T.</strong><small>Participant</small></div><b>🔇</b></div>
      <div className="zoom-sim-participant"><span>RS</span><div><strong>Riley S.</strong><small>Participant</small></div><b>🎙</b></div>
      <button type="button" className="zoom-sim-panel-action" onClick={onInvite}>Invite</button>
    </aside>
  )
}

function ChatPanel({ onClose }) {
  return (
    <aside className="zoom-sim-meeting-panel">
      <header><strong>Meeting Chat</strong><button type="button" onClick={onClose}>×</button></header>
      <div className="zoom-sim-chat-panel-body">
        <div className="zoom-sim-message incoming">Alex T.: I can hear you now.</div>
        <div className="zoom-sim-message outgoing">You: Great, thanks!</div>
      </div>
      <div className="zoom-sim-compose">Message everyone</div>
    </aside>
  )
}

function MoreMenu({ mobile, onParticipants, onShare, onReaction, onCaptions, onMeetingSettings, onNotice, onClose }) {
  return (
    <div className={mobile ? 'zoom-sim-more-menu mobile' : 'zoom-sim-more-menu'}>
      {mobile && <button type="button" onClick={onParticipants}>♙ Participants</button>}
      {mobile && <button type="button" onClick={onShare}>⇧ Start share</button>}
      <button type="button" onClick={onReaction}>☺ Reactions</button>
      <button type="button" onClick={() => onNotice('Record request simulated.')}>● Record</button>
      <button type="button" onClick={onCaptions}>CC Show captions</button>
      <button type="button" onClick={() => onNotice('Whiteboard opened in the simulator.')}>□ Whiteboards</button>
      {!mobile && <button type="button" onClick={() => onNotice('Incoming video toggled in the simulator.')}>▣ Start/Stop incoming video</button>}
      <button type="button" onClick={onMeetingSettings}>⚙ Settings</button>
      {!mobile && <button type="button" onClick={() => onNotice('Toolbar reset to the default order.')}>↺ Reset toolbar</button>}
      <button type="button" onClick={onClose}>Close</button>
    </div>
  )
}

function MeetingWorkspace({
  device,
  audioJoined,
  onAudioJoined,
  muted,
  onMuted,
  cameraOn,
  onCamera,
  panel,
  onPanel,
  moreOpen,
  onMore,
  onEnd,
  onNotice,
}) {
  const mobile = device.family === 'Mobile'
  const [audioPrompt, setAudioPrompt] = useState(!audioJoined)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareSource, setShareSource] = useState('Entire Screen')
  const [sharing, setSharing] = useState('')
  const [viewMode, setViewMode] = useState('Speaker')
  const [aiOpen, setAiOpen] = useState(false)
  const [reaction, setReaction] = useState('')
  const [captionsOn, setCaptionsOn] = useState(false)
  const [meetingSettingsOpen, setMeetingSettingsOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)

  function openPanel(next) {
    onMore(false)
    onPanel(panel === next ? null : next)
  }

  return (
    <section className={mobile ? 'zoom-sim-meeting mobile' : 'zoom-sim-meeting'}>
      <header className="zoom-sim-meeting-header">
        <div>
          <strong>Support Training Practice</strong>
          <small>Meeting ID: 123 456 7890 · Training simulation</small>
        </div>
        {!mobile && <div className="zoom-sim-meeting-header-actions"><button type="button" onClick={() => setViewMode(value => value === 'Speaker' ? 'Gallery' : 'Speaker')}>View: {viewMode}</button><button type="button" className={aiOpen ? 'active' : ''} onClick={() => setAiOpen(value => !value)}>AI Companion</button></div>}
      </header>

      <div className="zoom-sim-meeting-stage">
        <div className={cameraOn ? 'zoom-sim-video-tile camera-on' : 'zoom-sim-video-tile'}>
          <div className="zoom-sim-avatar-large">ST</div>
          <span>STAGING_ADMIN</span>
          <small>{cameraOn ? 'Camera preview simulated' : 'Camera off'}</small>
        </div>

        {panel === 'participants' && <ParticipantsPanel onClose={() => onPanel(null)} onInvite={() => setInviteOpen(true)} />}
        {panel === 'chat' && <ChatPanel onClose={() => onPanel(null)} />}

        {shareOpen && (
          <div className="zoom-sim-share-dialog" role="dialog" aria-label="Share Screen">
            <strong>Share Screen</strong>
            <p>Select what you want to share.</p>
            <div>{['Entire Screen', 'Window', 'Whiteboard'].map(source => <button type="button" key={source} className={shareSource === source ? 'selected' : ''} onClick={() => setShareSource(source)}>{source}</button>)}</div>
            <footer><button type="button" onClick={() => setShareOpen(false)}>Cancel</button><button type="button" className="zoom-sim-primary" onClick={() => { setSharing(shareSource); setShareOpen(false) }}>Share</button></footer>
          </div>
        )}

        {sharing && <div className="zoom-sim-sharing-banner"><strong>You are sharing: {sharing}</strong><button type="button" onClick={() => setSharing('')}>Stop Share</button></div>}
        {reaction && <div className="zoom-sim-reaction-bubble" aria-live="polite">{reaction}</div>}
        {captionsOn && <div className="zoom-sim-caption-line">Live transcript simulation: “Thanks, I can hear you clearly now.”</div>}
        {aiOpen && <aside className="zoom-sim-ai-panel"><header><strong>AI Companion</strong><button type="button" onClick={() => setAiOpen(false)}>×</button></header><p>Meeting summary and questions are simulated here for navigation practice.</p><button type="button" onClick={() => setReaction('✨')}>Ask AI Companion</button></aside>}
        {meetingSettingsOpen && <div className="zoom-sim-mini-dialog"><strong>Meeting Settings</strong><label><input type="checkbox" defaultChecked /> Always show meeting controls</label><label><input type="checkbox" /> Show meeting timer</label><button type="button" onClick={() => setMeetingSettingsOpen(false)}>Done</button></div>}
        {inviteOpen && <div className="zoom-sim-mini-dialog"><strong>Invite people</strong><p>Meeting ID: 123 456 7890</p><button type="button" onClick={() => setInviteOpen(false)}>Copy Invitation</button><button type="button" onClick={() => setInviteOpen(false)}>Close</button></div>}

        {audioPrompt && (
          <AudioJoinDialog
            mobile={mobile}
            onJoin={() => { onAudioJoined(true); setAudioPrompt(false) }}
            onClose={() => setAudioPrompt(false)}
          />
        )}

        {moreOpen && (
          <MoreMenu
            mobile={mobile}
            onParticipants={() => openPanel('participants')}
            onShare={() => { onMore(false); setShareOpen(true) }}
            onReaction={() => { onMore(false); setReaction(current => current ? '' : '👏') }}
            onCaptions={() => { onMore(false); setCaptionsOn(value => !value) }}
            onMeetingSettings={() => { onMore(false); setMeetingSettingsOpen(true) }}
            onNotice={onNotice}
            onClose={() => onMore(false)}
          />
        )}
      </div>

      {mobile ? (
        <div className="zoom-sim-mobile-meeting-toolbar">
          <button type="button" onClick={() => audioJoined ? onMuted(!muted) : setAudioPrompt(true)}>
            <span>🎙</span><small>{audioJoined ? (muted ? 'Unmute' : 'Mute') : 'Join Audio'}</small>
          </button>
          <button type="button" className={cameraOn ? 'active' : ''} onClick={() => onCamera(!cameraOn)}>
            <span>◉</span><small>{cameraOn ? 'Stop Video' : 'Start Video'}</small>
          </button>
          <button type="button" className={panel === 'chat' ? 'active' : ''} onClick={() => openPanel('chat')}>
            <span>▤</span><small>Chat</small>
          </button>
          <button type="button" className={moreOpen ? 'active' : ''} onClick={() => onMore(!moreOpen)}>
            <span>•••</span><small>More</small>
          </button>
          <button type="button" className="danger" onClick={onEnd}>
            <span>×</span><small>Leave</small>
          </button>
        </div>
      ) : (
        <div className="zoom-sim-desktop-meeting-toolbar">
          <div>
            <button type="button" onClick={() => audioJoined ? onMuted(!muted) : setAudioPrompt(true)}>
              <span>🎙</span><small>{audioJoined ? (muted ? 'Unmute' : 'Mute') : 'Join Audio'}</small>
            </button>
            <button type="button" className={cameraOn ? 'active' : ''} onClick={() => onCamera(!cameraOn)}>
              <span>◉</span><small>{cameraOn ? 'Stop Video' : 'Start Video'}</small>
            </button>
          </div>
          <div>
            <button type="button" className={panel === 'participants' ? 'active' : ''} onClick={() => openPanel('participants')}><span>♙</span><small>Participants</small></button>
            <button type="button" className={panel === 'chat' ? 'active' : ''} onClick={() => openPanel('chat')}><span>▤</span><small>Chat</small></button>
            <button type="button" onClick={() => setShareOpen(true)}><span>⇧</span><small>Share</small></button>
            <button type="button" className={moreOpen ? 'active' : ''} onClick={() => onMore(!moreOpen)}><span>•••</span><small>More</small></button>
          </div>
          <button type="button" className="zoom-sim-leave" onClick={onEnd}>Leave</button>
        </div>
      )}
    </section>
  )
}

export function SandboxLab() {
  const [deviceId, setDeviceId] = useState('windows11')
  const [workspace, setWorkspace] = useState('home')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')
  const [meetingOpen, setMeetingOpen] = useState(false)
  const [audioJoined, setAudioJoined] = useState(false)
  const [muted, setMuted] = useState(true)
  const [cameraOn, setCameraOn] = useState(false)
  const [meetingPanel, setMeetingPanel] = useState(null)
  const [moreOpen, setMoreOpen] = useState(false)
  const [actionDialog, setActionDialog] = useState(null)
  const [notice, setNotice] = useState('')

  const device = useMemo(() => DEVICES.find(item => item.id === deviceId) || DEVICES[0], [deviceId])
  const mobile = device.family === 'Mobile'

  function resetInteractiveState() {
    setWorkspace('home')
    setSettingsOpen(false)
    setSettingsTab('general')
    setMeetingOpen(false)
    setAudioJoined(false)
    setMuted(true)
    setCameraOn(false)
    setMeetingPanel(null)
    setMoreOpen(false)
    setActionDialog(null)
    setNotice('')
  }

  function chooseDevice(id) {
    setDeviceId(id)
    resetInteractiveState()
  }

  function startMeeting() {
    setMeetingOpen(true)
    setAudioJoined(false)
    setMuted(true)
    setMeetingPanel(null)
    setMoreOpen(false)
  }

  function endMeeting() {
    setMeetingOpen(false)
    setMeetingPanel(null)
    setMoreOpen(false)
  }

  function renderWorkspace() {
    if (workspace === 'home') return <HomeWorkspace mobile={mobile} onStartMeeting={startMeeting} onOpenSettings={() => setSettingsOpen(true)} onJoin={() => setActionDialog('join')} onSchedule={() => setActionDialog('schedule')} />
    if (workspace === 'meetings') return <MeetingsWorkspace onStartMeeting={startMeeting} onView={() => setActionDialog('meeting-details')} />
    if (workspace === 'chat') return <ChatWorkspace />
    return <GenericWorkspace workspace={workspace} />
  }

  return (
    <section className="sandbox-lab" aria-labelledby="sandbox-title">
      <header className="sandbox-hero">
        <div>
          <p className="eyebrow">Dummy · free practice environment</p>
          <h1 id="sandbox-title">Zoom Workplace Sandbox</h1>
          <p>Explore a high-fidelity training simulation by device family. Controls are interactive, but nothing connects to a real Zoom meeting, microphone, camera, or production account.</p>
        </div>
        <div className="sandbox-mode-pill">TRAINING SIMULATION</div>
      </header>

      <div className="sandbox-device-strip" role="group" aria-label="Choose device family">
        {DEVICES.map(item => (
          <button
            key={item.id}
            type="button"
            className={item.id === deviceId ? 'sandbox-device active' : 'sandbox-device'}
            aria-pressed={item.id === deviceId}
            onClick={() => chooseDevice(item.id)}
          >
            <span className="sandbox-device-icon" aria-hidden="true">{item.accent}</span>
            <span><strong>{item.label}</strong><small>{item.family}</small></span>
          </button>
        ))}
      </div>

      <div className="sandbox-context-bar">
        <div><strong>{device.label}</strong><span>Reference baseline: Zoom Workplace 7.2.1 · high-fidelity training simulation</span></div>
        <div><span>Account/licensing can change visible tabs and controls.</span><button type="button" onClick={resetInteractiveState}>Reset Sandbox</button></div>
      </div>

      <div className={deviceClass(device)}>
        <div className="zoom-sim-device-chrome">
          {device.shell === 'mac' && <span className="zoom-sim-mac-dots"><i></i><i></i><i></i></span>}
          {device.shell === 'windows' && <><span className="zoom-sim-window-app"><b>Z</b> Zoom Workplace</span><span className="zoom-sim-window-controls" aria-hidden="true"><i>—</i><i>□</i><i>×</i></span></>}
          {device.shell === 'web' && <div className="zoom-sim-browser-bar"><span>◀ ▶ ↻</span><div>app.zoom.us/wc</div><span>☆</span></div>}
          {device.shell === 'ios' && <div className="zoom-sim-phone-status"><strong>9:41</strong><span>▰ ◔ 100%</span></div>}
          {device.shell === 'android' && <div className="zoom-sim-phone-status"><strong>9:41</strong><span>◔ ▰ 100%</span></div>}
        </div>

        <div className="zoom-sim-training-watermark">TRAINING SIMULATION · NO LIVE AUDIO/VIDEO</div>

        {meetingOpen ? (
          <MeetingWorkspace
            device={device}
            audioJoined={audioJoined}
            onAudioJoined={setAudioJoined}
            muted={muted}
            onMuted={setMuted}
            cameraOn={cameraOn}
            onCamera={setCameraOn}
            panel={meetingPanel}
            onPanel={setMeetingPanel}
            moreOpen={moreOpen}
            onMore={setMoreOpen}
            onEnd={endMeeting}
            onNotice={message => { setNotice(message); window.setTimeout(() => setNotice(''), 2600) }}
          />
        ) : mobile ? (
          <div className="zoom-sim-mobile-app">
            <header className="zoom-sim-mobile-header">
              <button type="button" className="zoom-sim-mobile-profile" onClick={() => setActionDialog('profile')}>ST</button>
              <strong>Zoom Workplace</strong>
              <button type="button" onClick={() => setSettingsOpen(true)}>⚙</button>
            </header>
            <main>{renderWorkspace()}</main>
            <MobileNav workspace={workspace} onWorkspace={setWorkspace} onMore={() => setActionDialog('more')} />
            {device.shell === 'ios' && <div className="zoom-sim-ios-homebar"></div>}
          </div>
        ) : (
          <div className="zoom-sim-desktop-app">
            <DesktopRail workspace={workspace} onWorkspace={setWorkspace} onSettings={() => setSettingsOpen(true)} onMore={() => setActionDialog('more')} />
            <section className="zoom-sim-desktop-content">
              <header className="zoom-sim-global-header">
                <div className="zoom-sim-history-controls">
                  <button type="button" aria-label="Back" onClick={() => setNotice('Back navigation simulated.')}>‹</button>
                  <button type="button" aria-label="Forward" onClick={() => setNotice('Forward navigation simulated.')}>›</button>
                  <button type="button" aria-label="History" onClick={() => setActionDialog('history')}>↺</button>
                </div>
                <label className="zoom-sim-global-search">⌕ <input aria-label="Search Zoom Workplace" placeholder="Search" /></label>
                <button type="button" className="zoom-sim-header-icon zoom-sim-create-plus" aria-label="Create" onClick={() => setActionDialog('create')}>＋</button>
                <button type="button" className="zoom-sim-header-icon" aria-label="Activity" onClick={() => setActionDialog('activity')}>♢</button>
                <button type="button" className="zoom-sim-header-icon" aria-label="Calendar panel" onClick={() => setActionDialog('calendar-panel')}>□</button>
                <button type="button" className="zoom-sim-header-icon" aria-label="Open AI chat" onClick={() => setActionDialog('ai-chat')}>AI</button>
                <button type="button" className="zoom-sim-profile-chip" onClick={() => setActionDialog('profile')}>ST</button>
              </header>
              {renderWorkspace()}
            </section>
          </div>
        )}

        {settingsOpen && (
          <SettingsWindow
            activeTab={settingsTab}
            onTab={setSettingsTab}
            onClose={() => setSettingsOpen(false)}
            cameraOn={cameraOn}
            onCamera={() => setCameraOn(value => !value)}
            device={device}
          />
        )}

        <SandboxActionDialog
          type={actionDialog}
          onClose={() => setActionDialog(null)}
          onStartMeeting={startMeeting}
          onNotice={message => { setNotice(message); window.setTimeout(() => setNotice(''), 2600) }}
        />

        {notice && <div className="zoom-sim-toast" role="status">{notice}</div>}
      </div>
    </section>
  )
}
