const HEADING_PATTERN = /^(?:\d+\.\s*)?(Purpose|Applies To|When To Use|Requirements(?:\s*\/\s*Before You Begin| and Important (?:Notes|Behavior))?|Key Information and Requirements|Important Requirement|Introduction|Process \/ Step-by-Step Guide|Sample Script|Notes?|Important (?:Limitations and Reminders|Transfer Limitations|Notes)|Quick Guide \/ Remember the Process|Quick Flow|Key Reminders|Referral \/ Roadblock Matrix|Immediate Stop \/ Refer Triggers|When to Stop and Refer for Additional Assistance|Who (?:the )?Arbitrator Should Contact|Reference)(?::\s*(.*))?$/i

export const PLATFORM_LABELS = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
  android: 'Android',
  ios: 'iOS',
  web: 'Web / Browser',
}

const PLATFORM_MATCHERS = [
  ['windows', /\bWindows\b/i],
  ['macos', /\bmacOS\b|\bMac\b/i],
  ['linux', /\bLinux\b/i],
  ['android', /\bAndroid\b/i],
  ['ios', /\biOS\b|\biPhone\b|\biPad\b/i],
  ['web', /\bZoom Web App\b|\bweb browser\b|\bbrowser\b/i],
]

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
const ROUTE_PATTERN = /^([A-Z](?:\d+)?)\.\s+(.+)$/
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

function unique(values) {
  return [...new Set(values)]
}

export function platformsFromText(text) {
  return PLATFORM_MATCHERS
    .filter(([, pattern]) => pattern.test(String(text || '')))
    .map(([id]) => id)
}

function routeLabel(raw) {
  const platformNames = '(?:Windows|macOS|Mac|Linux|Android|iOS|iPhone|iPad|Zoom Web App|Web App|Browser)'
  const prefix = new RegExp(`^${platformNames}(?:\\s*[|/+,&]\\s*${platformNames})*\\s*(?:[-—–:]\\s*)?`, 'i')
  return raw.replace(prefix, '').trim()
}

function standalonePlatformHeading(line) {
  const platforms = platformsFromText(line)
  if (!platforms.length || line.length > 90) return null
  const stripped = line
    .replace(/\b(?:Windows|macOS|Mac|Linux|Android|iOS|iPhone|iPad|Zoom Web App|Web App|Browser)\b/gi, '')
    .replace(/[|/+,&\s:—–-]/g, '')
  return stripped ? null : platforms
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
    && !/^(?:Zoom Download Center|Uninstall Zoom|CleanZoom utility)$/i.test(line)
    && !ROUTE_PATTERN.test(line)
    && line.length <= 110
    && /^[A-Z]/.test(line)
    && !/[.!?:]$/.test(line)
    && !/^(?:option|category|platform|control|what it does|agent reminder|question|action)$/i.test(line)
}

function confirmationLine(line) {
  return /\b(confirm|verify|check whether|able to|expected result|try joining|try again|return to the meeting)\b/i.test(line)
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
  let currentPlatforms = []
  let currentRouteId = null
  let currentRouteLabel = ''
  const parentPlatforms = {}

  const flushScript = () => {
    if (!collectingScript) return
    collectingScript = false
  }
  const addScript = (line) => {
    if (currentStep) currentStep.scripts.push(line)
    else globalScripts.push(line)
  }

  for (const line of lines) {
    const kind = headingKind(line)
    if (SAMPLE_SCRIPT_PATTERN.test(line)) {
      if (/^sample closing scripts?/i.test(line)) currentStep = null
      collectingScript = true
      currentCallout = null
      continue
    }
    if (kind) {
      flushScript()
      activeKind = kind
      currentCallout = null
      currentStep = null
      inProcess = kind === 'process'
      if (kind === 'process') {
        currentPlatforms = []
        currentRouteId = null
        currentRouteLabel = ''
      }
      continue
    }

    if (inProcess && activeKind === 'process') {
      const routeMatch = line.match(ROUTE_PATTERN)
      if (routeMatch) {
        flushScript()
        currentStep = null
        currentCallout = null
        const [, code, rawLabel] = routeMatch
        const detectedPlatforms = platformsFromText(rawLabel)
        const parentCode = code.charAt(0)
        if (code.length === 1) {
          currentPlatforms = detectedPlatforms
          parentPlatforms[parentCode] = detectedPlatforms
        } else {
          currentPlatforms = detectedPlatforms.length
            ? detectedPlatforms
            : (parentPlatforms[parentCode] || currentPlatforms)
        }
        currentRouteId = code.toLowerCase()
        currentRouteLabel = routeLabel(rawLabel) || rawLabel
        continue
      }

      const platformHeading = standalonePlatformHeading(line)
      if (platformHeading) {
        flushScript()
        currentStep = null
        currentPlatforms = platformHeading
        currentRouteId = `platform-${platformHeading.join('-')}`
        currentRouteLabel = platformHeading.map((id) => PLATFORM_LABELS[id]).join(' / ')
        continue
      }
    }

    const stepMatch = inProcess && activeKind === 'process' ? line.match(STEP_PATTERN) : null
    if (stepMatch || unnumberedStep(line, activeKind)) {
      flushScript()
      currentCallout = null
      currentStep = {
        number: stepMatch ? Number(stepMatch[1]) : String(steps.length + 1),
        title: stepMatch?.[2] ?? line,
        instructions: [],
        scripts: [],
        confirmations: [],
        visualReferences: [],
        platforms: [...currentPlatforms],
        routeId: currentRouteId,
        routeLabel: currentRouteLabel,
      }
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
      if (confirmationLine(line)) currentStep.confirmations.push(line)
      else currentStep.instructions.push(line)
    }
  }

  const allScripts = [...steps.flatMap((step) => step.scripts), ...globalScripts]
  const sourceLines = [...steps.flatMap((step) => [...step.instructions, ...step.confirmations]), ...callouts.flatMap((callout) => callout.lines)]
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

  const applicabilityLine = lines.find((line) => /^Applies To:/i.test(line)) || ''
  const availablePlatforms = unique([
    ...platformsFromText(applicabilityLine),
    ...steps.flatMap((step) => step.platforms),
  ])

  const routes = []
  const seenRoutes = new Set()
  for (const step of steps) {
    const id = step.routeId || 'main'
    if (seenRoutes.has(id)) continue
    seenRoutes.add(id)
    routes.push({
      id,
      label: step.routeLabel || 'Main approved steps',
      platforms: [...step.platforms],
    })
  }

  return {
    steps,
    routes,
    availablePlatforms,
    globalScripts,
    quickGuide,
    callouts,
    referralDetails: [process?.referral].filter(Boolean),
    whatToAsk: questionLines.map((text) => ({ text, origin: 'source' })).concat(derivedQuestion ? [{ text: derivedQuestion, origin: 'derived' }] : []),
    suggestedScript: allScripts.length ? { label: 'Suggested Script', origin: 'source', text: allScripts.join('\n\n') } : { label: 'Console Suggested Script', origin: 'derived', text: derivedScript(process) },
  }
}
