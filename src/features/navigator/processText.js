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

const DESKTOP_PLATFORMS = ['windows', 'macos', 'linux']
const MOBILE_PLATFORMS = ['android', 'ios']

const PROCESS_PLATFORM_OVERRIDES = {
  'enabling-and-managing-multiple-audio-input-channels-in-zoom': ['windows', 'macos'],
  'viewing-participants-already-in-a-meeting-before-joining': ['windows', 'macos'],
}

const PROCESS_DEFAULT_STEP_PLATFORM_OVERRIDES = {
  'adjusting-the-volume-of-a-zoom-meeting': ['windows', 'macos', 'linux'],
  'muting-your-microphone-when-joining-a-zoom-meeting': ['windows', 'macos', 'linux'],
  'zoom-camera-troubleshooting-during-a-meeting': ['windows', 'macos'],
}

const PROCESS_ROUTE_PLATFORM_OVERRIDES = {
  'adjusting-the-volume-of-a-zoom-meeting': {
    a: ['windows', 'macos', 'linux'],
    b: ['windows', 'macos', 'linux'],
    c: ['windows'],
  },
  'muting-your-microphone-when-joining-a-zoom-meeting': {
    a: ['windows', 'macos', 'linux'],
    b: ['windows', 'macos', 'linux'],
  },
  'using-bluetooth-headphones-with-zoom-on-android-ios': {
    c: ['windows'],
    d: ['windows'],
    e: ['windows'],
    f: ['windows'],
    g: ['windows'],
  },
}

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
const LETTERED_PATTERN = /^([A-Z](?:\d+)?)\.\s+(.+)$/
const SAMPLE_SCRIPT_PATTERN = /^sample (?:closing )?scripts?\s*:?\s*$/i
const SOURCE_LINK_LABEL_PATTERN = /^(?:Using in-meeting chat|Zoom-supported USB devices|Testing Zoom audio settings|Zoom advanced audio settings|Granting Zoom permissions on macOS|Unmuting in a Zoom meeting|Testing your video before a meeting|Troubleshooting video crashes)$/i
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
  const heading = line.replace(/^\d+\.\s*/, '').replace(/:$/, '').trim()
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

function inferApplicationPlatforms(process, applicabilityLine) {
  const explicit = platformsFromText(applicabilityLine)
  const inferred = [...explicit]
  const text = String(applicabilityLine || '')

  if (/desktop app|desktop application/i.test(text) && !explicit.some((id) => DESKTOP_PLATFORMS.includes(id))) {
    inferred.push('windows', 'macos')
  }
  if (/mobile app|mobile application|mobile users?/i.test(text) && !explicit.some((id) => MOBILE_PLATFORMS.includes(id))) {
    inferred.push('android', 'ios')
  }
  if (/supported web browsers?|web app/i.test(text) && !explicit.includes('web')) {
    inferred.push('web')
  }

  const override = PROCESS_PLATFORM_OVERRIDES[process?.id] || []
  return unique([...inferred, ...override])
}

function platformsFromRouteLabel(label, applicationPlatforms) {
  const explicit = platformsFromText(label)
  if (explicit.length) return explicit

  if (/\bdesktop\b/i.test(label)) {
    const scoped = applicationPlatforms.filter((id) => DESKTOP_PLATFORMS.includes(id))
    return scoped.length ? scoped : ['windows', 'macos']
  }
  if (/\bmobile\b/i.test(label)) {
    const scoped = applicationPlatforms.filter((id) => MOBILE_PLATFORMS.includes(id))
    return scoped.length ? scoped : MOBILE_PLATFORMS
  }
  return []
}

function routeLabel(raw) {
  const platformNames = '(?:Windows|macOS|Mac|Linux|Android|iOS|iPhone|iPad|Zoom Web App|Web App|Browser|Desktop|Mobile)'
  const prefix = new RegExp(`^${platformNames}(?:\\s*[|/+,&]\\s*${platformNames})*\\s*(?:[-—–:]\\s*)?`, 'i')
  return raw.replace(prefix, '').trim()
}

