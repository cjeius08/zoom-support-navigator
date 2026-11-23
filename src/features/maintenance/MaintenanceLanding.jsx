import { useEffect, useRef, useState } from 'react'
import { assetUrl } from '../../lib/assetUrl'
import { OzzieBrandImage } from '../../components/OzzieBrandImage'
import './MaintenanceLanding.css'

// Public, owner-approved resources. Do not replace these with an Ozzie login URL.
export const MAINTENANCE_RESOURCES = Object.freeze({
  guide: 'https://docs.google.com/document/d/1Wc3LKshHNfsoycOULURLOLsM4l7AgAw3nROsaw78aO0/edit?tab=t.0#heading=h.xwtz0yjruubt',
  report: 'https://docs.google.com/forms/u/1/d/e/1FAIpQLSfqGpww1r9ekEJpuWRdnlBiEVSb69vQXx0m3Gc5wJrAWrtntw/viewform',
})

// Real entrance, construction, and completion stages; plays once.
// No repeating GIF or alteration to the approved original mascot illustration.
export function MaintenanceLanding({ onAdminLogin, onSignOut, checkingSession = false, sessionError = '', onRetry }) {
  const stageRef = useRef(null)
  const runRef = useRef({ animations: [], timers: [], id: 0 })
  const [message, setMessage] = useState('Ozzie is getting things ready for you.')
  const [finished, setFinished] = useState(false)
  const [replayNumber, setReplayNumber] = useState(0)

  useEffect(() => {
    const root = stageRef.current
    if (!root) return undefined
    const state = runRef.current
    const find = name => root.querySelector('[data-anim="' + name + '"]')
    const clear = () => {
      state.timers.forEach(window.clearTimeout)
      state.timers = []
      state.animations.forEach(anim => anim.cancel())
      state.animations = []
    }
    const finish = () => {
      clear()
      state.id += 1
      for (const name of ['mascot','hat','sign','tools','crane','cable','gear','stay']) {
        const el = find(name)
        if (el) { el.style.opacity = '1'; el.style.transform = name === 'mascot' ? 'translateX(-50%)' : 'none' }
      }
      for (const name of ['blueprint','wrench','bubble','spark1','spark2','spark3','spark4']) {
        const el = find(name)
        if (el) el.style.opacity = '0'
      }
      setMessage('We’re improving your workspace. Thanks for checking in!')
      setFinished(true)
    }
    const play = (name, frames, duration, delay = 0, easing = 'cubic-bezier(.2,.84,.22,1)') => {
      const node = find(name)
      if (!node) return
      const animation = node.animate(frames, { duration, delay, easing, fill: 'forwards', iterations: 1 })
      state.animations.push(animation)
    }
    const later = (ms, callback) => {
      const id = state.id
      state.timers.push(window.setTimeout(() => { if (state.id === id) callback() }, ms))
    }
    state.id += 1
    setFinished(false)
    setMessage('Ozzie is getting things ready for you.')
    for (const name of ['mascot','hat','sign','tools','crane','cable','gear','stay','blueprint','wrench','bubble','spark1','spark2','spark3','spark4']) {
      const el = find(name)
      if (el) { el.style.removeProperty('opacity'); el.style.removeProperty('transform') }
    }
    for (const name of ['hat','sign','tools','stay','blueprint','wrench','bubble','spark1','spark2','spark3','spark4']) {
      const el = find(name)
      if (el) el.style.opacity = '0'
    }
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (reduced || typeof find('mascot')?.animate !== 'function') {
      finish()
      return undefined
    }
    play('mascot', [{ opacity: 0, transform: 'translate(-66%,58px) scale(.88) rotate(-8deg)' },
      { opacity: 1, transform: 'translate(-50%,-9px) scale(1.02) rotate(2deg)', offset: .72 },
      { opacity: 1, transform: 'translate(-50%,0) scale(1) rotate(0deg)' }], 1430)
    play('hat', [{ opacity: 0, transform: 'translate(-18px,-180px) rotate(-25deg)' },
      { opacity: 1, transform: 'translate(0,18px) rotate(9deg)', offset: .7 },
      { opacity: 1, transform: 'none' }], 1100, 750)
    play('crane', [{ transform: 'rotate(-16deg)' }, { transform: 'none' }], 2500, 400)
    play('cable', [{ transform: 'scaleY(.4)' }, { transform: 'scaleY(1)' }], 2100, 500)
    play('sign', [{ opacity: 0, transform: 'translateY(-290px) rotate(-13deg)' },
      { opacity: 1, transform: 'translateY(18px) rotate(9deg)', offset: .66 },
      { opacity: 1, transform: 'translateY(-11px) rotate(-4deg)', offset: .82 },
      { opacity: 1, transform: 'none' }], 2900, 650)
    play('tools', [{ opacity: 0, transform: 'translateY(95px)' }, { opacity: 1, transform: 'translateY(-4px)', offset: .85 }, { opacity: 1, transform: 'none' }], 1200, 2400)
    play('blueprint', [{ opacity: 0, transform: 'translate(-60px,50px) scale(.45) rotate(-25deg)' },
      { opacity: 1, transform: 'translate(0,-8px) scale(1.1) rotate(-12deg)', offset: .3 },
      { opacity: 1, transform: 'translate(0,0) scale(1) rotate(-5deg)', offset: .6 },
      { opacity: 1, transform: 'translate(-25px,50px) scale(.55) rotate(10deg)', offset: .9 },
      { opacity: 0, transform: 'translate(-40px,60px) scale(.4) rotate(15deg)' }], 4100, 2550, 'ease-in-out')
    play('bubble', [{ opacity: 0, transform: 'translateY(15px) scale(.8)' },
      { opacity: 1, transform: 'none', offset: .18 }, { opacity: 1, transform: 'none', offset: .78 },
      { opacity: 0, transform: 'translateY(-8px) scale(.92)' }], 3700, 2620)
    later(2600, () => setMessage('Reviewing the plans…'))
    play('wrench', [{ opacity: 0, transform: 'translate(-12px,40px) rotate(-45deg) scale(.7)' },
      { opacity: 1, transform: 'rotate(8deg)', offset: .18 },
      { opacity: 1, transform: 'rotate(-28deg)', offset: .32 },
      { opacity: 1, transform: 'rotate(16deg)', offset: .46 },
      { opacity: 1, transform: 'rotate(-23deg)', offset: .63 },
      { opacity: 1, transform: 'rotate(11deg)', offset: .74 },
      { opacity: 0, transform: 'translate(-15px,70px) rotate(-50deg)' }], 3700, 6100, 'ease-in-out')
    play('gear', [{ transform: 'rotate(-50deg)' }, { transform: 'rotate(30deg)', offset: .3 },
      { transform: 'rotate(190deg)', offset: .7 }, { transform: 'rotate(270deg)' }], 3200, 6350)
    for (let i = 1; i <= 4; i += 1) {
      const delta = (i % 2 ? 1 : -1) * (25 + i * 9)
      play('spark' + i, [{ opacity: 0, transform: 'translate(0,0) scale(.2)' },
        { opacity: 1, transform: 'translate(' + delta / 2 + 'px,-18px) scale(1.5)', offset: .25 },
        { opacity: .8, transform: 'translate(' + delta + 'px,-44px) scale(.65)', offset: .8 },
        { opacity: 0, transform: 'translate(' + delta * 1.3 + 'px,-65px) scale(.15)' }], 850, 6750 + i * 320, 'ease-out')
    }
    later(6450, () => setMessage('Making some improvements…'))
    play('stay', [{ opacity: 0, transform: 'translateY(24px) scale(.93)' },
      { opacity: 1, transform: 'translateY(-5px) scale(1.025)', offset: .7 },
      { opacity: 1, transform: 'none' }], 1300, 9000)
    later(9700, () => setMessage('Almost there. The new experience is coming together!'))
    later(11400, finish)
    const visibility = () => {
      state.animations.forEach(animation => {
        if (document.hidden) animation.pause()
        else if (animation.playState === 'paused') animation.play()
      })
    }
    document.addEventListener('visibilitychange', visibility)
    return () => { clear(); state.id += 1; document.removeEventListener('visibilitychange', visibility) }
  }, [replayNumber])

  const skip = () => {
    const state = runRef.current
    state.timers.forEach(window.clearTimeout)
    state.timers = []
    state.animations.forEach(animation => animation.cancel())
    state.animations = []
    state.id += 1
    const root = stageRef.current
    if (root) {
      for (const name of ['mascot','hat','sign','tools','crane','cable','gear','stay']) {
        const el = root.querySelector('[data-anim="' + name + '"]')
        if (el) { el.style.opacity = '1'; el.style.transform = name === 'mascot' ? 'translateX(-50%)' : 'none' }
      }
      for (const name of ['blueprint','wrench','bubble','spark1','spark2','spark3','spark4']) {
        const el = root.querySelector('[data-anim="' + name + '"]')
        if (el) el.style.opacity = '0'
      }
    }
    setMessage('We’re improving your workspace. Thanks for checking in!')
    setFinished(true)
  }

  return <main className="oz-maintenance" aria-label="Ozzie under construction">
    <div className="oz-maintenance-shell">
      <header className="oz-maintenance-header">
        <OzzieBrandImage variant="full" className="oz-maintenance-logo" />
        <span className="oz-maintenance-status"><i aria-hidden="true"/> Maintenance mode</span>
      </header>
      <section className="oz-maintenance-content" aria-labelledby="oz-maintenance-title">
        <p className="oz-maintenance-eyebrow">A better Ozzie is on the way</p>
        <h1 id="oz-maintenance-title">We’re under construction!</h1>
        <p className="oz-maintenance-subtitle">Ozzie is getting a little upgrade. Stay tuned for updates!</p>
        <nav className="oz-maintenance-resources" aria-label="Available help links">
          <a className="oz-maintenance-link" href={MAINTENANCE_RESOURCES.guide} target="_blank" rel="noopener noreferrer">
            <span className="oz-maintenance-link-icon oz-maintenance-doc" aria-hidden="true">▤</span>
            <span>Flex Arbitration Hub – Agent Reference Guide</span><span aria-hidden="true">↗</span>
          </a>
          <a className="oz-maintenance-link" href={MAINTENANCE_RESOURCES.report} target="_blank" rel="noopener noreferrer">
            <span className="oz-maintenance-link-icon oz-maintenance-form" aria-hidden="true">▦</span>
            <span>Google Call Report</span><span aria-hidden="true">↗</span>
          </a>
        </nav>
        <div className="oz-maintenance-scene" ref={stageRef} aria-label="Ozzie working on the site">
          <div className="oz-maintenance-construction-lines" aria-hidden="true" />
          <div className="oz-maintenance-owl-work" aria-hidden="true">
            <div className="oz-maintenance-owl-shadow" />
            <img className="oz-maintenance-mascot" data-anim="mascot" src={assetUrl('assets/ozzie-welcome-open-arms.webp')} alt="" draggable="false" />
            <div className="oz-maintenance-hat" data-anim="hat">
              <svg viewBox="0 0 220 105"><path d="M65 81V46c0-24 17-37 43-38h15c26 1 43 14 43 38v35" fill="#fdb637" stroke="#d98c19" strokeWidth="6"/><path d="M87 13v57M133 13v57" fill="none" stroke="#ffdf7f" strokeWidth="15" opacity=".78"/><path d="M16 82c0-15 22-21 94-21s94 6 94 21c0 13-35 17-94 17S16 95 16 82Z" fill="#ffc247" stroke="#db8d17" strokeWidth="5"/></svg>
            </div>
            <div className="oz-maintenance-blueprint" data-anim="blueprint">
              <svg viewBox="0 0 185 125"><path d="M9 13 175 3l-3 103L13 119Z" fill="#137bd6" stroke="#0a569b" strokeWidth="5"/><path d="M32 34h117M28 54h67M28 76h41m33 0h43M41 96h110" fill="none" stroke="#d5f6ff" strokeWidth="3"/><rect x="100" y="50" width="43" height="40" rx="3" fill="none" stroke="#d5f6ff" strokeWidth="3"/></svg>
            </div>
            <div className="oz-maintenance-wrench" data-anim="wrench">
              <svg viewBox="0 0 100 160"><path d="M35 12c-14 7-21 24-14 40l12-15 14 6 1 15-17 8c17 9 38 3 45-15 5-14 0-25-8-32l-9 20-17-5Z" fill="#95b7cf" stroke="#366b9b" strokeWidth="5"/><path d="m52 57-21 84c-2 8 18 13 22 3l23-84Z" fill="#5a9dd3" stroke="#316b9d" strokeWidth="5"/></svg>
            </div>
            {[1,2,3,4].map(i => <i className="oz-maintenance-spark" data-anim={'spark' + i} key={i} />)}
            <span className="oz-maintenance-bubble" data-anim="bubble">Checking the blueprint…</span>
          </div>
          <div className="oz-maintenance-construction-work" aria-hidden="true">
            <div className="oz-maintenance-crane" data-anim="crane"><div className="oz-maintenance-crane-arm"/><div className="oz-maintenance-crane-joint"/><div className="oz-maintenance-cable" data-anim="cable"/></div>
            <div className="oz-maintenance-sign" data-anim="sign"><strong>UNDER</strong><b>CONSTRUCTION</b><span>⚙ &nbsp; ✦ &nbsp; ⚙</span></div>
            <div className="oz-maintenance-tools" data-anim="tools"><span className="oz-maintenance-gear" data-anim="gear">⚙</span><span className="oz-maintenance-toolbox"/><span className="oz-maintenance-cone">🚧</span></div>
          </div>
        </div>
        <div className="oz-maintenance-stay" data-anim="stay" aria-live="polite">✦ &nbsp; Stay tuned for updates! &nbsp; ✦</div>
        <p className="oz-maintenance-message" aria-live="polite">{message}</p>
        <div className="oz-maintenance-actions">
          <button type="button" onClick={() => setReplayNumber(n => n + 1)}>↻ Watch Ozzie build again</button>
          {!finished && <button type="button" onClick={skip}>Skip animation</button>}
        </div>
        {sessionError && <div className="oz-maintenance-session-error" role="alert">{sessionError} {onRetry && <button type="button" onClick={onRetry}>Retry session check</button>}</div>}
        <div className="oz-maintenance-admin-controls">
          {onSignOut
            ? <><span>Signed in to a non-admin account. Workspace access is paused.</span><button type="button" onClick={onSignOut}>Sign out</button></>
            : <button type="button" onClick={onAdminLogin} disabled={checkingSession}>Admin Login</button>}
        </div>
      </section>
    </div>
  </main>
}
