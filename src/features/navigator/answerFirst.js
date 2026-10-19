import { normalizeSearchText } from './smartSearch'
import { routeById } from './commonIssueRoutes'
import { FAQ_ITEMS } from '../../data/supportReference'
import { hostFaqItems, hostTopics } from '../../data/hostExperience'

// Curated intents only. Each answer is read directly from an existing approved
// route or program FAQ, never synthesized from arbitrary search text.
// Order matters: specific symptoms precede broad ones.
const INTENTS = [
  {
    id: 'host-recording-policy',
    role: 'Host',
    source: ['faq', 'Recording'],
    matches: text => /\b(record|recording)\b/.test(text)
      && /\b(automatic|automatically|auto|turn off|disable|turned off|cannot turn off|cant turn off)\b/.test(text)
      && !/\b(pause|resume|break|stop and restart)\b/.test(text),
  },
  {
    id: 'host-controls-missing',
    role: 'Host',
    source: ['faq', 'Host Controls'],
    guide: ['host', 'host-controls-missing'],
    matches: text => /\b(host controls?|host tools?|co host controls?)\b/.test(text)
      && /\b(missing|not|no|cant|cannot|dont|doesnt|wont|unable|where|find|lost|disappeared)\b/.test(text),
  },
  {
    id: 'host-wrong-camera',
    role: 'Host',
    source: ['host', 'host-camera', 0],
    matches: text => /\b(camera|video|preview)\b/.test(text)
      && /\b(wrong|incorrect|different|another|expected|select|switch|change)\b/.test(text),
  },
  {
    id: 'participant-wrong-camera',
    role: 'Participant',
    source: ['route', 'camera-not-working', 1],
    matches: text => /\b(camera|video|preview)\b/.test(text)
      && /\b(wrong|incorrect|different|another|expected|select|switch|change)\b/.test(text),
  },
  {
    id: 'host-unmuted-mic',
    role: 'Host',
    source: ['host', 'host-audio', 1],
    matches: text => /\b(mic|microphone|hear|heard|voice|audio|sound)\b/.test(text)
      && /\b(unmuted|not muted|already unmuted|mic is on|microphone is on)\b/.test(text)
      && /\b(cant hear|cannot hear|not hear|no one can hear|nobody can hear|couldnt hear|unable to hear|not being heard)\b/.test(text),
  },
  {
    id: 'participant-unmuted-mic',
    role: 'Participant',
    source: ['route', 'cant-be-heard', 2],
    matches: text => /\b(mic|microphone|hear|heard|voice|audio|sound)\b/.test(text)
      && /\b(unmuted|not muted|already unmuted|mic is on|microphone is on)\b/.test(text)
      && /\b(cant hear|cannot hear|not hear|no one can hear|nobody can hear|couldnt hear|unable to hear|not being heard)\b/.test(text),
  },
  {
    id: 'host-mic-first-check',
    role: 'Host',
    source: ['host', 'host-audio', 0],
    matches: text => /\b(cant hear me|cannot hear me|cant hear (the )?arbitrator|cannot hear (the )?arbitrator|cant hear (the )?host|nobody can hear|no one can hear|mic not working|microphone not working)\b/.test(text),
  },
  {
    id: 'participant-mic-first-check',
    role: 'Participant',
    source: ['route', 'cant-be-heard', 0],
    matches: text => /\b(cant hear me|cannot hear me|cant hear (the )?participant|cannot hear (the )?participant|nobody can hear|no one can hear|mic not working|microphone not working)\b/.test(text),
  },
  {
    id: 'host-camera-first-check',
    role: 'Host',
    source: ['host', 'host-camera', 0],
    matches: text => /\b(camera|video)\b/.test(text)
      && /\b(not working|not showing|black|not detected|wont start|cannot start|cant start|off)\b/.test(text),
  },
  {
    id: 'participant-camera-first-check',
    role: 'Participant',
    source: ['route', 'camera-not-working', 0],
    matches: text => /\b(camera|video)\b/.test(text)
      && /\b(not working|not showing|black|not detected|wont start|cannot start|cant start|off)\b/.test(text),
  },
  {
    id: 'participant-speaker-check',
    role: 'Participant',
    source: ['route', 'cant-hear', 0],
    matches: text => /\b(cant hear anyone|cannot hear anyone|cant hear anybody|cannot hear anybody|cant hear them|cannot hear them|no sound|speaker not working)\b/.test(text)
      && !/\b(cant hear me|cannot hear me|hear the arbitrator)\b/.test(text),
  },
  {
    id: 'participant-join-diagnostic',
    role: 'Participant',
    source: ['route', 'cant-join', 'confirm', 0],
    matches: text => /\b(cant join|cannot join|cant get into|cannot get into|unable to join|meeting link not working|invalid meeting id)\b/.test(text)
      && !/\b(waiting room|waiting for host)\b/.test(text),
  },
]

function fromApprovedSource(intent, role) {
  const [type, id, index, fallbackIndex] = intent.source
  if (type === 'faq') {
    const faq = (role === 'Host' ? hostFaqItems(FAQ_ITEMS) : FAQ_ITEMS)
      .find(item => item.label === id)
    if (!faq?.answer) return null
    return {
      id: intent.id,
      heading: faq.label,
      answer: faq.answer,
      sourceLabel: `Ogletree approved FAQ · ${faq.label}`,
      guide: intent.guide ? { kind: intent.guide[0], id: intent.guide[1] } : { kind: 'faq', id: faq.label },
      sourceUrl: null,
    }
  }

  if (type === 'host') {
    const topic = hostTopics().find(item => item.id === id)
    const step = topic?.steps?.[index]
    if (!step?.instruction) return null
    return {
      id: intent.id,
      heading: topic.title,
      answer: step.instruction,
      confirmation: step.confirm,
      sourceLabel: `Approved Host / Arbitrator route · ${topic.title}`,
      sourceUrl: topic.zoomSources?.[0]?.url || null,
      guide: { kind: 'host', id: topic.id },
    }
  }

  if (type === 'route' && role === 'Participant') {
    const route = routeById(id)
    const text = index === 'confirm' ? route?.confirm?.[fallbackIndex] : route?.checks?.[index]?.instruction
    if (!text) return null
    return {
      id: intent.id,
      heading: route.title,
      answer: text,
      confirmation: index === 'confirm' ? null : route.checks[index]?.expected,
      sourceLabel: `Approved Common Issue · ${route.title}`,
      sourceUrl: route.primarySource?.url || null,
      guide: { kind: 'route', id: route.id },
    }
  }

  return null
}

// Null means "not verified here". Never manufacture a confident answer.
export function approvedQuickAnswer(query, { role = 'Host' } = {}) {
  const normalized = normalizeSearchText(query)
  if (normalized.length < 5) return null
  const allowedRole = role === 'Participant' ? 'Participant' : 'Host'
  for (const intent of INTENTS) {
    if (intent.role !== allowedRole || !intent.matches(normalized)) continue
    return fromApprovedSource(intent, allowedRole)
  }
  return null
}