function standalonePlatformHeading(line, applicationPlatforms) {
  let platforms = platformsFromText(line)
  if (!platforms.length && /^desktop(?: app)?$/i.test(line)) {
    platforms = applicationPlatforms.filter((id) => DESKTOP_PLATFORMS.includes(id))
  }
  if (!platforms.length && /^mobile(?: app)?$/i.test(line)) {
    platforms = applicationPlatforms.filter((id) => MOBILE_PLATFORMS.includes(id))
  }
  if (!platforms.length || line.length > 90) return null
  const stripped = line
    .replace(/\b(?:Windows|macOS|Mac|Linux|Android|iOS|iPhone|iPad|Zoom Web App|Web App|Browser|Desktop|Mobile|App)\b/gi, '')
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

function referenceLabels(lines) {
  const referenceIndex = lines.findIndex((line) => /^(?:\d+\.\s*)?Reference\s*:?$/i.test(line))
  if (referenceIndex < 0) return new Set()
  return new Set(
    lines
      .slice(referenceIndex + 1)
      .filter((line) => line.length <= 130)
      .map((line) => line.replace(/^[-•·]\s*/, '').trim())
      .filter(Boolean),
  )
}

function referenceTokens(text) {
  const stopWords = new Set(['zoom', 'workplace', 'the', 'a', 'an', 'for', 'to', 'of', 'on', 'in', 'your', 'meeting', 'meetings', 'app'])
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((word) => word && !stopWords.has(word))
}

function resemblesReferenceLabel(line, sourceReferenceLabels) {
  const lineTokens = referenceTokens(line)
  if (lineTokens.length < 2) return false

  return [...sourceReferenceLabels].some((reference) => {
    const referenceSet = new Set(referenceTokens(reference))
    if (!referenceSet.size) return false
    const overlap = lineTokens.filter((token) => referenceSet.has(token)).length
    const smallerSize = Math.min(lineTokens.length, referenceSet.size)
    return smallerSize >= 2 && overlap === smallerSize
  })
}

function unnumberedStep(line, activeKind, sourceReferenceLabels) {
  const normalized = line.replace(/^[-•·]\s*/, '').trim()
  return activeKind === 'process'
    && !sourceReferenceLabels.has(normalized)
    && !resemblesReferenceLabel(normalized, sourceReferenceLabels)
    && !SOURCE_LINK_LABEL_PATTERN.test(normalized)
    && !/^(?:Zoom Download Center|Uninstall Zoom|CleanZoom utility)$/i.test(normalized)
    && !LETTERED_PATTERN.test(normalized)
    && normalized.length <= 110
    && /^[A-Z]/.test(normalized)
    && !/[.!?:]$/.test(normalized)
    && !/^(?:option|category|platform|control|what it does|agent reminder|question|action|primary reference|supporting (?:zoom )?resources?)$/i.test(normalized)
}

function confirmationLine(line) {
  return /\b(confirm|verify|check whether|able to|expected result|try joining|try again|return to the meeting)\b/i.test(line)
}

function stepHasContent(step) {
  return Boolean(step && (step.instructions.length || step.scripts.length || step.confirmations.length || step.visualReferences.length))
}

function createStep({ number, title, platforms, fallbackPlatforms = [], routeId, routeLabel: label, routeIntro = false }) {
  const titlePlatforms = platformsFromText(title)
  const scopedPlatforms = titlePlatforms.length
    ? titlePlatforms
    : (platforms.length ? platforms : fallbackPlatforms)
  return {
    number,
    title,
    instructions: [],
    scripts: [],
    confirmations: [],
    visualReferences: [],
    platforms: [...scopedPlatforms],
    routeId,
    routeLabel: label,
    routeIntro,
  }
}

export function buildCallGuide(process) {
  const lines = String(process?.text || '').split('\n').map((line) => line.trim()).filter(Boolean)
  const sourceReferenceLabels = referenceLabels(lines)
  const applicabilityLine = lines.find((line) => /^Applies To:/i.test(line)) || ''
  const applicationPlatforms = inferApplicationPlatforms(process, applicabilityLine)
  const defaultStepPlatforms = PROCESS_DEFAULT_STEP_PLATFORM_OVERRIDES[process?.id] || applicationPlatforms
  const steps = []
  const callouts = []
  const globalScripts = []
  const quickGuide = []
  const routeDefinitions = new Map()
  let currentStep = null
  let currentCallout = null
  let activeKind = null
  let inProcess = false
  let collectingScript = false
  let currentPlatforms = []
  let currentRouteId = null
  let currentRouteLabel = ''
  const parentPlatforms = {}
  const parentLabels = {}

  const removeEmptyRouteIntro = () => {
    if (currentStep?.routeIntro && !stepHasContent(currentStep)) {
      const index = steps.indexOf(currentStep)
      if (index >= 0) steps.splice(index, 1)
    }
  }
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
      removeEmptyRouteIntro()
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
      const letteredMatch = line.match(LETTERED_PATTERN)
      if (letteredMatch) {
        flushScript()
        removeEmptyRouteIntro()
        currentCallout = null
        const [, code, rawLabel] = letteredMatch
        const parentCode = code.charAt(0).toLowerCase()
        const routeOverride = PROCESS_ROUTE_PLATFORM_OVERRIDES[process?.id]?.[parentCode] || []
        const detectedPlatforms = platformsFromRouteLabel(rawLabel, applicationPlatforms)

        if (code.length === 1) {
          currentPlatforms = detectedPlatforms.length ? detectedPlatforms : routeOverride
          parentPlatforms[parentCode] = [...currentPlatforms]
          currentRouteId = parentCode
          currentRouteLabel = routeLabel(rawLabel) || rawLabel
          parentLabels[parentCode] = currentRouteLabel
          routeDefinitions.set(currentRouteId, {
            id: currentRouteId,
            label: currentRouteLabel,
            platforms: [...currentPlatforms],
          })
          currentStep = createStep({
            number: code,
            title: currentRouteLabel,
            platforms: currentPlatforms,
            fallbackPlatforms: defaultStepPlatforms,
            routeId: currentRouteId,
            routeLabel: currentRouteLabel,
            routeIntro: true,
          })
          steps.push(currentStep)
        } else {
          currentRouteId = parentCode
          currentPlatforms = detectedPlatforms.length
            ? detectedPlatforms
            : (parentPlatforms[parentCode] || routeOverride || [])
          currentRouteLabel = parentLabels[parentCode] || routeLabel(rawLabel) || rawLabel
          if (!routeDefinitions.has(currentRouteId)) {
            routeDefinitions.set(currentRouteId, {
              id: currentRouteId,
              label: currentRouteLabel,
              platforms: [...currentPlatforms],
            })
          }
          currentStep = createStep({
            number: code,
            title: rawLabel,
            platforms: currentPlatforms,
            fallbackPlatforms: defaultStepPlatforms,
            routeId: currentRouteId,
            routeLabel: currentRouteLabel,
          })
          steps.push(currentStep)
        }
        continue
      }

      const platformHeading = standalonePlatformHeading(line, applicationPlatforms)
      if (platformHeading) {
        flushScript()
        removeEmptyRouteIntro()
        currentStep = null
        currentPlatforms = platformHeading
        currentRouteId = `platform-${platformHeading.join('-')}`
        currentRouteLabel = platformHeading.map((id) => PLATFORM_LABELS[id]).join(' / ')
        routeDefinitions.set(currentRouteId, {
          id: currentRouteId,
          label: currentRouteLabel,
          platforms: [...currentPlatforms],
        })
        continue
      }
    }

    const stepMatch = inProcess && activeKind === 'process' ? line.match(STEP_PATTERN) : null
    if (stepMatch || unnumberedStep(line, activeKind, sourceReferenceLabels)) {
      flushScript()
      removeEmptyRouteIntro()
      currentCallout = null
      currentStep = createStep({
        number: stepMatch ? Number(stepMatch[1]) : String(steps.length + 1),
        title: stepMatch?.[2] ?? line,
        platforms: currentPlatforms,
        fallbackPlatforms: defaultStepPlatforms,
        routeId: currentRouteId,
        routeLabel: currentRouteLabel,
      })
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
  removeEmptyRouteIntro()

  const usableSteps = steps.filter(stepHasContent)
  const allScripts = [...usableSteps.flatMap((step) => step.scripts), ...globalScripts]
  const sourceLines = [...usableSteps.flatMap((step) => [...step.instructions, ...step.confirmations]), ...callouts.flatMap((callout) => callout.lines)]
  const questionLines = sourceLines.filter((line) => /^(ask|confirm|determine|clarify|identify)\b/i.test(line))
  const derivedQuestion = questionLines.length ? '' : conservativeQuestion(sourceLines)
  const visualReferences = process?.visualReferences || []
  for (const visual of visualReferences) {
    const target = usableSteps.find((step) => {
      const titleWords = step.title.toLowerCase().split(/\W+/).filter((word) => word.length > 3)
      const visualText = `${visual.title || ''} ${visual.documentStep || ''}`.toLowerCase()
      return titleWords.some((word) => visualText.includes(word))
    })
    if (target) target.visualReferences.push(visual)
  }

  const availablePlatforms = unique([
    ...applicationPlatforms,
    ...usableSteps.flatMap((step) => step.platforms),
  ])
  const platformSignatures = availablePlatforms.map((platform) =>
    usableSteps
      .map((step, index) => (!step.platforms.length || step.platforms.includes(platform)) ? index : null)
      .filter((index) => index !== null)
      .join(','),
  )
  const deviceSelectionRequired = new Set(platformSignatures).size > 1

  const routes = [...routeDefinitions.values()]
  if (!routes.length && usableSteps.length) {
    routes.push({ id: 'main', label: 'Main approved steps', platforms: [] })
  }

  return {
    steps: usableSteps.map(({ routeIntro, ...step }) => step),
    routes,
    availablePlatforms,
    deviceSelectionRequired,
    globalScripts,
    quickGuide,
    callouts,
    referralDetails: [process?.referral].filter(Boolean),
    whatToAsk: questionLines.map((text) => ({ text, origin: 'source' })).concat(derivedQuestion ? [{ text: derivedQuestion, origin: 'derived' }] : []),
    suggestedScript: allScripts.length ? { label: 'Suggested Script', origin: 'source', text: allScripts.join('\n\n') } : { label: 'Console Suggested Script', origin: 'derived', text: derivedScript(process) },
  }
}
