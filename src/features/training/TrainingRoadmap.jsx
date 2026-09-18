export const TRAINING_ROADMAP_MODULES = [
  {
    id: 'call-method',
    number: 1,
    phase: 'Foundation',
    title: 'Learn the live-call method',
    objective: 'Build the habit of Locate → Describe → Guide → Confirm before troubleshooting specific symptoms.',
    resource: 'Scripts & Communication · Call Language',
    status: 'available',
    actionLabel: 'Open call method',
    target: { section: 'scripts', mode: 'language', subsection: 'guide' },
    skills: ['Locate the visible control', 'Give one action at a time', 'Confirm the result'],
  },
  {
    id: 'device-orientation',
    number: 2,
    phase: 'Foundation',
    title: 'Orient yourself on each device',
    objective: 'Learn where common Zoom controls live on Windows, Mac, iPhone, Android, and Browser before guiding a caller.',
    resource: 'Device Walkthroughs',
    status: 'available',
    actionLabel: 'Open device walkthroughs',
    target: { section: 'devices' },
    skills: ['Recognize platform differences', 'Describe visible controls', 'Avoid guessing from another device'],
  },
  {
    id: 'communication-boundaries',
    number: 3,
    phase: 'Apply',
    title: 'Communicate clearly and stay inside scope',
    objective: 'Use calm support language, avoid unsupported promises, and recognize wording that can create confusion or overcommitment.',
    resource: 'Scripts & Communication · Avoid / Use Instead',
    status: 'available',
    actionLabel: 'Open wording guardrails',
    target: { section: 'scripts', mode: 'avoid' },
    skills: ['Set expectations', 'Avoid blame and assumptions', 'Use referral-safe wording'],
  },
  {
    id: 'scenario-routing',
    number: 4,
    phase: 'Apply',
    title: 'Apply the method to common caller scenarios',
    objective: 'Practice discovery, approved next steps, result confirmation, and the point where basic support should stop.',
    resource: 'Scripts & Communication · Scenario Scripts',
    status: 'available',
    actionLabel: 'Open scenario scripts',
    target: { section: 'scripts', mode: 'scenarios' },
    skills: ['Ask route-changing questions', 'Follow the approved next step', 'Recognize the support boundary'],
  },
  {
    id: 'guided-lessons',
    number: 5,
    phase: 'Learn visually',
    title: 'Guided visual lessons',
    objective: 'Use short visual teaching modules to connect the approved call method, device view, symptom recognition, waiting states, and support boundaries.',
    resource: 'Guided Visual Lessons · 5 core lessons',
    status: 'available',
    actionLabel: 'Open guided lessons',
    target: { section: 'lessons' },
    skills: ['See the concept', 'Follow the visual sequence', 'Connect the lesson to live support'],
  },
  {
    id: 'practice-lab',
    number: 6,
    phase: 'Practice',
    title: 'Practice Lab',
    objective: 'Mock caller situations and choose-the-next-step exercises will test whether the agent can apply the route without memorizing a script.',
    resource: 'Phase 6 · Batch 3',
    status: 'coming',
    statusLabel: 'Coming in Batch 3',
    skills: ['Choose the next action', 'Explain why', 'Learn from answer feedback'],
  },
]

export function TrainingRoadmap({ onOpenResource = () => {} }) {
  return <section className="training-roadmap" aria-labelledby="training-roadmap-title">
    <div className="training-roadmap-intro">
      <div>
        <p className="eyebrow">Phase 6 · Training environment</p>
        <h2 id="training-roadmap-title">Follow one learning path instead of opening everything at once</h2>
        <p>Move from the call method, to device orientation, to applied support, then reinforce the patterns with guided visual lessons. Practice exercises will be added in the next Phase 6 batch.</p>
      </div>
      <span className="device-verified">6-step learning path</span>
    </div>

    <div className="training-roadmap-key" aria-label="Training roadmap legend">
      <span><i className="roadmap-dot roadmap-dot-ready" />Available now</span>
      <span><i className="roadmap-dot roadmap-dot-next" />Next Phase 6 module</span>
    </div>

    <ol className="training-roadmap-flow">
      {TRAINING_ROADMAP_MODULES.map((module, index) => <li
        key={module.id}
        className={module.status === 'available' ? 'roadmap-module roadmap-module-ready' : 'roadmap-module roadmap-module-coming'}
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
            <span className={module.status === 'available' ? 'roadmap-status roadmap-status-ready' : 'roadmap-status roadmap-status-coming'}>
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
              : <span className="roadmap-coming-note">Planned · not yet interactive</span>}
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
