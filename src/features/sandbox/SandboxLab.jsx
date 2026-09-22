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
  { id: 'video', label: 'Video', icon: '◉' },
]

function deviceClass(device) {
  return ['zoom-sim-device', device.family.toLowerCase(), device.shell].join(' ')
}

function DesktopRail({ workspace, onWorkspace, onSettings }) {
  return (
    <aside className="zoom-sim-rail" aria-label="Zoom Workplace navigation">
      <div className="zoom-sim-brand" aria-label="Zoom Workplace">
        <span className="zoom-sim-brand-mark">Z</span>
        <strong>Workplace</strong>
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
        <button type="button">
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

function MobileNav({ workspace, onWorkspace }) {
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
      <button type="button">
        <span>•••</span>
        <small>More</small>
      </button>
    </nav>
  )
}

function HomeWorkspace({ mobile = false, onStartMeeting, onOpenSettings }) {
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
        <button type="button">
          <span className="zoom-sim-action-icon">＋</span>
          <strong>Join</strong>
          <small>Join with meeting ID</small>
        </button>
        <button type="button">
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

function MeetingsWorkspace({ onStartMeeting }) {
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
          <button type="button">View</button>
        </article>
      </div>
    </section>
  )
}

function ChatWorkspace() {
  return (
    <section className="zoom-sim-workspace-panel zoom-sim-chat-workspace">
      <div className="zoom-sim-chat-list">
        <div className="zoom-sim-chat-search">Search chats</div>
        <button type="button" className="active"><span>AT</span><div><strong>Alex T.</strong><small>Can you check audio?</small></div></button>
        <button type="button"><span>RS</span><div><strong>Riley S.</strong><small>Thanks!</small></div></button>
      </div>
      <div className="zoom-sim-chat-thread">
        <header><strong>Alex T.</strong><small>Available</small></header>
        <div className="zoom-sim-message incoming">Can you check where the microphone setting is?</div>
        <div className="zoom-sim-message outgoing">Sure — open Settings, then Audio.</div>
        <div className="zoom-sim-compose">Message Alex T.</div>
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

function SettingsWindow({ activeTab, onTab, onClose, cameraOn, onCamera, device }) {
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
                  <button type="button">Test Speaker</button>
                </div>
                <label className="zoom-sim-volume">Output volume<input type="range" min="0" max="100" defaultValue="72" /></label>
                <div className="zoom-sim-device-setting">
                  <label>Microphone<select defaultValue="system-mic"><option value="system-mic">Same as System</option><option>Microphone Array</option><option>USB Headset Microphone</option></select></label>
                  <button type="button">Test Mic</button>
                </div>
                <label className="zoom-sim-volume">Input volume<input type="range" min="0" max="100" defaultValue="64" /></label>
                <label><input type="checkbox" defaultChecked /> Automatically adjust microphone volume</label>
                <button type="button" className="zoom-sim-link-button">Advanced</button>
              </div>
            )}

            {activeTab === 'video' && (
              <div className="zoom-sim-setting-section">
                <h2>Video</h2>
                <p>Camera preview and preferences</p>
                <div className={cameraOn ? 'zoom-sim-camera-preview on' : 'zoom-sim-camera-preview'}>
                  <span>{cameraOn ? 'Camera preview active' : 'Camera preview'}</span>
                </div>
                <div className="zoom-sim-device-setting">
                  <label>Camera<select><option>Integrated Camera</option><option>USB Camera</option></select></label>
                  <button type="button" onClick={onCamera}>{cameraOn ? 'Turn Off' : 'Turn On'}</button>
                </div>
                <label><input type="checkbox" defaultChecked /> HD</label>
                <label><input type="checkbox" /> Mirror my video</label>
                <label><input type="checkbox" /> Touch up my appearance</label>
              </div>
            )}
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

function ParticipantsPanel({ onClose }) {
  return (
    <aside className="zoom-sim-meeting-panel">
      <header><strong>Participants (3)</strong><button type="button" onClick={onClose}>×</button></header>
      <div className="zoom-sim-participant you"><span>ST</span><div><strong>You</strong><small>Host</small></div><b>🎙</b></div>
      <div className="zoom-sim-participant"><span>AT</span><div><strong>Alex T.</strong><small>Participant</small></div><b>🔇</b></div>
      <div className="zoom-sim-participant"><span>RS</span><div><strong>Riley S.</strong><small>Participant</small></div><b>🎙</b></div>
      <button type="button" className="zoom-sim-panel-action">Invite</button>
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

function MoreMenu({ mobile, onParticipants, onShare, onClose }) {
  return (
    <div className={mobile ? 'zoom-sim-more-menu mobile' : 'zoom-sim-more-menu'}>
      <button type="button" onClick={onParticipants}>♙ Participants</button>
      <button type="button" onClick={onShare}>⇧ Share Screen</button>
      <button type="button">☺ Reactions</button>
      <button type="button">CC Captions</button>
      <button type="button">⚙ Meeting Settings</button>
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
}) {
  const mobile = device.family === 'Mobile'
  const [audioPrompt, setAudioPrompt] = useState(!audioJoined)
  const [shareOpen, setShareOpen] = useState(false)

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
        {!mobile && <div className="zoom-sim-meeting-header-actions"><button type="button">View</button><button type="button">AI Companion</button></div>}
      </header>

      <div className="zoom-sim-meeting-stage">
        <div className={cameraOn ? 'zoom-sim-video-tile camera-on' : 'zoom-sim-video-tile'}>
          <div className="zoom-sim-avatar-large">ST</div>
          <span>STAGING_ADMIN</span>
          <small>{cameraOn ? 'Camera preview simulated' : 'Camera off'}</small>
        </div>

        {panel === 'participants' && <ParticipantsPanel onClose={() => onPanel(null)} />}
        {panel === 'chat' && <ChatPanel onClose={() => onPanel(null)} />}

        {shareOpen && (
          <div className="zoom-sim-share-dialog" role="dialog" aria-label="Share Screen">
            <strong>Share Screen</strong>
            <p>Select what you want to share.</p>
            <div><button type="button" className="selected">Entire Screen</button><button type="button">Window</button><button type="button">Whiteboard</button></div>
            <footer><button type="button" onClick={() => setShareOpen(false)}>Cancel</button><button type="button" className="zoom-sim-primary" onClick={() => setShareOpen(false)}>Share</button></footer>
          </div>
        )}

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
            <button type="button"><span>AI</span><small>AI Companion</small></button>
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
    if (workspace === 'home') return <HomeWorkspace mobile={mobile} onStartMeeting={startMeeting} onOpenSettings={() => setSettingsOpen(true)} />
    if (workspace === 'meetings') return <MeetingsWorkspace onStartMeeting={startMeeting} />
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
        <div><strong>{device.label}</strong><span>Zoom Workplace-style training environment</span></div>
        <div><span>Account/licensing can change visible tabs and controls.</span><button type="button" onClick={resetInteractiveState}>Reset Sandbox</button></div>
      </div>

      <div className={deviceClass(device)}>
        <div className="zoom-sim-device-chrome">
          {device.shell === 'mac' && <span className="zoom-sim-mac-dots"><i></i><i></i><i></i></span>}
          {device.shell === 'windows' && <span className="zoom-sim-window-title">Zoom Workplace</span>}
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
          />
        ) : mobile ? (
          <div className="zoom-sim-mobile-app">
            <header className="zoom-sim-mobile-header">
              <button type="button" className="zoom-sim-mobile-profile">ST</button>
              <strong>Zoom Workplace</strong>
              <button type="button" onClick={() => setSettingsOpen(true)}>⚙</button>
            </header>
            <main>{renderWorkspace()}</main>
            <MobileNav workspace={workspace} onWorkspace={setWorkspace} />
            {device.shell === 'ios' && <div className="zoom-sim-ios-homebar"></div>}
          </div>
        ) : (
          <div className="zoom-sim-desktop-app">
            <DesktopRail workspace={workspace} onWorkspace={setWorkspace} onSettings={() => setSettingsOpen(true)} />
            <section className="zoom-sim-desktop-content">
              <header className="zoom-sim-global-header">
                <div className="zoom-sim-global-search">⌕ Search</div>
                <button type="button" className="zoom-sim-create-button" onClick={startMeeting}>＋ Create</button>
                <button type="button" className="zoom-sim-profile-chip">ST</button>
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
      </div>
    </section>
  )
}
