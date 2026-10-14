import { useCallback, useEffect, useRef, useState } from 'react'
import { loadLiveVisitors } from '../analytics/liveVisitorsApi'
import './liveVisitors.css'

const REFRESH_MS = 30_000
const EMPTY = { active: [], idle: [], activeCount: 0 }

export function LiveVisitors({ loadVisitors = loadLiveVisitors }) {
  const [snapshot, setSnapshot] = useState(EMPTY)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)
  const [open, setOpen] = useState(false)
  const wrapper = useRef(null)

  const refresh = useCallback(async () => {
    try {
      const data = await loadVisitors()
      setSnapshot(data)
      setReady(true)
      setError(false)
    } catch {
      setError(true)
    }
  }, [loadVisitors])

  useEffect(() => {
    let alive = true
    let inFlight = false
    const load = async () => {
      if (!alive || inFlight || (typeof document !== 'undefined' && document.hidden)) return
      inFlight = true
      try {
        const data = await loadVisitors()
        if (alive) { setSnapshot(data); setReady(true); setError(false) }
      } catch {
        if (alive) setError(true)
      } finally { inFlight = false }
    }
    load()
    const id = window.setInterval(load, REFRESH_MS)
    const onVisible = () => { if (!document.hidden) load() }
    document.addEventListener('visibilitychange', onVisible)
    return () => { alive = false; window.clearInterval(id); document.removeEventListener('visibilitychange', onVisible) }
  }, [loadVisitors])

  useEffect(() => {
    if (!open) return undefined
    const dismiss = event => { if (!wrapper.current?.contains(event.target)) setOpen(false) }
    const escape = event => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape) }
  }, [open])

  const countText = error ? '—' : ready ? String(snapshot.activeCount) : '…'
  return <div className="home-live-visitors" ref={wrapper}>
    <button
      type="button"
      className="home-live-visitors-trigger"
      aria-label={`Live visitors: ${countText}. Show online team members`}
      aria-controls="ozzie-live-visitors-popover"
      aria-expanded={open}
      onClick={() => setOpen(value => !value)}
    >
      <span>Live visitors: <strong aria-live="polite">{countText}</strong></span>
      <span className={error ? 'live-visitor-dot unavailable' : 'live-visitor-dot'} aria-hidden="true" />
      <span className="live-visitors-chevron" aria-hidden="true">⌄</span>
    </button>
    {open && <section className="home-live-visitors-popover" id="ozzie-live-visitors-popover" aria-label="Currently online team members">
      <div className="live-visitors-head">
        <div><strong>Currently online</strong><small>{error ? 'Unable to refresh' : ready ? `${snapshot.activeCount} active · ${snapshot.idle.length} idle` : 'Checking activity…'}</small></div>
        <button type="button" className="live-visitors-refresh" onClick={refresh} aria-label="Refresh live visitors" title="Refresh now">↻</button>
      </div>
      {error ? <p className="live-visitors-message" role="status">Live presence unavailable. The count is not zero; try refreshing.</p>
        : !ready ? <p className="live-visitors-message">Checking current activity…</p>
        : snapshot.active.length === 0 && snapshot.idle.length === 0 ? <p className="live-visitors-message">No active or idle team members detected.</p>
        : <div className="live-visitors-people">
          {snapshot.active.map(person => <div className="live-visitor-person" key={person.id}>
            <span className="live-visitor-avatar">{person.initials}</span>
            <div><strong>{person.username}</strong><small>{person.role} · {person.page}</small></div>
            <span className="live-visitor-state" title="Active">●</span>
          </div>)}
          {snapshot.idle.length > 0 && <div className="live-visitors-subheading">Idle (not counted as active)</div>}
          {snapshot.idle.map(person => <div className="live-visitor-person" key={person.id}>
            <span className="live-visitor-avatar">{person.initials}</span>
            <div><strong>{person.username}</strong><small>{person.role} · {person.page}</small></div>
            <span className="live-visitor-state idle" title="Idle">●</span>
          </div>)}
        </div>}
      <p className="live-visitors-footnote">Based on recent Ozzie activity. Updates every 30 seconds; presence heartbeat runs every 60 seconds.</p>
    </section>}
  </div>
}
