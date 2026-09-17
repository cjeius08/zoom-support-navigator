const HEADING_PATTERN = /^(?:\d+\.\s*)?(Purpose|Applies To|When To Use|Requirements(?:\s*\/\s*Before You Begin| and Important (?:Notes|Behavior))?|Key Information and Requirements|Important Requirement|Introduction|Process \/ Step-by-Step Guide|Sample Script|Notes?|Important (?:Limitations and Reminders|Transfer Limitations|Notes)|Quick Guide \/ Remember the Process|Quick Flow|Key Reminders|Referral \/ Roadblock Matrix|Immediate Stop \/ Refer Triggers|When to Stop and Refer for Additional Assistance|Who (?:the )?Arbitrator Should Contact|Reference)(?::\s*(.*))?$/i

export function processSections(text) {
  const sections = []; let current = { heading: 'Overview', lines: [] }
  for (const raw of String(text || '').split('\n')) {
    const line = raw.trim()
    if (!line) continue
    const match = line.match(HEADING_PATTERN)
    if (match) { if (current.lines.length) sections.push(current); current = { heading: match[1], lines: match[2] ? [match[2]] : [] } }
    else current.lines.push(line)
  }
  if (current.lines.length) sections.push(current)
  return sections
}

const STEP_PATTERN = /^(?:step\s*)?(\d+)(?:\.|\s*[—–-])\s*(.+)$/i
const LETTERED_STEP_PATTERN = /^([A-Z](?:\d+)?)\.\s+(.+)$/
const SAMPLE_SCRIPT_PATTERN = /^sample (?:closing )?scripts?\s*:?\s*$/i
const SECTION_KIND = [
  [/^quick (?:guide \/ remember the process|flow)|^key reminders$/i, 'quick'],
  [/^requirements|^key information and requirements|^important requirement/i, 'requirement'],
  [/^important (?:limitations|transfer limitations)|^what agents must not do|^scope of support/i, 'limitation'],
  [/^notes?$/i, 'note'],
  [/^referral|^immediate stop|^when to stop|^who (?:the )?arbitrator should contact|^roadblock/i, 'referral'],
  [/^reference$/i, 'reference'],
  [/^process \/ step-by-step guide$/i, 'process'],
]

function headingKind(line) {
  const heading = line.replace(/:$/, '').trim()
  return SECTION_KIND.find(([pattern]) => pattern.test(heading))?.[1] ?? null
}

function calloutLabel(kind) {
  return ({ requirement: 'IMPORTANT REQUIREMENT', limitation: 'LIMITATION', note: 'NOTE', referral: 'WHEN TO REFER' })[kind] ?? 'IMPORTANT'
}

function conservativeQuestion(lines) {
  const source = lines.join(' ')
  if (/device|platform|Windows|macOS|Linux|Android|iOS/i.test(source)) return 'What device or operating system are you using?'
  if (/error message/i.test(source)) return 'What is the exact wording of the error message?'
  return ''
}

function derivedScript(process) {
  return `Let’s work through the approved Zoom steps for ${process.title.trim()}. Please let me know when you are ready to continue.`
}

function unnumberedStep(line, activeKind) {
  return activeKind === 'process'
    && !LETTERED_STEP_PATTERN.test(line)
    && line.length <= 110
    && /^[A-Z]/.test(line)
    && !/[.!?:]$/.test(line)
    && !/^(?:option|category|platform|control|what it does|agent reminder|question|action)$/i.test(line)
}

export function buildCallGuide(process) {
  const lines = String(process?.text || '').split('\n').map((line) => line.trim()).filter(Boolean)
  const steps = []
  const callouts = []
  const globalScripts = []
  const quickGuide = []
  let currentStep = null
  let currentCallout = null
  let activeKind = null
  let inProcess = false
  let collectingScript = false

  const flushScript = () => {
    if (!collectingScript) return
    collectingScript = false
  }
  const addScript = (line) => {
    if (currentStep) currentStep.scripts.push(line)
    else globalScripts.push(line)
  }

  for (const [index, line] of lines.entries()) {
    const kind = headingKind(line)
    const lettered = line.match(LETTERED_STEP_PATTERN)
    const useLetteredStep = Boolean(lettered && (/\d/.test(lettered[1]) || !STEP_PATTERN.test(lines[index + 1] || '')))
    const stepMatch = inProcess ? (line.match(STEP_PATTERN) || (useLetteredStep ? lettered : null)) : null
    if (SAMPLE_SCRIPT_PATTERN.test(line)) {
      collectingScript = true
      currentCallout = null
      continue
    }
    if (kind) {
      flushScript()
      activeKind = kind
      currentCallout = null
      if (kind === 'process') inProcess = true
      continue
    }
    if (stepMatch || unnumberedStep(line, activeKind)) {
      flushScript()
      currentCallout = null
      currentStep = { number: stepMatch?.[1] && /^\d+$/.test(stepMatch[1]) ? Number(stepMatch[1]) : (stepMatch?.[1] ?? String(steps.length + 1)), title: stepMatch?.[2] ?? line, instructions: [], scripts: [], confirmations: [], visualReferences: [] }
      steps.push(currentStep)
      continue
    }
    if (collectingScript) {
      addScript(line)
      continue
    }
    if (activeKind === 'quick') {
      quickGuide.push(line)
      continue
    }
    if (['requirement', 'limitation', 'note', 'referral'].includes(activeKind)) {
      if (!currentCallout || currentCallout.kind !== activeKind) {
        currentCallout = { kind: activeKind, label: calloutLabel(activeKind), lines: [] }
        callouts.push(currentCallout)
      }
      currentCallout.lines.push(line)
      continue
    }
    if (activeKind === 'reference') continue
    if (currentStep) {
      currentStep.instructions.push(line)
      if (/\b(confirm|verify|check whether|able to|expected result|try joining|try again|return to the meeting)\b/i.test(line)) currentStep.confirmations.push(line)
    }
  }

  const allScripts = [...steps.flatMap((step) => step.scripts), ...globalScripts]
  const sourceLines = [...steps.flatMap((step) => step.instructions), ...callouts.flatMap((callout) => callout.lines)]
  const questionLines = sourceLines.filter((line) => /^(ask|confirm|determine|clarify|identify)\b/i.test(line))
  const derivedQuestion = questionLines.length ? '' : conservativeQuestion(sourceLines)
  const visualReferences = process?.visualReferences || []
  for (const visual of visualReferences) {
    const target = steps.find((step) => {
      const titleWords = step.title.toLowerCase().split(/\W+/).filter((word) => word.length > 3)
      const visualText = `${visual.title || ''} ${visual.documentStep || ''}`.toLowerCase()
      return titleWords.some((word) => visualText.includes(word))
    })
    if (target) target.visualReferences.push(visual)
  }

  return {
    steps,
    quickGuide,
    callouts,
    referralDetails: [process?.referral, ...callouts.filter((callout) => callout.kind === 'referral').flatMap((callout) => callout.lines)].filter(Boolean),
    whatToAsk: questionLines.map((text) => ({ text, origin: 'source' })).concat(derivedQuestion ? [{ text: derivedQuestion, origin: 'derived' }] : []),
    suggestedScript: allScripts.length ? { label: 'Suggested Script', origin: 'source', text: allScripts[0] } : { label: 'Console Suggested Script', origin: 'derived', text: derivedScript(process) },
  }
}
