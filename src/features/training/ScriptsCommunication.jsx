import { useEffect, useMemo, useState } from 'react'
import { PROCESSES } from '../../data/processes'
import { COMMON_ISSUE_ROUTES } from '../navigator/commonIssueRoutes'
import { SCENARIO_SCRIPTS } from './scenarioScripts'
import { getScenarioDiscovery } from './scenarioDiscovery'
import {
  COMMUNICATION_AVOID_PAIRS,
  COMMUNICATION_SECTIONS,
  COMMUNICATION_SELF_CHECK,
  COMMUNICATION_VERIFIED_AT,
} from './communicationScripts'

function SourceChips({ ids }) {
  const sources = useMemo(
    () => ids.map(id => PROCESSES.find(process => process.id === id)).filter(Boolean),
    [ids],
  )

  return <div className="communication-sources" aria-label="Approved source documents">
    {sources.map(source => <span key={source.id}>{source.title}</span>)}
  </div>
}

function CopyPhraseButton({ text, id, copiedId, onCopy }) {
  return <button
    type="button"
    className="communication-copy"
    onClick={() => onCopy(text, id)}
  >
    {copiedId === id ? 'Copied' : 'Copy phrase'}
  </button>
}

function PhraseCard({ phrase, sectionId, index, copiedId, onCopy }) {
  const copyId = sectionId + '-' + index

  return <article className="communication-phrase-card">
    <div>
      <p className="eyebrow">{phrase.label}</p>
      <p className="communication-phrase">“{phrase.text}”</p>
    </div>
    <CopyPhraseButton
      text={phrase.text}
      id={copyId}
      copiedId={copiedId}
      onCopy={onCopy}
    />
  </article>
}

function FrameworkCard({ item, sectionId, index, copiedId, onCopy }) {
  const copyId = sectionId + '-framework-' + index

  return <article className="communication-framework-card">
    <div className="communication-framework-stage">
      <span>{index + 1}</span>
      <div>
        <strong>{item.stage}</strong>
        <p>{item.remember}</p>
      </div>
    </div>
    <div className="communication-framework-phrase">
      <p>“{item.phrase}”</p>
      <CopyPhraseButton
        text={item.phrase}
        id={copyId}
        copiedId={copiedId}
        onCopy={onCopy}
      />
    </div>
  </article>
}

function ScenarioDiscoveryCard({ scenarioId, route }) {
  const [answers, setAnswers] = useState({})
  const discovery = getScenarioDiscovery(scenarioId, route, answers)

  if (!discovery) {
    return <article className="scenario-script-card scenario-script-discovery">
      <p className="eyebrow">Ask only what changes the route</p>
      <h4>Discovery questions</h4>
      <ol>{(route?.confirm ?? []).map(question => <li key={question}>{question}</li>)}</ol>
    </article>
  }

  const hasAnswers = Object.keys(answers).length > 0

  return <article className="scenario-script-card scenario-script-discovery scenario-guided-discovery">
    <div className="scenario-discovery-heading">
      <div>
        <p className="eyebrow">Ask only what changes the route</p>
        <h4>Guided discovery</h4>
        <p>Select what the caller tells you. OGCon will narrow the next approved step.</p>
      </div>
      <button
        type="button"
        className="scenario-discovery-reset"
        disabled={!hasAnswers}
        onClick={() => setAnswers({})}
      >Reset answers</button>
    </div>

    <div className="scenario-discovery-questions">
      {discovery.questions.map((question, index) => <fieldset key={question.id}>
        <legend><span>{index + 1}</span>{question.prompt}</legend>
        <div className="scenario-discovery-options">
          {question.options.map(choice => <button
            key={choice.value}
            type="button"
            aria-pressed={answers[question.id] === choice.value}
            onClick={() => setAnswers(current => ({ ...current, [question.id]: choice.value }))}
          >{choice.label}</button>)}
        </div>
      </fieldset>)}
    </div>

    <div
      className={`scenario-discovery-result scenario-discovery-result-${discovery.recommendation.state}`}
      aria-live="polite"
    >
      <span>{discovery.recommendation.state === 'ready' ? 'Recommended next step' : 'Discovery status'}</span>
      <strong>{discovery.recommendation.title}</strong>
      <p>{discovery.recommendation.text}</p>
      {discovery.recommendation.route && <small>Suggested route · {discovery.recommendation.route}</small>}
    </div>
  </article>
}

