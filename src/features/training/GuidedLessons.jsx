import { useEffect, useMemo, useState } from 'react'
import { PROCESSES } from '../../data/processes'
import { assetUrl } from '../../lib/assetUrl'

export const GUIDED_LESSONS = [
  {
    id: 'one-step-method',
    number: 1,
    level: 'Foundation',
    title: 'Guide one visible action at a time',
    summary: 'The agent should never race ahead of what the caller can actually see. Orient first, explain the control, give one action, then confirm the result.',
    remember: 'If the caller cannot find the control, do not give the next instruction yet.',
    sourceProcessIds: ['locate-describe-guide-confirm'],
    flow: [
      { label: 'Locate', cue: 'Find the area or control first.', example: '“Look for the microphone icon at the bottom.”' },
      { label: 'Describe', cue: 'Tell them what it looks like and what it does.', example: '“It controls whether others can hear your microphone.”' },
      { label: 'Guide', cue: 'Give one action only.', example: '“Select Unmute once, then tell me what changes.”' },
      { label: 'Confirm', cue: 'Test the result instead of assuming success.', example: '“Can the other participants hear you now?”' },
    ],
    takeaways: [
      'Pause after every meaningful instruction.',
      'Use what the caller sees—not what you expect their screen to show.',
      'A confirmed result decides whether you continue, change route, or stop.',
    ],
    actionLabel: 'Open the full call method',
    target: { section: 'scripts', mode: 'language', subsection: 'guide' },
  },
  {
    id: 'device-first',
    number: 2,
    level: 'Foundation',
    title: 'Identify the device before giving directions',
    summary: 'Zoom controls can move or use different labels across desktop, mobile, and browser. Device identification prevents the agent from describing the wrong screen.',
    remember: '“Zoom” is not one identical screen. First identify the platform and whether they are in the app or browser.',
    sourceProcessIds: ['using-participant-controls-in-a-zoom-meeting', 'zoom-meeting-controls-icons'],
    visualImage: {
      src: 'assets/visual-references/workplace-controls.png',
      alt: 'Zoom Workplace in-meeting controls showing the meeting toolbar',
      caption: 'Desktop example: use the visible toolbar as an orientation map, then switch to the caller’s actual device walkthrough.',
    },
    flow: [
      { label: 'Device', cue: 'Windows, Mac, iPhone/iPad, Android, or other?', example: 'This changes where controls and permissions live.' },
      { label: 'Access', cue: 'Desktop/mobile app or browser?', example: 'Do not describe app-only controls to a browser caller.' },
      { label: 'Visible screen', cue: 'Ask what they can see right now.', example: 'Toolbar, Join Audio, Waiting Room, Settings, error message, etc.' },
      { label: 'Route', cue: 'Only then move to the symptom-specific guide.', example: 'Use the matching device walkthrough + Common Issue route.' },
    ],
    takeaways: [
      'Platform comes before directions.',
      'App vs browser is a meaningful difference.',
      'Use the device map for orientation—not as a substitute for symptom troubleshooting.',
    ],
    actionLabel: 'Open Device Walkthroughs',
    target: { section: 'devices' },
  },
  {
    id: 'audio-direction',
    number: 3,
    level: 'Symptom recognition',
    title: 'Separate speaker problems from microphone problems',
    summary: '“I can’t hear them” and “they can’t hear me” sound similar during a rushed call, but they are opposite audio paths and require different first checks.',
    remember: 'Hear = output/speaker. Be heard = input/microphone.',
    sourceProcessIds: [
      'zoom-audio-troubleshooting',
      'testing-your-audio-settings-for-zoom-meetings',
      'troubleshooting-speaker-or-microphone-issues-in-the-zoom-desktop-app',
    ],
    visualImage: {
      src: 'assets/visual-references/audio-settings.png',
      alt: 'Zoom Audio settings showing separate speaker and microphone selectors',
      caption: 'Zoom separates output (Speaker) from input (Microphone). Match the symptom before changing either one.',
    },
    split: [
      {
        label: '“I can’t hear anyone”',
        side: 'OUTPUT',
        focus: 'Speaker / headphones',
        firstChecks: ['Joined meeting audio?', 'Correct speaker selected?', 'Can Test Speaker be heard?'],
      },
      {
        label: '“They can’t hear me”',
        side: 'INPUT',
        focus: 'Microphone / mute',
        firstChecks: ['Joined meeting audio?', 'Muted in Zoom or on headset?', 'Correct microphone selected and detected?'],
      },
    ],
    takeaways: [
      'Do not turn a stable meeting into a connection problem just because audio is missing.',
      'Check the direction of the symptom before opening settings.',
      'If the device itself does not detect the hardware, the issue has moved outside Zoom-only troubleshooting.',
    ],
    actionLabel: 'Open the Can’t Hear scenario',
    target: { section: 'scripts', mode: 'scenarios', scenario: 'cant-hear' },
  },
  {
    id: 'waiting-state',
    number: 4,
    level: 'State recognition',
    title: 'A waiting screen is not automatically a failed join',
    summary: 'The exact message matters. Waiting for host and Waiting Room both mean the caller reached Zoom, but the owner and next action are different.',
    remember: 'Read the exact waiting message before troubleshooting anything else.',
    sourceProcessIds: [
      'waiting-for-the-host-to-start-a-meeting-or-webinar',
      'joining-a-zoom-meeting',
      'zoom-basic-support-boundaries-decision-path-referral-process',
    ],
    visualImage: {
      src: 'assets/visual-references/waiting-for-host.png',
      alt: 'Zoom screen showing Waiting for the host to start the meeting',
      caption: 'This is a connected waiting state—not proof that Zoom failed to join.',
    },
    split: [
      {
        label: 'Waiting for host',
        side: 'HOST HAS NOT STARTED',
        focus: 'Participant is connected to Zoom',
        firstChecks: ['Wait for host to start', 'Check scheduled time if unexpected', 'Contact organizer if timing/details are uncertain'],
      },
      {
        label: 'Waiting Room',
        side: 'HOST CONTROLS ADMISSION',
        focus: 'Participant is being held before entry',
        firstChecks: ['Participant waits for admission', 'Host uses Participants → Admit', 'Support agent cannot admit the participant'],
      },
    ],
    takeaways: [
      'Do not start audio/video/reinstall troubleshooting solely because a waiting screen appears.',
      'Waiting for host and Waiting Room have different owners.',
      'If the message is something else, return to the joining route and classify the exact screen.',
    ],
    actionLabel: 'Open Waiting to Get In scenario',
    target: { section: 'scripts', mode: 'scenarios', scenario: 'waiting-entry' },
  },
  {
    id: 'support-boundary',
    number: 5,
    level: 'Decision making',
    title: 'Know when basic support should stop',
    summary: 'A good support call is not measured by whether the agent personally fixes everything. The agent should recognize when the remaining action belongs to the host, Zoom admin, organization IT, device support, or proceeding owner.',
    remember: 'Do not guess, bypass controls, or promise an escalation you do not own.',
    sourceProcessIds: ['zoom-basic-support-boundaries-decision-path-referral-process'],
    flow: [
      { label: 'Basic issue', cue: 'Is there an approved Zoom check still available?', example: 'If yes, continue one approved step at a time.' },
      { label: 'Roadblock', cue: 'Does the next action require host/admin/IT/device/network/proceeding authority?', example: 'If yes, a support boundary has been reached.' },
      { label: 'Stop', cue: 'Do not keep troubleshooting just to stay on the call.', example: 'Explain what was checked and why the remaining step is outside scope.' },
      { label: 'Refer', cue: 'Identify the correct owner and document the handoff.', example: 'Use Scope Check for the source-backed referral wording.' },
    ],
    takeaways: [
      'Exhausted approved troubleshooting is itself a stop/refer trigger.',
      'Managed permissions and security controls should not be bypassed.',
      'Possible Zoom product issues route through organization IT / Zoom admin, who decide whether Zoom Support is needed.',
    ],
    actionLabel: 'Open support-boundary language',
    target: { section: 'scripts', mode: 'language', subsection: 'boundary' },
  },
]

function SourceChips({ ids }) {
  const sources = useMemo(
    () => ids.map(id => PROCESSES.find(process => process.id === id)).filter(Boolean),
    [ids],
  )

  return <div className="guided-lesson-sources" aria-label="Approved lesson sources">
    <span>Source-backed</span>
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
        <p className="eyebrow">Phase 6 · Batch 2 · Visual learning</p>
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
        <SourceChips ids={active.sourceProcessIds} />
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

    <p className="guided-practice-note">Practice questions are intentionally saved for Phase 6 Batch 3 so the lesson stays focused on understanding the visual pattern first.</p>
  </section>
}
