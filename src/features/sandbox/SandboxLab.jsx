import { useMemo, useState } from 'react'
import './sandboxLab.css'

const DEVICES = [
  { id: 'windows11', label: 'Windows 11', family: 'Desktop', icon: '⊞' },
  { id: 'macos', label: 'macOS', family: 'Desktop', icon: '⌘' },
  { id: 'ios', label: 'iPhone / iPad', family: 'Mobile', icon: '◉' },
  { id: 'android', label: 'Android', family: 'Mobile', icon: '◆' },
  { id: 'chromeos', label: 'ChromeOS', family: 'Browser / Laptop', icon: '◎' },
]

const PANELS = {
  home: { title: 'Zoom Home', copy: 'Practice finding the core Zoom controls without a required scenario.' },
  settings: { title: 'Settings', copy: 'Explore Audio, Video, General, Accessibility, and other common support areas.' },
  audio: { title: 'Audio', copy: 'Inspect speaker, microphone, volume, and test controls.' },
  video: { title: 'Video', copy: 'Inspect camera selection, preview, and video preferences.' },
  meeting: { title: 'In Meeting', copy: 'Practice locating Participants, Chat, Share Screen, Audio, and Video controls.' },
}

export function SandboxLab() {
  const [deviceId, setDeviceId] = useState('windows11')
  const [panel, setPanel] = useState('home')
  const [meetingOpen, setMeetingOpen] = useState(false)
  const [micMuted, setMicMuted] = useState(true)
  const [cameraOn, setCameraOn] = useState(false)
  const [participantsOpen, setParticipantsOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  const device = useMemo(() => DEVICES.find(item => item.id === deviceId) || DEVICES[0], [deviceId])

  function resetSandbox() {
    setPanel('home')
    setMeetingOpen(false)
    setMicMuted(true)
    setCameraOn(false)
    setParticipantsOpen(false)
    setChatOpen(false)
  }

  function chooseDevice(id) {
    setDeviceId(id)
    resetSandbox()
  }

  return (
    <section className="sandbox-lab" aria-labelledby="sandbox-title">
      <header className="sandbox-hero">
        <div>
          <p className="eyebrow">Free practice environment</p>
          <h1 id="sandbox-title">Device Sandbox</h1>
          <p>Pick a device family and explore a guided mock Zoom environment freely. No scenario, timer, score, or required path.</p>
        </div>
        <div className="sandbox-mode-pill">FREE EXPLORE</div>
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
            <span className="sandbox-device-icon" aria-hidden="true">{item.icon}</span>
            <span><strong>{item.label}</strong><small>{item.family}</small></span>
          </button>
        ))}
      </div>

      <div className="sandbox-workspace">
        <aside className="sandbox-guide-card">
          <div>
            <p className="eyebrow">Selected device</p>
            <h2>{device.label}</h2>
            <p>{device.family}</p>
          </div>

          <nav className="sandbox-section-nav" aria-label="Sandbox areas">
            <button type="button" className={panel === 'home' ? 'active' : ''} onClick={() => setPanel('home')}>Zoom Home</button>
            <button type="button" className={panel === 'settings' ? 'active' : ''} onClick={() => setPanel('settings')}>Settings</button>
            <button type="button" className={panel === 'audio' ? 'active' : ''} onClick={() => setPanel('audio')}>Audio</button>
            <button type="button" className={panel === 'video' ? 'active' : ''} onClick={() => setPanel('video')}>Video</button>
            <button type="button" className={panel === 'meeting' ? 'active' : ''} onClick={() => { setPanel('meeting'); setMeetingOpen(true) }}>Meeting Controls</button>
          </nav>

          <button type="button" className="sandbox-reset" onClick={resetSandbox}>Reset Sandbox</button>
        </aside>

        <div className={`sandbox-device-frame ${device.family === 'Mobile' ? 'mobile' : ''}`}>
          <div className="sandbox-frame-topbar">
            <span className="sandbox-window-dots" aria-hidden="true">● ● ●</span>
            <strong>{device.label} · Zoom practice</strong>
            <span className="sandbox-local-only">LOCAL MOCK</span>
          </div>

          <div className="sandbox-screen">
            <div className="sandbox-app-sidebar" aria-hidden={device.family === 'Mobile' ? 'true' : undefined}>
              <strong>zoom</strong>
              <button type="button" onClick={() => setPanel('home')}>Home</button>
              <button type="button" onClick={() => setPanel('meeting')}>Meetings</button>
              <button type="button" onClick={() => setPanel('settings')}>Settings</button>
            </div>

            <main className="sandbox-app-main">
              <div className="sandbox-panel-heading">
                <div>
                  <p className="eyebrow">{device.label}</p>
                  <h2>{PANELS[panel].title}</h2>
                  <p>{PANELS[panel].copy}</p>
                </div>
                {panel !== 'meeting' && (
                  <button type="button" className="primary-action" onClick={() => { setPanel('meeting'); setMeetingOpen(true) }}>Start Practice Meeting</button>
                )}
              </div>

              {panel === 'home' && (
                <div className="sandbox-home-grid">
                  <button type="button" onClick={() => { setPanel('meeting'); setMeetingOpen(true) }}><span>＋</span><strong>New Meeting</strong><small>Open a practice meeting</small></button>
                  <button type="button"><span>⌁</span><strong>Join</strong><small>Practice locating Join</small></button>
                  <button type="button"><span>▣</span><strong>Schedule</strong><small>Explore scheduling entry points</small></button>
                  <button type="button" onClick={() => setPanel('settings')}><span>⚙</span><strong>Settings</strong><small>Open device preferences</small></button>
                </div>
              )}

              {panel === 'settings' && (
                <div className="sandbox-settings-list">
                  <button type="button" onClick={() => setPanel('audio')}><span>🎙</span><div><strong>Audio</strong><small>Speaker, microphone, volume, testing</small></div><b>›</b></button>
                  <button type="button" onClick={() => setPanel('video')}><span>◉</span><div><strong>Video</strong><small>Camera, preview, video preferences</small></div><b>›</b></button>
                  <button type="button"><span>⚙</span><div><strong>General</strong><small>Startup and app behavior</small></div><b>›</b></button>
                  <button type="button"><span>Aa</span><div><strong>Accessibility</strong><small>Captions and display options</small></div><b>›</b></button>
                </div>
              )}

              {panel === 'audio' && (
                <div className="sandbox-settings-pane">
                  <div className="sandbox-setting-row"><div><strong>Speaker</strong><small>Default system speaker</small></div><button type="button">Test Speaker</button></div>
                  <div className="sandbox-setting-row"><div><strong>Microphone</strong><small>Default system microphone</small></div><button type="button">Test Mic</button></div>
                  <label className="sandbox-slider-row"><span>Output volume</span><input type="range" min="0" max="100" defaultValue="72" /></label>
                  <label className="sandbox-slider-row"><span>Input volume</span><input type="range" min="0" max="100" defaultValue="68" /></label>
                </div>
              )}

              {panel === 'video' && (
                <div className="sandbox-video-pane">
                  <div className="sandbox-camera-preview">{cameraOn ? <span>Camera preview active</span> : <span>Camera preview off</span>}</div>
                  <div className="sandbox-setting-row"><div><strong>Camera</strong><small>Integrated Camera</small></div><button type="button" onClick={() => setCameraOn(value => !value)}>{cameraOn ? 'Turn Off' : 'Turn On'}</button></div>
                  <label className="sandbox-checkbox-row"><input type="checkbox" defaultChecked /> HD</label>
                  <label className="sandbox-checkbox-row"><input type="checkbox" /> Mirror my video</label>
                </div>
              )}

              {panel === 'meeting' && (
                <div className="sandbox-meeting">
                  <div className="sandbox-meeting-stage">
                    <div className="sandbox-self-tile">
                      <span>{cameraOn ? 'Camera On' : 'Camera Off'}</span>
                      <small>You</small>
                    </div>
                    {participantsOpen && <div className="sandbox-side-panel"><strong>Participants (3)</strong><span>You</span><span>Alex</span><span>Jordan</span></div>}
                    {chatOpen && <div className="sandbox-side-panel"><strong>Meeting Chat</strong><p>Practice opening and closing the chat panel.</p></div>}
                  </div>

                  <div className="sandbox-meeting-toolbar">
                    <button type="button" className={!micMuted ? 'active' : ''} onClick={() => setMicMuted(value => !value)}><span>🎙</span><small>{micMuted ? 'Unmute' : 'Mute'}</small></button>
                    <button type="button" className={cameraOn ? 'active' : ''} onClick={() => setCameraOn(value => !value)}><span>◉</span><small>{cameraOn ? 'Stop Video' : 'Start Video'}</small></button>
                    <button type="button" className={participantsOpen ? 'active' : ''} onClick={() => { setParticipantsOpen(value => !value); setChatOpen(false) }}><span>♙</span><small>Participants</small></button>
                    <button type="button" className={chatOpen ? 'active' : ''} onClick={() => { setChatOpen(value => !value); setParticipantsOpen(false) }}><span>▤</span><small>Chat</small></button>
                    <button type="button"><span>⇧</span><small>Share Screen</small></button>
                    <button type="button" className="danger" onClick={() => { setMeetingOpen(false); setPanel('home') }}><span>×</span><small>End</small></button>
                  </div>
                  {!meetingOpen && <p className="sandbox-ended-note">Practice meeting ended. Start another whenever you want.</p>}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </section>
  )
}
