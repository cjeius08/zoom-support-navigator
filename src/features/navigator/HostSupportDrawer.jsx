import { useEffect, useMemo, useRef, useState } from 'react'
import { HOST_ROADBLOCKS } from '../../data/arbitratorHostSupport'
import { HOST_GUIDED_ROUTES } from '../../data/hostGuidedRoutes'
import { useDialogFocus } from '../../lib/useDialogFocus'

const DEVICE_OPTIONS = ['Windows', 'Mac', 'Browser', 'iPhone', 'Android']

function platformForDevice(device) {
  if (device === 'Windows' || device === 'Mac') return 'desktop'
  if (device === 'Browser') return 'web'
  if (device === 'iPhone' || device === 'Android') return 'mobile'
  return null
}

function documentationDevice(device) {
  if (device === 'iPhone') return 'iPhone / iPad'
  return device || ''
}

function nextStepIndex(route, next) {
  return route?.steps?.findIndex(step => step.id === next) ?? -1
}

function routeById(id) {
  return HOST_GUIDED_ROUTES.find(item => item.id === id) || null
}

function roadblockById(id) {
  return HOST_ROADBLOCKS.find(item => item.id === id) || null
}

export function HostSupportDrawer({
  route = null,
  roadblock = null,
  initialDevice = null,
  onClose,
  onOpenGuidedRoute = null,
  onContextChange = null,
  onAddToDocumentation = null,
  onTrackEvent = null,
}) {
  const dialogRef = useRef(null)
  const [device, setDevice] = useState(initialDevice || null)
  const [activeRoute, setActiveRoute] = useState(route)
  const [gateIndex, setGateIndex] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)
  const [phase, setPhase] = useState(roadblock ? 'roadblock' : 'confirm')
  const [activeRoadblock, setActiveRoadblock] = useState(roadblock || null)
  const [answers, setAnswers] = useState([])
  const [attemptedSteps, setAttemptedSteps] = useState([])
  const [documentationAdded, setDocumentationAdded] = useState(false)
  const [scriptCopyState, setScriptCopyState] = useState('idle')
  const [history, setHistory] = useState([])

  useDialogFocus(dialogRef, true, onClose)

  useEffect(() => {
    setDevice(initialDevice || null)
    setActiveRoute(route)
    setGateIndex(0)
    setStepIndex(0)
    setPhase(roadblock ? 'roadblock' : 'confirm')
    setActiveRoadblock(roadblock || null)
    setAnswers([])
    setAttemptedSteps([])
    setDocumentationAdded(false)
    setScriptCopyState('idle')
    setHistory([])
  }, [route?.id, roadblock?.id, initialDevice])

  const currentGate = activeRoute?.confirmBeforeProceeding?.[gateIndex] || null
  const currentStep = activeRoute?.steps?.[stepIndex] || null
  const platform = platformForDevice(device)
  const platformInstruction = currentStep?.platformInstructions?.[platform] || null

  const sources = useMemo(() => activeRoute?.sourceRefs?.zoom || [], [activeRoute])

  function snapshot() {
    return {
      routeId: activeRoute?.id || null,
      phase,
      gateIndex,
      stepIndex,
      roadblockId: activeRoadblock?.id || null,
      answersLength: answers.length,
      attemptedStepsLength: attemptedSteps.length,
      documentationAdded,
    }
  }

  function rememberCurrentState() {
    setHistory(current => [...current, snapshot()])
  }

  function goBack() {
    const previous = history[history.length - 1]
    if (!previous) return

    setHistory(current => current.slice(0, -1))
    setActiveRoute(previous.routeId ? routeById(previous.routeId) : null)
    setPhase(previous.phase)
    setGateIndex(previous.gateIndex)
    setStepIndex(previous.stepIndex)
    setActiveRoadblock(previous.roadblockId ? roadblockById(previous.roadblockId) : null)
    setAnswers(current => current.slice(0, previous.answersLength))
    setAttemptedSteps(current => current.slice(0, previous.attemptedStepsLength))
    setDocumentationAdded(previous.documentationAdded)
    onTrackEvent?.({
      eventType: 'host_troubleshooting_back',
      routeId: 'navigator',
      toolId: previous.routeId || previous.roadblockId || 'previous_step',
    })
  }

  function recordAnswer(label, value) {
    setAnswers(current => [...current, { label, value }])
  }

  function openRoadblock(id) {
    const match = roadblockById(id)
    if (!match) return
    setActiveRoadblock(match)
    setPhase('roadblock')
    setDocumentationAdded(false)
    onTrackEvent?.({
      eventType: 'host_roadblock_open',
      routeId: 'navigator',
      toolId: id,
    })
  }

  function openGuidedRoute(id) {
    const target = routeById(id)
    if (target) {
      setActiveRoute(target)
      setGateIndex(0)
      setStepIndex(0)
      setPhase('confirm')
      setActiveRoadblock(null)
      setDocumentationAdded(false)
      return
    }
    onOpenGuidedRoute?.(id)
  }

  function followBranch(branch, { fromGate = false } = {}) {
    if (branch?.roadblockId) {
      openRoadblock(branch.roadblockId)
      return
    }

    if (branch?.next === 'resolved') {
      setPhase('resolved')
      setDocumentationAdded(false)
      return
    }

    if (branch?.next && routeById(branch.next)) {
      openGuidedRoute(branch.next)
      return
    }

    if (branch?.next) {
      const index = nextStepIndex(activeRoute, branch.next)
      if (index >= 0) {
        setStepIndex(index)
        setPhase('steps')
        return
      }
    }

    if (fromGate && gateIndex < (activeRoute?.confirmBeforeProceeding?.length || 0) - 1) {
      setGateIndex(index => index + 1)
      return
    }

    if (fromGate) {
      setPhase('steps')
      setStepIndex(0)
      return
    }

    if (stepIndex < (activeRoute?.steps?.length || 0) - 1) {
      setStepIndex(index => index + 1)
      return
    }

    setPhase('roadblock')
    setActiveRoadblock(roadblockById('roadblock-zoom-product'))
  }

  function chooseGate(value, branch = null) {
    rememberCurrentState()
    recordAnswer(currentGate?.prompt || 'Confirmation', value)
    followBranch(branch, { fromGate: true })
  }

  function chooseOption(option) {
    rememberCurrentState()
    recordAnswer(currentGate?.prompt || 'Confirmation', option)
    const optionBranch = currentGate?.optionBranches?.[option]
    if (optionBranch) {
      followBranch(optionBranch, { fromGate: true })
      return
    }
    if (gateIndex < (activeRoute?.confirmBeforeProceeding?.length || 0) - 1) {
      setGateIndex(index => index + 1)
    } else {
      setPhase('steps')
      setStepIndex(0)
    }
  }

  function confirmStep(result) {
    rememberCurrentState()
    const instruction = platformInstruction || currentStep?.instruction || ''
    setAttemptedSteps(current => [
      ...current,
      {
        id: currentStep?.id,
        instruction,
        confirmation: currentStep?.confirm || '',
        result,
      },
    ])
    const branch = result === 'yes' ? currentStep?.yes : currentStep?.no
    followBranch(branch)
  }

  function changeDevice(nextDevice) {
    setDevice(nextDevice)
    onContextChange?.({ device: nextDevice, role: 'Host' })
    onTrackEvent?.({
      eventType: 'host_device_selected',
      routeId: 'navigator',
      toolId: `host_device_${nextDevice.toLowerCase()}`,
    })
  }

  const activeSuggestedScript = phase === 'resolved'
    ? activeRoute?.scripts?.resolved
    : activeRoute?.scripts?.opening

  async function copySuggestedScript() {
    if (!activeSuggestedScript) return
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(activeSuggestedScript)
      setScriptCopyState('copied')
    } catch {
      setScriptCopyState('failed')
    }
    window.setTimeout(() => setScriptCopyState('idle'), 1600)
    onTrackEvent?.({
      eventType: 'copy_action',
      routeId: 'navigator',
      toolId: `host_route_${activeRoute?.id || 'unknown'}_suggested_script`,
    })
  }

  function addToDocumentation(kind) {
    if (!onAddToDocumentation) return

    const block = kind === 'roadblock' ? activeRoadblock : null
    const issue = activeRoute?.title || block?.title || 'Host Zoom assistance'
    const answered = answers.length
      ? `Confirmed before proceeding:\n${answers.map(item => `- ${item.label}: ${item.value}`).join('\n')}`
      : ''
    const attempted = attemptedSteps.length
      ? `Troubleshooting performed:\n${attemptedSteps.map((item, index) => `${index + 1}. ${item.instruction} — ${item.result === 'yes' ? 'Confirmed/working' : 'Not resolved'}`).join('\n')}`
      : ''
    const stepsResult = [answered, attempted, block?.documentationSummary || ''].filter(Boolean).join('\n\n')
    const resolutionNextSteps = kind === 'resolved'
      ? activeRoute?.documentation?.resolved || 'Resolved within approved Tier 1 Zoom support.'
      : [
          block?.nextAction ? `Next action: ${block.nextAction}` : '',
          block?.script ? `Suggested wording: ${block.script}` : '',
        ].filter(Boolean).join('\n\n')

    onAddToDocumentation({
      id: `host-${activeRoute?.id || block?.id || 'support'}-${Date.now()}`,
      device: documentationDevice(device),
      exactIssue: issue,
      stepsResult,
      resolutionNextSteps,
      outcome: kind === 'resolved' ? 'Resolved' : '',
      meta: {
        hostGuidedRouteId: activeRoute?.id || null,
        roadblockId: block?.id || null,
        result: kind,
      },
    })
    setDocumentationAdded(true)
    onTrackEvent?.({
      eventType: 'documentation_handoff',
      routeId: 'navigator',
      toolId: kind === 'resolved' ? 'host_resolved_to_call_documentation' : 'host_roadblock_to_call_documentation',
    })
  }

  const title = activeRoadblock && phase === 'roadblock'
    ? activeRoadblock.title
    : activeRoute?.title || roadblock?.title || 'Host support'

  return <div className="drawer-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
    <aside
      ref={dialogRef}
      tabIndex={-1}
      className="process-drawer host-support-drawer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="host-support-title"
    >
      <header className="drawer-header">
        <div>
          <span className="process-category">Arbitrator / Host</span>
          <h2 id="host-support-title">{title}</h2>
          <p>Client-approved Tier 1 boundary + current official Zoom Support guidance.</p>
        </div>
        <button className="drawer-close" type="button" aria-label="Close host support" onClick={onClose}>×</button>
      </header>

      <div className="host-support-context" aria-label="Host support context">
        <div>
          <small>Caller role</small>
          <strong>Host / Arbitrator</strong>
        </div>
        <div>
          <small>Device</small>
          <div className="host-device-options">
            {DEVICE_OPTIONS.map(option => <button
              type="button"
              key={option}
              aria-pressed={device === option}
              onClick={() => changeDevice(option)}
            >{option}</button>)}
          </div>
        </div>
      </div>

      <div className="drawer-content host-support-content">
        {history.length > 0 && <div className="host-troubleshooting-back-row">
          <button
            type="button"
            className="guide-back-step host-troubleshooting-back"
            aria-label="Back to previous troubleshooting step"
            onClick={goBack}
          >
            ← Back
          </button>
          <small>Return to the previous confirmation or troubleshooting step.</small>
        </div>}

        {phase !== 'roadblock' && activeSuggestedScript && <section className="host-common-issue-script-card" aria-label="Suggested agent script">
          <div className="common-issue-script-heading">
            <div>
              <p className="eyebrow">Suggested agent script</p>
              <h3>Source-aligned wording</h3>
            </div>
            <button type="button" onClick={copySuggestedScript}>
              {scriptCopyState === 'copied' ? 'Copied ✓' : scriptCopyState === 'failed' ? 'Copy failed' : 'Copy Script'}
            </button>
          </div>
          <blockquote>{activeSuggestedScript}</blockquote>
          <div className="common-issue-script-source">
            <span>Adapted for the live call from the approved client scope and current official Zoom Support behavior.</span>
            {sources[0]?.url && <a href={sources[0].url} target="_blank" rel="noreferrer">
              Verify in Zoom Support — {sources[0].title} ↗
            </a>}
          </div>
        </section>}

        {phase === 'confirm' && currentGate && <section className="host-confirm-card">
          <p className="eyebrow">Confirm before proceeding</p>
          <h3>{currentGate.prompt}</h3>
          {currentGate.options?.length ? <div className="host-choice-grid">
            {currentGate.options.map(option => <button type="button" key={option} onClick={() => chooseOption(option)}>{option}</button>)}
          </div> : currentGate.captureAs ? <form onSubmit={event => {
            event.preventDefault()
            const value = new FormData(event.currentTarget).get('confirmation')
            if (String(value || '').trim()) chooseGate(String(value).trim())
          }}>
            <input name="confirmation" aria-label={currentGate.prompt} placeholder="Enter what the arbitrator sees or reports" />
            <button type="submit">Confirm and continue</button>
          </form> : <div className="host-choice-grid host-choice-grid-three">
            <button type="button" onClick={() => chooseGate('Yes', currentGate.yes)}>Yes</button>
            <button type="button" onClick={() => chooseGate('No', currentGate.no)}>No</button>
            {currentGate.unsure && <button type="button" onClick={() => chooseGate('Not sure', currentGate.unsure)}>Not sure</button>}
          </div>}
          <small>Confirmation {gateIndex + 1} of {activeRoute.confirmBeforeProceeding.length}</small>
        </section>}

        {phase === 'steps' && currentStep && <section className="host-step-card">
          <p className="eyebrow">Approved troubleshooting</p>
          <h3>Step {stepIndex + 1}</h3>

          {currentStep.platformInstructions && !device && <div className="host-device-required">
            <strong>Select the arbitrator’s device first.</strong>
            <p>Ozzie will show only the instruction for that platform.</p>
          </div>}

          {(!currentStep.platformInstructions || device) && <>
            <p className="host-step-instruction">{platformInstruction || currentStep.instruction}</p>
            <div className="host-step-confirm">
              <span>Confirm with the arbitrator</span>
              <strong>{currentStep.confirm}</strong>
            </div>
            <div className="host-step-actions">
              <button type="button" className="guide-resolved" onClick={() => confirmStep('yes')}>Yes / confirmed</button>
              <button type="button" className="guide-not-resolved" onClick={() => confirmStep('no')}>No / not resolved</button>
            </div>
          </>}
        </section>}

        {phase === 'resolved' && <section className="guide-resolution-state resolved host-resolution-card" role="status">
          <span>✓</span>
          <div>
            <p className="eyebrow">Resolved within Tier 1</p>
            <h3>Stop troubleshooting here.</h3>
            <p>{activeRoute?.documentation?.resolved || 'The approved Host path resolved the issue.'}</p>
            <button type="button" onClick={() => addToDocumentation('resolved')}>{documentationAdded ? 'Added to Call Documentation ✓' : 'Add to Call Documentation'}</button>
          </div>
        </section>}

        {phase === 'roadblock' && activeRoadblock && <section className="host-roadblock-card" role="status">
          <p className="eyebrow">Tier 1 roadblock</p>
          <h3>{activeRoadblock.title}</h3>
          <dl>
            <div><dt>Why we stop / change path</dt><dd>{activeRoadblock.trigger}</dd></div>
            <div><dt>Agent boundary</dt><dd>{activeRoadblock.agentBoundary}</dd></div>
            <div><dt>What to do next</dt><dd>{activeRoadblock.nextAction}</dd></div>
          </dl>
          <div className="host-roadblock-script">
            <span>Suggested agent wording</span>
            <blockquote>{activeRoadblock.script}</blockquote>
          </div>
          <button type="button" onClick={() => addToDocumentation('roadblock')}>{documentationAdded ? 'Added to Call Documentation ✓' : 'Add roadblock to Call Documentation'}</button>
        </section>}

        {activeRoute && sources.length > 0 && <details className="host-source-details">
          <summary>Official Zoom sources</summary>
          <div>
            {sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a>)}
          </div>
        </details>}
      </div>
    </aside>
  </div>
}
