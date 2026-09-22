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
  zoommate: { label: 'ZoomMate', icon: '✦' },
  meetings: { label: 'Meetings', icon: '▣' },
  chat: { label: 'Chat', icon: '◫' },
  hub: { label: 'Hub', icon: '◇' },
}

const SETTINGS = [
  { id: 'general', label: 'General', icon: '⚙' },
  { id: 'video', label: 'Video & effects', icon: '▣' },
  { id: 'audio', label: 'Audio', icon: '◖' },
  { id: 'notifications', label: 'Notifications & sounds', icon: '♧' },
  { id: 'meetings', label: 'Meetings & webinars', icon: '▤' },
  { id: 'recording', label: 'Recording', icon: '◉' },
  { id: 'share', label: 'Share screen', icon: '⇧' },
  { id: 'chat', label: 'Chat', icon: '◫' },
  { id: 'accessibility', label: 'Accessibility', icon: '⚑' },
  { id: 'keyboard', label: 'Keyboard shortcuts', icon: '⌨' },
  { id: 'statistics', label: 'Statistics', icon: '▥' },
  { id: 'account', label: 'My account', icon: '♙' },
]

function deviceClass(device) {
  return ['zoom-sim-device', device.family.toLowerCase(), device.shell].join(' ')
}

function DesktopRail({ workspace, onWorkspace, onSettings, onMore }) {
  return (
    <aside className="zoom-sim-rail" aria-label="Zoom Workplace navigation">
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

function HomeWorkspace({ mobile = false, onStartMeeting, onJoin, onSchedule, onShare, onNotes }) {
  const now = new Date()
  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  const date = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <section className="zoom-sim-workspace-panel zoom-reference-home" aria-label="Zoom Home">
      <button type="button" className="zoom-reference-ai-spark" aria-label="Zoom AI shortcut">✧</button>
      <div className="zoom-reference-clock">
        <strong>{time}</strong>
        <span>{date}</span>
      </div>

      <div className="zoom-reference-actions">
        <button type="button" onClick={onStartMeeting}><span className="orange">▣</span><strong>New meeting</strong><small>⌄</small></button>
        <button type="button" onClick={onJoin}><span>＋</span><strong>Join</strong></button>
        <button type="button" onClick={onSchedule}><span>31</span><strong>Schedule</strong></button>
        <button type="button" onClick={onShare}><span>⇧</span><strong>Share screen</strong></button>
        {!mobile && <button type="button" onClick={onNotes}><span>✎</span><strong>My Notes</strong></button>}
      </div>

      <div className="zoom-reference-calendar-card">
        <div className="zoom-reference-calendar-alert"><span>ⓘ</span><p>You haven't connected your calendar yet. <button type="button">Connect now</button> to manage all your meetings and events in one place.</p><button type="button" aria-label="Dismiss">×</button></div>
        <div className="zoom-reference-day-row"><button type="button">＋</button><strong>Today, Sep 22⌄</strong><span></span></div>
        <div className="zoom-reference-calendar-nav"><button type="button">▣ Today</button><button type="button">‹</button><button type="button">›</button><button type="button">•••</button></div>
        <article className="zoom-reference-event">
          <strong>▣ STAGING_ADMIN's Zoom Meeting</strong>
          <span>Today, Sep 22</span>
          <span>9:53 - 9:54 AM</span>
          <span>Host: STAGING_ADMIN</span>
        </article>
        <button type="button" className="zoom-reference-recordings">Open recordings ›</button>
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
  const [previewVideoOn, setPreviewVideoOn] = useState(true)
  const [previewMuted, setPreviewMuted] = useState(false)

  if (!type) return null

  if (type === 'prejoin') {
    return (
      <div className="zoom-sim-action-overlay zoom-reference-prejoin-overlay" role="dialog" aria-modal="true" aria-label="Video Preview">
        <section className="zoom-reference-prejoin">
          <header><strong>STAGING_ADMIN's Zoom Meeting</strong><button type="button" aria-label="Close Video Preview" onClick={onClose}>×</button></header>
          <div className={previewVideoOn ? 'zoom-reference-prejoin-preview on' : 'zoom-reference-prejoin-preview'}>
            <div className="zoom-reference-prejoin-avatar">ST</div>
            <div className="zoom-reference-prejoin-controls">
              <button type="button" onClick={() => setPreviewMuted(v => !v)}><span>◉</span><small>{previewMuted ? 'Unmute' : 'Audio'}</small></button>
              <button type="button" onClick={() => setPreviewVideoOn(v => !v)}><span>▣</span><small>{previewVideoOn ? 'Video' : 'Start video'}</small></button>
              <button type="button"><span>▧</span><small>Backgrounds</small></button>
            </div>
          </div>
          <div className="zoom-reference-prejoin-selects">
            <select defaultValue="speaker"><option value="speaker">Speakers (Realtek Audio)</option><option>USB Headset</option></select>
            <select defaultValue="camera"><option value="camera">HD User Facing</option><option>USB Camera</option></select>
          </div>
          <label className="zoom-sim-inline-check"><input type="checkbox" /> Always show video preview when joining</label>
          <footer><button type="button" className="zoom-sim-primary" onClick={() => { onClose(); onStartMeeting() }}>Start</button></footer>
        </section>
      </div>
    )
  }

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
  const isMac = device.shell === 'mac'
  const [speakerTesting, setSpeakerTesting] = useState(false)
  const [micTesting, setMicTesting] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [videoTab, setVideoTab] = useState('Video')

  return (
    <div className="zoom-sim-settings-overlay" role="dialog" aria-modal="true" aria-label="Zoom Settings">
      <section className="zoom-sim-settings-window zoom-reference-settings">
        <header className="zoom-reference-settings-titlebar">
          <div><span className="zoom-reference-zm">zm</span><strong>Settings</strong></div>
          <button type="button" aria-label="Close Settings" onClick={onClose}>×</button>
        </header>
        <div className="zoom-reference-settings-upgrade">Upgrade to Zoom Workplace Pro to get unlimited meetings, productivity apps and more! <button type="button">Upgrade now</button></div>

        <div className="zoom-sim-settings-body">
          <aside>
            <label className="zoom-sim-settings-search">⌕ <input placeholder="Search" /></label>
            {SETTINGS.map(item => (
              <button
                key={item.id}
                type="button"
                className={activeTab === item.id ? 'active' : ''}
                onClick={() => { onTab(item.id); setAdvancedOpen(false) }}
              >
                <span>{item.icon}</span>{item.label}
              </button>
            ))}
          </aside>

          <main>
            {activeTab === 'general' && (
              <div className="zoom-sim-setting-section zoom-reference-appearance">
                <h2>Appearance</h2>
                <div className="zoom-reference-settings-card">
                  <h3>Color mode</h3>
                  <div className="zoom-reference-mode-grid">
                    <button type="button" className="selected"><span className="mode-preview light"></span><small>Light</small></button>
                    <button type="button"><span className="mode-preview dark"></span><small>Dark</small></button>
                    <button type="button"><span className="mode-preview system"></span><small>System setting</small></button>
                  </div>
                </div>
                <div className="zoom-reference-settings-card">
                  <h3>Theme</h3>
                  <p>Apply an accent color when using light mode.</p>
                  <div className="zoom-reference-theme-row"><button className="classic" type="button"></button><button className="bloom" type="button"></button><button className="agave" type="button"></button><button className="rose" type="button"></button></div>
                  <label className="zoom-reference-toggle-row"><span>Always keep my meetings dark</span><input type="checkbox" defaultChecked /></label>
                  <div className="zoom-sim-select-row"><span>Zoom Chat sidebar</span><select defaultValue="light"><option value="light">Light contrast</option><option>Dark contrast</option></select></div>
                </div>
                <div className="zoom-reference-settings-card">
                  <h3>Emoji and reactions skin tone</h3>
                  <div className="zoom-reference-skin-row"><button type="button">👍</button><button type="button">👍🏻</button><button type="button">👍🏼</button><button type="button">👍🏽</button><button type="button">👍🏾</button><button type="button">👍🏿</button></div>
                </div>
                {isMac && <p className="zoom-sim-test-status">macOS system appearance can also affect the app chrome.</p>}
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="zoom-sim-setting-section zoom-reference-audio">
                {advancedOpen ? (
                  <>
                    <button type="button" className="zoom-reference-back-link" onClick={() => setAdvancedOpen(false)}>←</button>
                    <h2>Advanced</h2>
                    <div className="zoom-reference-settings-card zoom-reference-advanced-card">
                      {[
                        ['Echo cancellation', 'Reduces the sound of multiple people speaking at the same time.'],
                        [isMac ? 'macOS audio enhancements' : 'Windows system audio enhancements', 'Turn on system audio enhancements for the speaker and microphone in use.'],
                        ['Signal processing by audio device drivers', 'Set the system signal processing mode.'],
                        ['Audio capture and playback API', '']
                      ].map(([label, note]) => (
                        <div className="zoom-reference-advanced-row" key={label}>
                          <div><strong>{label} ⓘ</strong>{note && <small>{note}</small>}</div>
                          <select defaultValue="Auto"><option>Auto</option><option>On</option><option>Off</option></select>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h2>Speaker</h2>
                    <div className="zoom-reference-audio-block">
                      <label><span>Speaker</span><select defaultValue="device"><option value="device">{isMac ? 'MacBook Speakers' : 'Speakers (Realtek Audio)'}</option><option>Same as system</option><option>USB Headset</option></select></label>
                      <button type="button" className="zoom-reference-test-button" onClick={() => setSpeakerTesting(v => !v)}>{speakerTesting ? 'Stop' : 'Test speaker'}</button>
                      <label className="zoom-sim-volume"><span>Output volume</span><input type="range" min="0" max="100" defaultValue="72" /></label>
                      <label className="zoom-reference-toggle-row"><span>Spatial audio ⓘ</span><input type="checkbox" /></label>
                      <label className="zoom-reference-toggle-row"><span>Sync buttons on headset</span><input type="checkbox" defaultChecked /></label>
                      {speakerTesting && <p className="zoom-sim-test-status">🔊 Test tone playing · simulated speaker output</p>}
                    </div>

                    <h2>Microphone</h2>
                    <div className="zoom-reference-audio-block">
                      <label><span>Microphone</span><select defaultValue="device"><option value="device">{isMac ? 'MacBook Microphone' : 'Microphone Array (Realtek Audio)'}</option><option>Same as system</option><option>USB Headset Microphone</option></select></label>
                      <button type="button" className="zoom-reference-test-button" onClick={() => setMicTesting(v => !v)}>{micTesting ? 'Stop' : 'Test microphone'}</button>
                      <label className="zoom-sim-volume"><span>Input volume</span><input type="range" min="0" max="100" defaultValue="64" /></label>
                      <label className="zoom-reference-toggle-row"><span>Automatically adjust microphone volume</span><input type="checkbox" defaultChecked /></label>
                      {micTesting && <p className="zoom-sim-test-status">🎙 Simulated microphone input detected</p>}
                    </div>
                    <button type="button" className="zoom-sim-link-button" onClick={() => setAdvancedOpen(true)}>Advanced</button>
                  </>
                )}
              </div>
            )}

            {activeTab === 'video' && (
              <div className="zoom-sim-setting-section zoom-reference-video">
                <div className={cameraOn ? 'zoom-sim-camera-preview on' : 'zoom-sim-camera-preview'}>
                  <span>{cameraOn ? 'Camera preview active' : 'Camera preview'}</span>
                </div>
                <div className="zoom-reference-video-tabs">
                  {['Video','Appearance','Backgrounds','Avatars','Filters','Effects'].map(tab => <button type="button" key={tab} className={videoTab === tab ? 'active' : ''} onClick={() => setVideoTab(tab)}>{tab}</button>)}
                </div>

                {videoTab === 'Video' && <>
                  <h2>Video</h2>
                  <div className="zoom-sim-device-setting">
                    <label>Camera<select><option>{isMac ? 'FaceTime HD Camera' : 'HD User Facing'}</option><option>USB Camera</option></select></label>
                    <button type="button" onClick={onCamera}>{cameraOn ? 'Turn Off' : 'Turn On'}</button>
                  </div>
                  <label><input type="checkbox" /> Original ratio</label>
                  <label><input type="checkbox" defaultChecked /> Mirror my video preview</label>
                </>}
                {videoTab === 'Appearance' && <>
                  <h2>Appearance</h2>
                  <label className="zoom-reference-toggle-row"><span>Touch up my appearance</span><input type="checkbox" /></label>
                  <label className="zoom-reference-toggle-row"><span>Adjust for low light</span><input type="checkbox" /></label>
                  <label className="zoom-reference-toggle-row"><span>Portrait lighting</span><input type="checkbox" /></label>
                </>}
                {videoTab === 'Backgrounds' && <>
                  <h2>Backgrounds</h2>
                  <div className="zoom-reference-thumb-grid">{['None','Office','Library','Blur','Gradient','Room'].map(x => <button type="button" key={x}><span></span><small>{x}</small></button>)}</div>
                </>}
                {videoTab === 'Avatars' && <>
                  <h2>Avatars</h2>
                  <div className="zoom-reference-avatar-card"><div className="zoom-reference-avatar-face">🙂</div><div className="zoom-reference-avatar-row">{['Style','Face','Hair','Eyes','Eyebrows','Facial hair'].map(x => <button type="button" key={x}>{x}</button>)}</div><div className="zoom-reference-tone-row">{['🏻','🏼','🏽','🏾','🏿'].map(x => <button type="button" key={x}>●{x}</button>)}</div></div>
                </>}
                {videoTab === 'Filters' && <><h2>Filters</h2><div className="zoom-reference-thumb-grid">{['Original','Warm','Cool','Mono','Soft','Bright'].map(x => <button type="button" key={x}><span></span><small>{x}</small></button>)}</div></>}
                {videoTab === 'Effects' && <><h2>Effects</h2><div className="zoom-reference-thumb-grid">{['Glasses','Hat','Mustache','Frame','Stars','Confetti'].map(x => <button type="button" key={x}><span></span><small>{x}</small></button>)}</div></>}
              </div>
            )}

            {activeTab === 'notifications' && <div className="zoom-sim-setting-section"><h2>Sounds</h2><label className="zoom-sim-volume"><span>Ringtone volume</span><input type="range" min="0" max="100" defaultValue="60" /></label><h3>Ringtones</h3><div className="zoom-sim-select-row"><span>Video calls</span><select><option>Default</option></select></div><div className="zoom-sim-select-row"><span>Custom contact ringtones</span><button type="button">Manage</button></div><h3>Notification sounds</h3><label className="zoom-reference-toggle-row"><span>Play new chat message sound</span><input type="checkbox" defaultChecked /></label><h3>Desktop notifications</h3><button type="button" className="zoom-sim-link-button">Notification preferences</button></div>}
            {activeTab === 'meetings' && <div className="zoom-sim-setting-section"><h2>Meetings & webinars</h2><label><input type="checkbox" /> Keep my camera off</label><label><input type="checkbox" defaultChecked /> Keep meeting controls visible</label><label><input type="checkbox" /> Show meeting timer</label><label><input type="checkbox" defaultChecked /> Press and hold Space key to temporarily unmute</label></div>}
            {activeTab === 'recording' && <div className="zoom-sim-setting-section"><h2>Recording</h2><label><input type="checkbox" defaultChecked /> Choose a location for recorded files when the meeting ends</label><label><input type="checkbox" /> Add a timestamp to the recording</label></div>}
            {activeTab === 'share' && <div className="zoom-sim-setting-section"><h2>Share screen</h2><label><input type="checkbox" defaultChecked /> Show Zoom windows during screen share</label><label><input type="checkbox" /> Silence system notifications when sharing desktop</label><label><input type="checkbox" defaultChecked /> Side-by-side mode</label></div>}
            {activeTab === 'chat' && <div className="zoom-sim-setting-section"><h2>Chat</h2><label><input type="checkbox" defaultChecked /> Show unread message badge</label><label><input type="checkbox" defaultChecked /> Show link previews</label><label><input type="checkbox" /> Mute notifications while in a meeting</label></div>}
            {activeTab === 'accessibility' && <div className="zoom-sim-setting-section"><h2>Accessibility</h2><label className="zoom-sim-volume">Closed captioning font size<input type="range" min="80" max="160" defaultValue="100" /></label><label><input type="checkbox" /> Always show captions</label><label><input type="checkbox" defaultChecked /> Screen reader alerts</label></div>}
            {activeTab === 'keyboard' && <div className="zoom-sim-setting-section"><h2>Keyboard shortcuts</h2><div className="zoom-reference-key-row"><span>Mute/unmute my audio</span><kbd>Alt+A</kbd></div><div className="zoom-reference-key-row"><span>Start/stop video</span><kbd>Alt+V</kbd></div><div className="zoom-reference-key-row"><span>Start/stop screen sharing</span><kbd>Alt+S</kbd></div></div>}
            {activeTab === 'statistics' && <div className="zoom-sim-setting-section"><h2>Statistics</h2><div className="zoom-reference-stats"><span>CPU</span><strong>12%</strong><span>Memory</span><strong>184 MB</strong><span>Network</span><strong>Good</strong></div></div>}
            {activeTab === 'account' && <div className="zoom-reference-account"><div className="zoom-reference-avatar-face">ST</div><h2>STAGING_ADMIN <span>●</span></h2><p>Training account</p><a>Basic</a><button type="button">Upgrade to pro</button><button type="button">Edit my profile</button><button type="button">View advanced features</button></div>}
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
    <aside className="zoom-reference-side-panel">
      <header><strong>Participants (3)</strong><button type="button" onClick={onClose}>×</button></header>
      <div className="zoom-sim-participant you"><span>ST</span><div><strong>STAGING_ADMIN</strong><small>Host</small></div><b>🎙</b></div>
      <div className="zoom-sim-participant"><span>AT</span><div><strong>Alex T.</strong><small>Participant</small></div><b>🔇</b></div>
      <div className="zoom-sim-participant"><span>RS</span><div><strong>Riley S.</strong><small>Participant</small></div><b>🎙</b></div>
      <button type="button" className="zoom-sim-panel-action" onClick={onInvite}>Invite</button>
    </aside>
  )
}

function ChatPanel({ onClose }) {
  return (
    <aside className="zoom-reference-side-panel">
      <header><strong>Meeting chat</strong><button type="button" onClick={onClose}>×</button></header>
      <div className="zoom-sim-chat-panel-body">
        <div className="zoom-sim-message incoming">Alex T.: I can hear you now.</div>
        <div className="zoom-sim-message outgoing">You: Great, thanks!</div>
      </div>
      <div className="zoom-sim-compose">Message everyone</div>
    </aside>
  )
}

function HostToolsPanel({ onClose, onNotice }) {
  const [allowUnmute, setAllowUnmute] = useState(true)
  const [allowVideo, setAllowVideo] = useState(true)
  const [allowChat, setAllowChat] = useState(true)
  const [allowRename, setAllowRename] = useState(true)

  return (
    <aside className="zoom-reference-host-tools">
      <header><strong>Host tools</strong><div><button type="button" onClick={() => onNotice('Host tools popped out in the simulator.')}>↗</button><button type="button" onClick={onClose}>×</button></div></header>
      <h4>Meeting controls</h4>
      <label><span>Lock meeting</span><input type="checkbox" /></label>
      <label><span>Enable waiting room</span><input type="checkbox" /></label>
      <div className="zoom-reference-host-section"><strong>Allow participants to:</strong><button type="button" onClick={() => { setAllowUnmute(false); setAllowVideo(false); setAllowChat(false); setAllowRename(false) }}>Turn all off</button></div>
      <label><span>Unmute self</span><input type="checkbox" checked={allowUnmute} onChange={e => setAllowUnmute(e.target.checked)} /></label>
      <label><span>Start video</span><input type="checkbox" checked={allowVideo} onChange={e => setAllowVideo(e.target.checked)} /></label>
      <label><span>Chat</span><input type="checkbox" checked={allowChat} onChange={e => setAllowChat(e.target.checked)} /></label>
      <label><span>Rename self</span><input type="checkbox" checked={allowRename} onChange={e => setAllowRename(e.target.checked)} /></label>
      <button type="button" className="zoom-reference-host-link">Share screen ›</button>
      <button type="button" className="zoom-reference-host-link">Recording ›</button>
    </aside>
  )
}

function MoreMenu({ mobile, onShare, onReaction, onCaptions, onNotice, onSettings, onClose }) {
  const items = [
    ['♡', 'React', onReaction],
    ['⇧', 'Share', onShare],
    ['●', 'Record', () => onNotice('Record request simulated.')],
    ['CC', 'Show captions', onCaptions],
    ['▦', 'Breakout rooms', () => onNotice('Breakout rooms opened in the simulator.')],
    ['▤', 'Docs', () => onNotice('Docs opened in the simulator.')],
    ['□', 'Whiteboards', () => onNotice('Whiteboards opened in the simulator.')],
    ['⌘', 'Apps', () => onNotice('Apps opened in the simulator.')],
    ['ⓘ', 'Meeting info', () => onNotice('Meeting info opened in the simulator.')],
    ['⚙', 'Settings', onSettings],
  ]

  return (
    <div className={mobile ? 'zoom-reference-more-menu mobile' : 'zoom-reference-more-menu'}>
      <div className="zoom-reference-more-grid">
        {items.map(([icon,label,handler]) => <button type="button" key={label} onClick={handler}><span>{icon}</span><small>{label}</small></button>)}
      </div>
      {!mobile && <div className="zoom-reference-more-footer">Drag to pin or remove from toolbar <button type="button" onClick={() => onNotice('Toolbar reset to the recorded layout.')}>Reset</button></div>}
      <button type="button" className="zoom-reference-more-close" onClick={onClose}>Close</button>
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
  const [reaction, setReaction] = useState('')
  const [captionsOn, setCaptionsOn] = useState(false)
  const [hostToolsOpen, setHostToolsOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [viewMode, setViewMode] = useState('Speaker')

  function openPanel(next) {
    onMore(false)
    setHostToolsOpen(false)
    onPanel(panel === next ? null : next)
  }

  return (
    <section className={mobile ? 'zoom-sim-meeting mobile zoom-reference-meeting' : 'zoom-sim-meeting zoom-reference-meeting'}>
      <header className="zoom-reference-meeting-header">
        <strong>STAGING_ADMIN's Zoom Meeting</strong>
        <div>
          <span className="zoom-reference-shield">◆</span>
          <button type="button" className="zoom-reference-upgrade-zoom">Upgrade Zoom</button>
          <button type="button" aria-label={`View: ${viewMode}`} onClick={() => setViewMode(v => v === 'Speaker' ? 'Gallery' : 'Speaker')}>◈</button>
          <button type="button" onClick={() => onNotice('Meeting window tool opened in the simulator.')}>✧</button>
          <button type="button" onClick={() => onNotice('Apps shortcut opened in the simulator.')}>▦</button>
        </div>
      </header>

      <div className="zoom-sim-meeting-stage zoom-reference-meeting-stage">
        <div className={cameraOn ? 'zoom-reference-self-tile camera-on' : 'zoom-reference-self-tile'}>
          <div className="zoom-reference-meeting-avatar">ST</div>
          <span>STAGING_ADMIN</span>
        </div>

        {panel === 'participants' && <ParticipantsPanel onClose={() => onPanel(null)} onInvite={() => setInviteOpen(true)} />}
        {panel === 'chat' && <ChatPanel onClose={() => onPanel(null)} />}
        {hostToolsOpen && <HostToolsPanel onClose={() => setHostToolsOpen(false)} onNotice={onNotice} />}

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
        {captionsOn && <div className="zoom-sim-caption-line">Captions are on</div>}
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
            onShare={() => { onMore(false); setShareOpen(true) }}
            onReaction={() => { onMore(false); setReaction(current => current ? '' : '👏') }}
            onCaptions={() => { onMore(false); setCaptionsOn(value => !value) }}
            onNotice={onNotice}
            onSettings={() => { onMore(false); onNotice('Meeting settings opened in the simulator.') }}
            onClose={() => onMore(false)}
          />
        )}
      </div>

      {mobile ? (
        <div className="zoom-sim-mobile-meeting-toolbar">
          <button type="button" onClick={() => audioJoined ? onMuted(!muted) : setAudioPrompt(true)}><span>🎙</span><small>{audioJoined ? (muted ? 'Unmute' : 'Mute') : 'Join Audio'}</small></button>
          <button type="button" className={cameraOn ? 'active' : ''} onClick={() => onCamera(!cameraOn)}><span>▣</span><small>{cameraOn ? 'Stop Video' : 'Start Video'}</small></button>
          <button type="button" onClick={() => openPanel('participants')}><span>♙</span><small>Participants</small></button>
          <button type="button" className={moreOpen ? 'active' : ''} onClick={() => onMore(!moreOpen)}><span>•••</span><small>More</small></button>
          <button type="button" className="danger" onClick={onEnd}><span>×</span><small>Leave</small></button>
        </div>
      ) : (
        <div className="zoom-reference-meeting-toolbar">
          <button type="button" onClick={() => audioJoined ? onMuted(!muted) : setAudioPrompt(true)}><span>🎙</span><small>{audioJoined ? (muted ? 'Unmute' : 'Mute') : 'Audio'}</small><b>⌃</b></button>
          <button type="button" className={cameraOn ? 'active' : ''} onClick={() => onCamera(!cameraOn)}><span>▣</span><small>Video</small><b>⌃</b></button>
          <button type="button" className={panel === 'participants' ? 'active' : ''} onClick={() => openPanel('participants')}><span>♙</span><small>Participants</small><b>1</b></button>
          <button type="button" className={panel === 'chat' ? 'active' : ''} onClick={() => openPanel('chat')}><span>▱</span><small>Chat</small><b>⌃</b></button>
          <button type="button" className={hostToolsOpen ? 'active' : ''} onClick={() => { onPanel(null); onMore(false); setHostToolsOpen(v => !v) }}><span>◇</span><small>Host tools</small></button>
          <button type="button" className={moreOpen ? 'active' : ''} onClick={() => { setHostToolsOpen(false); onMore(!moreOpen) }}><span>•••</span><small>More</small></button>
          <button type="button" className="zoom-reference-end" onClick={onEnd}><span>⊗</span><small>End</small></button>
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

  function openNewMeeting() {
    if (device.shell === 'windows') setActionDialog('prejoin')
    else startMeeting()
  }

  function renderWorkspace() {
    if (workspace === 'home') return <HomeWorkspace mobile={mobile} onStartMeeting={openNewMeeting} onJoin={() => setActionDialog('join')} onSchedule={() => setActionDialog('schedule')} onShare={() => setNotice('Share screen quick action opened in the simulator.')} onNotes={() => setNotice('My Notes opened in the simulator.')} />
    if (workspace === 'meetings') return <MeetingsWorkspace onStartMeeting={openNewMeeting} onView={() => setActionDialog('meeting-details')} />
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
        <div><span className="sandbox-safety-badge">TRAINING SIMULATION · NO LIVE AUDIO/VIDEO</span><span>Account/licensing can change visible tabs and controls.</span><button type="button" onClick={resetInteractiveState}>Reset Sandbox</button></div>
      </div>

      <div className={deviceClass(device)}>
        <div className="zoom-sim-device-chrome">
          {device.shell === 'mac' && <><span className="zoom-sim-mac-dots"><i></i><i></i><i></i></span><span className="zoom-sim-mac-title">Zoom Workplace</span></>}
          {device.shell === 'windows' && <><span className="zoom-sim-window-app"><b>Z</b> Zoom Workplace</span><span className="zoom-sim-window-controls" aria-hidden="true"><i>—</i><i>□</i><i>×</i></span></>}
          {device.shell === 'web' && <div className="zoom-sim-browser-bar"><span>◀ ▶ ↻</span><div>app.zoom.us/wc</div><span>☆</span></div>}
          {device.shell === 'ios' && <div className="zoom-sim-phone-status"><strong>9:41</strong><span>▰ ◔ 100%</span></div>}
          {device.shell === 'android' && <div className="zoom-sim-phone-status"><strong>9:41</strong><span>◔ ▰ 100%</span></div>}
        </div>

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
              <header className="zoom-sim-global-header zoom-reference-app-header">
                <div className="zoom-reference-workplace"><small>zoom</small><strong>Workplace</strong></div>
                <div className="zoom-sim-history-controls">
                  <button type="button" aria-label="Back" onClick={() => setNotice('Back navigation simulated.')}>‹</button>
                  <button type="button" aria-label="Forward" onClick={() => setNotice('Forward navigation simulated.')}>›</button>
                  <button type="button" aria-label="History" onClick={() => setActionDialog('history')}>◔</button>
                </div>
                <label className="zoom-sim-global-search">⌕ <input aria-label="Search Zoom Workplace" placeholder="Search (Ctrl+E)" /></label>
                <button type="button" className="zoom-sim-header-icon" aria-label="Create" onClick={() => setActionDialog('create')}>＋</button>
                <button type="button" className="zoom-reference-upgrade" onClick={() => setNotice('Upgrade flow simulated.')}>Upgrade</button>
                <button type="button" className="zoom-sim-header-icon zoom-reference-notification" aria-label="Notifications" onClick={() => setActionDialog('activity')}>♧<i></i></button>
                <button type="button" className="zoom-sim-header-icon" aria-label="Gift" onClick={() => setNotice('Gift shortcut simulated.')}>▣</button>
                <button type="button" className="zoom-sim-profile-chip" onClick={() => setActionDialog('profile')}>ST</button>
                <span className="zoom-reference-window-buttons" aria-hidden="true">— □ ×</span>
              </header>
              <div className="zoom-reference-upgrade-banner"><strong>Upgrade offer</strong><span>Welcome to Zoom! Save up to 16% when you upgrade to Zoom Workplace Pro annual. Get longer meetings, unlimited AI note-taking with My Notes, and more for seamless connection to what matters most. <button type="button">Upgrade today</button></span><button type="button">×</button></div>
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
