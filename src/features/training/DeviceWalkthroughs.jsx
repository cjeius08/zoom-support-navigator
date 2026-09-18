import { useEffect, useState } from 'react'
import { assetUrl } from '../../lib/assetUrl'
import { DEVICE_WALKTHROUGHS, DEVICE_WALKTHROUGH_VERIFIED_AT } from './deviceWalkthroughs'

function WalkthroughSection({ section }) {
  return <article className="device-walkthrough-section">
    <div className="device-walkthrough-copy">
      <p className="eyebrow">{section.eyebrow}</p>
      <h3>{section.title}</h3>
      <ol>
        {section.steps.map(step => <li key={step}>{step}</li>)}
      </ol>
      <div className="device-expected">
        <strong>What they should see</strong>
        <p>{section.whatTheyShouldSee}</p>
      </div>
    </div>
    <figure className="device-walkthrough-visual">
      <img src={assetUrl(section.image)} alt={section.imageAlt} loading="lazy" />
    </figure>
  </article>
}

export function DeviceWalkthroughs({ initialDeviceId = null, onReportContextChange = () => {} }) {
  const validInitialId = DEVICE_WALKTHROUGHS.some(device => device.id === initialDeviceId)
    ? initialDeviceId
    : DEVICE_WALKTHROUGHS[0].id
  const [activeId, setActiveId] = useState(validInitialId)
  const active = DEVICE_WALKTHROUGHS.find(device => device.id === activeId) ?? DEVICE_WALKTHROUGHS[0]

  useEffect(() => {
    if (initialDeviceId && DEVICE_WALKTHROUGHS.some(device => device.id === initialDeviceId)) {
      setActiveId(initialDeviceId)
    }
  }, [initialDeviceId])

  useEffect(() => {
    onReportContextChange({
      selected_tab: 'Device Walkthroughs',
      current_section: active.title,
    })
  }, [active.title, onReportContextChange])

  return <section className="device-walkthroughs" aria-labelledby="device-walkthrough-title">
    <div className="device-walkthrough-intro">
      <div>
        <p className="eyebrow">Phase 3 · Device-specific walkthroughs</p>
        <h2 id="device-walkthrough-title">Choose the caller’s device</h2>
        <p>Use this as an orientation map while you are on the call. The walkthrough shows where common Zoom controls live before you move into the symptom-specific Quick Guide.</p>
      </div>
      <span className="device-verified">Verified {DEVICE_WALKTHROUGH_VERIFIED_AT}</span>
    </div>

    <div className="device-selector" role="tablist" aria-label="Device walkthroughs">
      {DEVICE_WALKTHROUGHS.map(device => <button
        type="button"
        role="tab"
        aria-selected={active.id === device.id}
        aria-controls="device-walkthrough-panel"
        key={device.id}
        onClick={() => setActiveId(device.id)}
      >
        <strong>{device.label}</strong>
        <span>{device.subtitle}</span>
      </button>)}
    </div>

    <section
      id="device-walkthrough-panel"
      className="device-walkthrough-panel"
      role="tabpanel"
      aria-label={active.title}
    >
      <header className="device-walkthrough-header">
        <div>
          <p className="eyebrow">{active.label}</p>
          <h2>{active.title}</h2>
          <p>{active.summary}</p>
        </div>
        <div className="device-quick-facts" aria-label={active.label + ' quick facts'}>
          {active.quickFacts.map(fact => <span key={fact}>{fact}</span>)}
        </div>
      </header>

      <div className="device-walkthrough-sections">
        {active.sections.map(section => <WalkthroughSection section={section} key={section.id} />)}
      </div>

      <section className="device-platform-notes" aria-labelledby="platform-notes-title">
        <div className="device-section-heading">
          <p className="eyebrow">Platform differences</p>
          <h3 id="platform-notes-title">What is specific to {active.label}</h3>
        </div>
        <div>
          {active.platformNotes.map(note => <article key={note.title}>
            <strong>{note.title}</strong>
            <p>{note.text}</p>
          </article>)}
        </div>
      </section>

      <section className="device-source-list" aria-labelledby="device-sources-title">
        <div className="device-section-heading">
          <p className="eyebrow">Source traceability</p>
          <h3 id="device-sources-title">Verified Zoom Support sources</h3>
        </div>
        <div>
          {active.sources.map(source => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>
            <span>{source.title}</span><span aria-hidden="true">↗</span>
          </a>)}
        </div>
      </section>
    </section>

    <p className="device-coming-next">Phase 3 device walkthrough baseline: Windows, Mac, iPhone, Android, and Browser.</p>
  </section>
}