export function ScriptsCommunication({ onReportContextChange = () => {} }) {
  const [mode, setMode] = useState('language')
  const [activeSectionId, setActiveSectionId] = useState(COMMUNICATION_SECTIONS[0].id)
  const [activeScenarioId, setActiveScenarioId] = useState(SCENARIO_SCRIPTS[0].id)
  const [copiedId, setCopiedId] = useState(null)
  const [copyError, setCopyError] = useState('')
  const activeSection = COMMUNICATION_SECTIONS.find(section => section.id === activeSectionId) ?? COMMUNICATION_SECTIONS[0]
  const activeScenario = SCENARIO_SCRIPTS.find(scenario => scenario.id === activeScenarioId) ?? SCENARIO_SCRIPTS[0]
  const activeRoute = COMMON_ISSUE_ROUTES.find(route => route.id === activeScenario.routeId)

  useEffect(() => {
    const modeLabels = { language: 'Call Language', scenarios: 'Scenario Scripts', avoid: 'Avoid / Use Instead' }
    onReportContextChange({
      selected_tab: modeLabels[mode] || mode,
      current_section: mode === 'language' ? activeSection.title : mode === 'scenarios' ? activeScenario.label : 'Wording guardrails',
    })
  }, [mode, activeSection.title, activeScenario.label, onReportContextChange])

  async function copyPhrase(text, id) {
    setCopyError('')
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      window.setTimeout(() => setCopiedId(current => current === id ? null : current), 1600)
    } catch {
      setCopiedId(null)
      setCopyError('Copy failed. Select the phrase manually.')
    }
  }

  return <section className="scripts-communication" aria-labelledby="scripts-title">
    <div className="communication-intro">
      <div>
        <p className="eyebrow">Phase 4 · Scripts &amp; communication</p>
        <h2 id="scripts-title">Live-call language that stays inside scope</h2>
        <p>Use these as natural starting points—not as a rigid script. Keep the approved meaning, support boundary, and one-step-at-a-time method intact.</p>
      </div>
      <span className="device-verified">Verified {COMMUNICATION_VERIFIED_AT}</span>
    </div>

    <div className="communication-mode-tabs" role="tablist" aria-label="Communication tools">
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'language'}
        onClick={() => setMode('language')}
      >Call Language</button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'scenarios'}
        onClick={() => setMode('scenarios')}
      >Scenario Scripts</button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'avoid'}
        onClick={() => setMode('avoid')}
      >Avoid / Use Instead</button>
    </div>

    {mode === 'language'
      ? <>
          <div className="communication-section-picker" role="tablist" aria-label="Call language stages">
            {COMMUNICATION_SECTIONS.map(section => <button
              key={section.id}
              type="button"
              role="tab"
              aria-selected={activeSection.id === section.id}
              onClick={() => setActiveSectionId(section.id)}
            >{section.title}</button>)}
          </div>

          <section className="communication-panel" role="tabpanel" aria-label={activeSection.title}>
            <header>
              <div>
                <p className="eyebrow">Live-call stage</p>
                <h3>{activeSection.title}</h3>
                <p>{activeSection.purpose}</p>
              </div>
              <SourceChips ids={activeSection.sourceProcessIds} />
            </header>

            {activeSection.framework
              ? <div className="communication-framework">
                  {activeSection.framework.map((item, index) => <FrameworkCard
                    key={item.stage}
                    item={item}
                    sectionId={activeSection.id}
                    index={index}
                    copiedId={copiedId}
                    onCopy={copyPhrase}
                  />)}
                </div>
              : <div className="communication-phrase-grid">
                  {activeSection.phrases.map((phrase, index) => <PhraseCard
                    key={phrase.label}
                    phrase={phrase}
                    sectionId={activeSection.id}
                    index={index}
                    copiedId={copiedId}
                    onCopy={copyPhrase}
                  />)}
                </div>}
          </section>

          <section className="communication-self-check" aria-labelledby="communication-self-check-title">
            <div>
              <p className="eyebrow">Before you close or refer</p>
              <h3 id="communication-self-check-title">Agent self-check</h3>
            </div>
            <div>
              {COMMUNICATION_SELF_CHECK.map(item => <label key={item}>
                <input type="checkbox" />
                <span>{item}</span>
              </label>)}
            </div>
          </section>
        </>
      : mode === 'scenarios'
        ? <section className="scenario-scripts-panel" role="tabpanel" aria-label="Scenario scripts">
            <div className="scenario-script-picker" role="tablist" aria-label="Common support scenarios">
              {SCENARIO_SCRIPTS.map(scenario => <button
                key={scenario.id}
                type="button"
                role="tab"
                aria-selected={activeScenario.id === scenario.id}
                onClick={() => setActiveScenarioId(scenario.id)}
              >{scenario.label}</button>)}
            </div>

            <section className="scenario-script-detail" aria-label={activeScenario.label + ' scenario'}>
              <header>
                <div>
                  <p className="eyebrow">Common Issue linked script</p>
                  <h3>{activeScenario.label}</h3>
                  <p>{activeRoute?.classificationNote}</p>
                </div>
                {activeRoute && <SourceChips ids={activeRoute.processIds} />}
              </header>

              <div className="scenario-script-grid">
                <article className="scenario-script-card scenario-script-opening">
                  <p className="eyebrow">Start here</p>
                  <h4>Opening line</h4>
                  <p>“{activeScenario.opening}”</p>
                  <CopyPhraseButton
                    text={activeScenario.opening}
                    id={activeScenario.id + '-opening'}
                    copiedId={copiedId}
                    onCopy={copyPhrase}
                  />
                </article>

                <ScenarioDiscoveryCard
                  key={activeScenario.id}
                  scenarioId={activeScenario.id}
                  route={activeRoute}
                />

                <article className="scenario-script-card">
                  <p className="eyebrow">Guide</p>
                  <h4>Next-step phrasing</h4>
                  <p>“{activeScenario.guidePhrase}”</p>
                  <CopyPhraseButton
                    text={activeScenario.guidePhrase}
                    id={activeScenario.id + '-guide'}
                    copiedId={copiedId}
                    onCopy={copyPhrase}
                  />
                  {activeRoute?.checks?.[0] && <div className="scenario-route-anchor">
                    <strong>Approved first action</strong>
                    <p>{activeRoute.checks[0].instruction}</p>
                    <span>Expected: {activeRoute.checks[0].expected}</span>
                  </div>}
                </article>

                <article className="scenario-script-card">
                  <p className="eyebrow">Confirm</p>
                  <h4>Verify the result</h4>
                  <p>“{activeScenario.confirmPhrase}”</p>
                  <CopyPhraseButton
                    text={activeScenario.confirmPhrase}
                    id={activeScenario.id + '-confirm'}
                    copiedId={copiedId}
                    onCopy={copyPhrase}
                  />
                  {activeRoute?.success && <div className="scenario-route-anchor">
                    <strong>Resolved when</strong>
                    <p>{activeRoute.success}</p>
                  </div>}
                </article>

                <article className="scenario-script-card scenario-script-boundary">
                  <p className="eyebrow">Boundary / referral</p>
                  <h4>When basic support stops</h4>
                  <p>“{activeScenario.boundaryPhrase}”</p>
                  <CopyPhraseButton
                    text={activeScenario.boundaryPhrase}
                    id={activeScenario.id + '-boundary'}
                    copiedId={copiedId}
                    onCopy={copyPhrase}
                  />
                  {activeRoute?.unresolved && <div className="scenario-route-anchor">
                    <strong>Route boundary</strong>
                    <p>{activeRoute.unresolved}</p>
                  </div>}
                </article>

                <article className="scenario-script-card scenario-linked-route">
                  <p className="eyebrow">Use with</p>
                  <h4>{activeRoute?.title}</h4>
                  <p>{activeRoute?.subtitle}</p>
                  <span className="scenario-route-id">Common Issue · {activeRoute?.id}</span>
                </article>
              </div>
            </section>
          </section>
        : <section className="communication-avoid-panel" role="tabpanel" aria-label="Avoid and use instead">
          <header>
            <div>
              <p className="eyebrow">Wording guardrails</p>
              <h3>Avoid assumptions, blame, and promises you cannot keep</h3>
              <p>These replacements come from the approved communication method and support-boundary process.</p>
            </div>
          </header>

          <div className="communication-avoid-grid">
            {COMMUNICATION_AVOID_PAIRS.map((pair, index) => <article key={pair.avoid}>
              <div className="communication-avoid-side">
                <span>Avoid</span>
                <p>{pair.avoid}</p>
              </div>
              <div className="communication-use-side">
                <span>Use instead</span>
                <p>{pair.use}</p>
                <CopyPhraseButton
                  text={pair.use.replace(/^“|”$/g, '')}
                  id={'avoid-' + index}
                  copiedId={copiedId}
                  onCopy={copyPhrase}
                />
              </div>
              <p className="communication-reason">{pair.reason}</p>
              <SourceChips ids={pair.sourceProcessIds} />
            </article>)}
          </div>
        </section>}

    {copyError && <p className="communication-copy-error" role="status">{copyError}</p>}
  </section>
}
