import { TRAINING_ROADMAP_MODULES } from './trainingRoadmapData'

export function TrainingRoadmap({ onOpenResource = () => {} }) {
  return <section className="training-roadmap" aria-labelledby="training-roadmap-title">
    <div className="training-roadmap-intro">
      <div>
        <p className="eyebrow">Training environment</p>
        <h2 id="training-roadmap-title">Follow one learning path instead of opening everything at once</h2>
        <p>Move from the official call flow, to device orientation, to applied support, then reinforce the patterns with guided visual lessons. All five Readiness Lab parts are now available from the sidebar as the final validation step.</p>
      </div>
      <span className="device-verified">6-step learning path</span>
    </div>

    <div className="training-roadmap-key" aria-label="Training roadmap legend">
      <span><i className="roadmap-dot roadmap-dot-ready" />Available now</span>
      <span><i className="roadmap-dot roadmap-dot-next" />Global tool / use from sidebar</span>
    </div>

    <ol className="training-roadmap-flow">
      {TRAINING_ROADMAP_MODULES.map((module, index) => <li
        key={module.id}
        className={module.status === 'available' || module.status === 'complete' ? 'roadmap-module roadmap-module-ready' : 'roadmap-module roadmap-module-coming'}
      >
        <div className="roadmap-rail" aria-hidden="true">
          <span>{module.number}</span>
          {index < TRAINING_ROADMAP_MODULES.length - 1 && <i />}
        </div>

        <article>
          <header>
            <div>
              <p className="eyebrow">{module.phase}</p>
              <h3>{module.title}</h3>
            </div>
            <span className={module.status === 'available' || module.status === 'complete' ? 'roadmap-status roadmap-status-ready' : 'roadmap-status roadmap-status-coming'}>
              {module.status === 'available' ? 'Available now' : module.statusLabel}
            </span>
          </header>

          <p className="roadmap-objective">{module.objective}</p>

          <div className="roadmap-skills" aria-label={module.title + ' learning goals'}>
            {module.skills.map(skill => <span key={skill}>{skill}</span>)}
          </div>

          <footer>
            <div>
              <small>Uses</small>
              <strong>{module.resource}</strong>
            </div>
            {module.status === 'available'
              ? <button type="button" onClick={() => onOpenResource(module.target)}>{module.actionLabel}</button>
              : <span className="roadmap-coming-note">{module.status === 'complete' ? 'Open Readiness Lab from the sidebar' : 'Planned · not yet interactive'}</span>}
          </footer>
        </article>
      </li>)}
    </ol>

    <aside className="training-roadmap-reinforcement">
      <div>
        <p className="eyebrow">Reinforce anytime</p>
        <h3>Video Library</h3>
        <p>Use videos after a concept or device walkthrough when seeing the Zoom flow in motion would help reinforce it. Videos support the learning path; they do not replace the approved support process.</p>
      </div>
      <button type="button" onClick={() => onOpenResource({ section: 'videos' })}>Open Video Library</button>
    </aside>
  </section>
}
