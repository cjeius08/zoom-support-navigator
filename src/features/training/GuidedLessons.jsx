import { useEffect, useMemo, useState } from 'react'
import { PROCESSES } from '../../data/processes'
import { assetUrl } from '../../lib/assetUrl'

import { GUIDED_LESSONS } from './guidedLessonsData'

function SourceChips({ ids, label }) {
  const sources = useMemo(
    () => ids.map(id => PROCESSES.find(process => process.id === id)).filter(Boolean),
    [ids],
  )

  return <div className="guided-lesson-sources" aria-label="Approved lesson sources">
    <span>Source-backed</span>
    {label && <strong>{label}</strong>}
    {sources.map(source => <strong key={source.id}>{source.title}</strong>)}
  </div>
}

function LessonFlow({ items }) {
  return <div className="guided-lesson-flow" aria-label="Visual lesson sequence">
    {items.map((item, index) => <div className="guided-flow-stage" key={item.label}>
      <div className="guided-flow-marker">
        <span>{index + 1}</span>
        {index < items.length - 1 && <i aria-hidden="true" />}
      </div>
      <article>
        <strong>{item.label}</strong>
        <p>{item.cue}</p>
        <small>{item.example}</small>
      </article>
    </div>)}
  </div>
}

function LessonSplit({ items }) {
  return <div className="guided-lesson-split">
    {items.map(item => <article key={item.label}>
      <span>{item.side}</span>
      <h4>{item.label}</h4>
      <p>{item.focus}</p>
      <ul>{item.firstChecks.map(check => <li key={check}>{check}</li>)}</ul>
    </article>)}
  </div>
}

export function GuidedLessons({ onOpenResource = () => {}, onReportContextChange = () => {} }) {
  const [activeId, setActiveId] = useState(GUIDED_LESSONS[0].id)
  const active = GUIDED_LESSONS.find(lesson => lesson.id === activeId) ?? GUIDED_LESSONS[0]

  useEffect(() => {
    onReportContextChange({
      selected_tab: 'Guided Visual Lessons',
      current_section: active.title,
      active_device: null,
      active_caller_role: null,
      active_common_issue: null,
      process_id: null,
      category_id: null,
    })
  }, [active.title, onReportContextChange])

  return <section className="guided-lessons" aria-labelledby="guided-lessons-title">
    <div className="guided-lessons-intro">
      <div>
        <p className="eyebrow">Visual learning</p>
        <h2 id="guided-lessons-title">Learn the pattern before practicing the call</h2>
        <p>Each lesson reduces one support concept into a visual map. Read the pattern, notice the decision point, then open the existing approved resource when you want the full detail.</p>
      </div>
      <span className="device-verified">{GUIDED_LESSONS.length} core lessons</span>
    </div>

    <div className="guided-lesson-picker" role="tablist" aria-label="Guided visual lessons">
      {GUIDED_LESSONS.map(lesson => <button
        key={lesson.id}
        type="button"
        role="tab"
        aria-selected={active.id === lesson.id}
        onClick={() => setActiveId(lesson.id)}
      >
        <span>{lesson.number}</span>
        <div>
          <small>{lesson.level}</small>
          <strong>{lesson.title}</strong>
        </div>
      </button>)}
    </div>

    <section className="guided-lesson-panel" role="tabpanel" aria-label={active.title}>
      <header>
        <div>
          <p className="eyebrow">Lesson {active.number} of {GUIDED_LESSONS.length} · {active.level}</p>
          <h3>{active.title}</h3>
          <p>{active.summary}</p>
        </div>
        <SourceChips ids={active.sourceProcessIds} label={active.sourceLabel} />
      </header>

      <aside className="guided-remember">
        <span>Remember this</span>
        <strong>{active.remember}</strong>
      </aside>

      {active.visualImage && <figure className="guided-lesson-visual">
        <img src={assetUrl(active.visualImage.src)} alt={active.visualImage.alt} loading="lazy" />
        <figcaption>{active.visualImage.caption}</figcaption>
      </figure>}

      {active.flow && <LessonFlow items={active.flow} />}
      {active.split && <LessonSplit items={active.split} />}

      <section className="guided-takeaways" aria-labelledby={'takeaways-' + active.id}>
        <div>
          <p className="eyebrow">What the agent should carry into a call</p>
          <h4 id={'takeaways-' + active.id}>Three takeaways</h4>
        </div>
        <ol>
          {active.takeaways.map((item, index) => <li key={item}>
            <span>{index + 1}</span>
            <p>{item}</p>
          </li>)}
        </ol>
      </section>

      <footer className="guided-lesson-footer">
        <div>
          <small>Next step</small>
          <strong>Open the approved resource when you want the full workflow.</strong>
        </div>
        <button type="button" onClick={() => onOpenResource(active.target)}>{active.actionLabel}</button>
      </footer>
    </section>

    <p className="guided-practice-note">When you’re ready to practice, open Readiness Lab from the sidebar and apply the same patterns in scenario-based questions.</p>
  </section>
}
