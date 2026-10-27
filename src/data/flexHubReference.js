// Approved agent-facing reference based on the Flex Arbitration Hub – Agent Reference Guide.
// Do NOT put the separately marked internal-only escalation email in public frontend code.
export const FLEX_HUB_REFERENCE = {
  id: 'flex-arbitration-hub-reference',
  title: 'Flex Arbitration Hub – Agent Reference Guide',
  updatedFrom: 'Flex Arbitration Hub – Agent Reference Guide',
  hubUrl: 'https://ogletree.sharepoint.com/sites/AmazonFlexArbitration',
  arbitratorHelpEmail: 'kipsflexmassarbs@ogletreedeakins.com',
  topics: [
    { id: 'onboarding', label: 'Hub access & onboarding', eyebrow: 'SharePoint access',
      points: [
        'The Flex Arbitration Hub is a SharePoint site. The Welcome Email links to each arbitrator’s individual folder.',
        'Sign in with the exact email address that received the Welcome Email.',
        'For Hub access questions, first ask whether the arbitrator has contacted the arbitrator help address listed in their welcome pack.'
      ] },
    { id: 'credentials', label: 'Zoom account & credentials', eyebrow: 'Welcome Email',
      points: [
        'The assigned Zoom username and password are supplied in the arbitrator’s Welcome Email.',
        'There is no separate account activation or setup step required before the first sign-in.',
        'Arbitrators cannot change their assigned Zoom username or password.'
      ] },
    { id: 'scheduling', label: 'Hearing scheduling & PMI', eyebrow: 'One-link rule',
      points: [
        'The arbitrator is responsible for creating and distributing meeting invitations to all participants.',
        'The assigned Zoom account uses its preconfigured Personal Meeting ID (PMI) link for all meetings and hearing dates, including different claimants.',
        'The arbitrator may share that SAME PMI link by direct email, Zoom scheduler, or an external calendar invitation such as Outlook or Google Calendar.',
        'When a hearing is rescheduled or canceled, update the invitation sent to participants. The PMI link itself does not need to be edited or canceled in Zoom.'
      ] },
    { id: 'rules', label: 'Meeting rules & recording', eyebrow: 'Strict recording rule',
      points: [
        'No mandatory meeting title or case-number naming format is required by this guide.',
        'Arbitrators may toggle in-meeting options such as Waiting Rooms and Breakout Rooms when the relevant controls are available.',
        'Recording must remain active. Arbitrators must NOT stop or turn off recordings.'
      ] }
  ],
  internalBoundary: 'If the matter needs Alaga-level internal escalation, follow the approved private team escalation route. Do not share the internal escalation contact with the caller.',
  relatedSourceTitles: [
    'Email Upcoming Amazon Flex Hearing – Please Verify Your Arbitration Hub and Zoom Access',
    'Email Reminder – Amazon Flex Arbitration Hub Goes Live September 28',
    'Welcome Email Template Flex Mass Arbs',
    'New Document Notification Template Flex Mass Arbs',
    'Amazon Flex Arbitration Hub FAQ (Arbitrators)',
    'SharePoint Guest Sign-in Guide',
    'Zoom Meeting Login Walkthrough'
  ]
}

export const FLEX_HUB_VIDEOS = [
  { id: 'flex-hub-site-overview', title: 'Flex SP Site Overview (Arbitrator)', provider: 'Synthesia',
    externalUrl: 'https://share.synthesia.io/1244ebcd-573b-4095-886c-7727c3bcdff6',
    usefulFor: 'Arbitrator orientation to the Flex SharePoint Hub and its access workflow',
    relatedCategories: ['Flex Arbitration Hub'], sortOrder: 32 },
  { id: 'flex-hub-overview-session', title: 'Flex Mass Arbitration SharePoint Hub Overview Session (15:40)', provider: 'Vimeo',
    externalUrl: 'https://vimeo.com/1229686236/22d91e6a9f?share=copy&fl=sv&fe=ci',
    usefulFor: 'Detailed SharePoint Hub overview session for agent reference',
    relatedCategories: ['Flex Arbitration Hub'], sortOrder: 33 }
]

const HUB_QUERIES = [
  /\breschedul(?:e|ed|ing)\s+(?:a\s+)?hearing\b/,
  /\bflex(?:\s+arbitration)?\s+hub\b/,
  /\barbitration\s+hub\b/,
  /\bsharepoint(?:\s+(?:hub|arbitration|guest|login))?\b/,
  /\bpersonal\s+meeting\s+id\b/,
  /\bpmi\b/,
  /\bwelcome\s+email\b/,
  /\bhearing\s+(?:scheduling|schedule|invite|reschedul|cancel|link)/,
  /\b(?:zoom|meeting)\s+recording\s+(?:rule|policy|stop|disable)/,
  /\b(?:one|same|permanent)\s+(?:meeting\s+)?(?:link|pmi)\b/
]
export function matchesFlexHubReference(query) {
  const normalized = String(query || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  return normalized.length > 2 && HUB_QUERIES.some(pattern => pattern.test(normalized))
}
export const FLEX_HUB_SEARCH_ENTRY = { id: FLEX_HUB_REFERENCE.id, title: FLEX_HUB_REFERENCE.title,
  purpose: 'Hub sign-in, welcome email, permanent PMI hearing link, invitations, recording rules, and where to find training videos.' }
