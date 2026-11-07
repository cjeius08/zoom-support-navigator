// Agent-facing operational guide. Keep the original Process Document unchanged.
// Sources: Flex Arbitration Hub – Agent Reference Guide and Flex SP Site Overview (Arbitrator).
// Do NOT include the internal-only Alaga escalation contact in publicly hosted code.
export const FLEX_HUB_REFERENCE = {
  id: 'flex-arbitration-hub-reference',
  title: 'Flex Arbitration Hub – Agent Reference Guide',
  updatedFrom: 'Agent Reference Guide + Flex SP Site Overview (Arbitrator)',
  hubUrl: 'https://ogletree.sharepoint.com/sites/AmazonFlexArbitration',
  arbitratorHelpEmail: 'kipsflexmassarbs@ogletreedeakins.com',
  topics: [
    {
      id: 'onboarding', label: 'Hub access & onboarding', eyebrow: 'Access', group: 'Hub access',
      keywords: 'welcome email invitation invited email SharePoint individual folder login',
      source: 'Agent Reference Guide · Flex SP Site Overview',
      summary: 'Sign in with the email address that received the Welcome Email.',
      points: [
        'The Flex Arbitration Hub is an Ogletree SharePoint site for assigned arbitration documents.',
        'Access is granted after the arbitrator’s email address is on file. The Welcome Email provides an access link.',
        'Sign in using the exact same email address that received the Welcome Email.',
        'If a Hub issue remains unresolved, check whether the arbitrator has contacted the arbitrator help contact in the welcome pack.',
      ],
    },
    {
      id: 'sign-in', label: 'SharePoint verification methods', eyebrow: 'Source check needed', group: 'Hub access',
      keywords: 'path a path b path c company verification send code outlook microsoft password authenticator',
      source: 'Referenced SharePoint Guest Sign-in Guide · not yet verified in Ozzie',
      summary: 'Only the invited-email requirement has been verified; Path A/B/C needs the guest sign-in guide.',
      points: [
        'Use the exact email address where the Welcome Email was received.',
        'Different Microsoft sign-in screens may appear. Do not assume the specific company password, email-code, or personal-account flow without checking the SharePoint Guest Sign-in Guide.',
        'The referenced guest sign-in walkthrough is not included in this approved Ozzie guide yet. Verify it before giving path-specific instructions.',
      ],
      pending: true,
    },
    {
      id: 'navigation', label: 'Locate assigned matters', eyebrow: 'Hub navigation', group: 'Case folders',
      keywords: 'active cases tranche library tranche number arbitrator claimant matter AAA claim number individual folder',
      source: 'Flex SP Site Overview · folder walkthrough',
      summary: 'Active Cases → numbered tranche → arbitrator → claimant → Arbitrator File.',
      points: [
        'The navigation panel is on the left of the SharePoint home page; current matters are under Active Cases.',
        'Tranche libraries are grouped by number. The assigned tranche number is listed in the Welcome Email.',
        'The tranche library contains a folder labeled with the arbitrator’s name.',
        'Inside, each assigned matter has a claimant folder labeled with the claimant name and AAA claim number.',
        'Only folders and documents allowed by the account’s permissions will appear.',
      ],
    },
    {
      id: 'arbitrator-file', label: 'Arbitrator File: filings & orders', eyebrow: 'Electronic court file', group: 'Case folders',
      keywords: 'arbitrator file pleading filing serve service docket ECF order decision parties AAA electronic court file',
      source: 'Flex SP Site Overview · Arbitrator File',
      summary: 'Electronic case file where pleadings, filings, orders and decisions are handled.',
      points: [
        'Each claimant folder contains an Arbitrator File, the electronic court file for that matter, similar to an ECF docket.',
        'Filings and pleadings are uploaded and served on the arbitrator, the parties, and AAA.',
        'Arbitrators may upload their orders and decisions directly; the parties are automatically notified.',
        'If an arbitrator prefers to send an order by email, the team can upload it on the arbitrator’s behalf.',
        'The Arbitrator File includes Exhibits and Transcripts subfolders.',
      ],
    },
    {
      id: 'exhibits', label: 'Exhibits subfolder', eyebrow: 'Evidence documents', group: 'Case folders',
      keywords: 'exhibits joint exhibit lists claimant 1099 driver data both sides evidence',
      source: 'Flex SP Site Overview · Exhibits',
      summary: 'Joint exhibit lists, claimant 1099/driver data, and exhibits from both sides.',
      points: [
        'Located inside the Arbitrator File for each assigned matter.',
        'Contains joint exhibit lists.',
        'Contains the claimant’s 1099 and driver data.',
        'Contains each side’s exhibits.',
      ],
    },
    {
      id: 'transcripts', label: 'Transcripts subfolder', eyebrow: 'Hearing records', group: 'Case folders',
      keywords: 'transcript transcripts deposition hearing related exhibits recording Verbit processing',
      source: 'Flex SP Site Overview · Transcripts',
      summary: 'Deposition/hearing transcripts and related exhibits; completed Verbit output.',
      points: [
        'Located inside the Arbitrator File for each assigned matter.',
        'Contains deposition transcripts, hearing transcripts, and their related exhibits.',
        'After a recorded hearing, Verbit processes the recording as an AI-powered legal transcription service.',
        'The completed transcript is uploaded to the Transcripts subfolder.',
      ],
    },
    {
      id: 'document-search', label: 'Find a document', eyebrow: 'Search procedure', group: 'Document actions',
      keywords: 'search find documents file search box claimant name claimant number matter reference',
      source: 'Flex SP Site Overview · Search for documents',
      summary: 'Search by document name, claimant name or number, or matter reference.',
      points: [],
      steps: [
        'Locate the search box at the top of the SharePoint page.',
        'Enter the document name, claimant name or number, or matter reference.',
        'Select the relevant document from the search results.',
      ],
    },
    {
      id: 'document-upload', label: 'Upload documents', eyebrow: 'Document procedure', group: 'Document actions',
      keywords: 'upload file drag drop create or upload document upload orders decisions notification',
      source: 'Flex SP Site Overview · Upload documents',
      summary: 'Use Create or Upload → Files Upload, or drag and drop into the folder.',
      points: [],
      steps: [
        'Open the correct folder for the assigned matter.',
        'Select Create or Upload, then Files Upload, and choose the file.',
        'Alternatively, drag and drop the file into the open white space inside the folder.',
      ],
    },
    {
      id: 'document-download', label: 'Download documents', eyebrow: 'Document procedure', group: 'Document actions',
      keywords: 'download documents multiple files checkbox selection radio button zip',
      source: 'Flex SP Site Overview · Download documents',
      summary: 'Select a document and download it; multiple selected files arrive as ZIP.',
      points: [
        'For multiple documents, the selected files are downloaded together as a ZIP file.',
      ],
      steps: [
        'For one document, select the control next to the file and choose Download from the menu.',
        'For several documents, select the files using their checkboxes and click Download.',
      ],
    },
    {
      id: 'document-sharing', label: 'Sharing documents', eyebrow: 'Pending verification', group: 'Document actions',
      keywords: 'share document share file sharing permissions access recipients copy link',
      source: 'Flex SP Site Overview · automatic notifications only',
      summary: 'Automatic party notifications are verified; manual Share permissions are not.',
      points: [
        'When an arbitrator uploads orders or decisions to the Arbitrator File, the parties are automatically notified.',
        'The training overview does not explain which recipients may receive manually shared links or the approved Share-button workflow.',
        'Verify the separate sharing procedure and access rules before guiding a caller to share a document.',
      ],
      pending: true,
    },
    {
      id: 'credentials', label: 'Assigned Zoom account', eyebrow: 'Welcome Email', group: 'Zoom hearings',
      keywords: 'zoom username credentials password assigned account activation',
      source: 'Agent Reference Guide · Zoom account',
      summary: 'Use Zoom credentials provided in the Welcome Email; no separate activation.',
      points: [
        'The assigned Zoom username and password are supplied in the arbitrator’s Welcome Email.',
        'There is no separate account activation or setup step required before the first login.',
        'Arbitrators cannot change their assigned Zoom username or password.',
      ],
    },
    {
      id: 'scheduling', label: 'Hearing invitations & PMI', eyebrow: 'One-link rule', group: 'Zoom hearings',
      keywords: 'PMI PML personal meeting ID meeting link schedule scheduling reschedule cancel invites Outlook Google hearing',
      source: 'Agent Reference Guide · Flex SP Site Overview',
      summary: 'The arbitrator owns invitations and reuses the same assigned PMI link.',
      points: [
        'The arbitrator is responsible for scheduling and distributing hearing links to all participants.',
        'The assigned Zoom account uses its preconfigured Personal Meeting ID (PMI) link for every hearing date and claimant.',
        'The arbitrator may distribute the SAME PMI link by email, Zoom scheduler, or external calendars such as Outlook and Google Calendar.',
        'When a hearing moves or is canceled, update the invitation sent to participants; the PMI link itself does not need to be edited or canceled in Zoom.',
        'The overview identifies the Welcome Email as the source of merits-hearing links, apart from the preliminary hearing conference managed by AAA.',
      ],
    },
    {
      id: 'rules', label: 'Meeting rules & recording', eyebrow: 'Strict recording rule', group: 'Zoom hearings',
      keywords: 'recording cannot turn off stop recording automatic waiting room breakout naming title',
      source: 'Agent Reference Guide · Meeting parameters',
      summary: 'Never turn off recording; waiting rooms and breakout rooms are configurable.',
      points: [
        'No mandatory meeting title or case-number naming format is specified in the guide.',
        'Arbitrators may toggle in-meeting features such as Waiting Rooms and Breakout Rooms.',
        'Recording must remain active. Arbitrators must NOT stop or turn off recordings.',
      ],
    },
  ],
  internalBoundary: 'If the matter needs Alaga-level internal escalation, follow the approved private team escalation route. Do not share the internal escalation contact with the caller.',
  relatedSourceTitles: [
    'Email Upcoming Amazon Flex Hearing – Please Verify Your Arbitration Hub and Zoom Access',
    'Email Reminder – Amazon Flex Arbitration Hub Goes Live September 28',
    'Welcome Email Template Flex Mass Arbs',
    'New Document Notification Template Flex Mass Arbs',
    'Amazon Flex Arbitration Hub FAQ (Arbitrators)',
    'SharePoint Guest Sign-in Guide',
    'Zoom Meeting Login Walkthrough',
  ],
}

// Quick-reference facts, not quiz scenarios; every answer maps to a cited guide topic.
export const FLEX_HUB_FAQS = [
  { id: 'where-cases', label: 'Where are assigned matters?', answer: 'Open Active Cases, then the tranche library from the Welcome Email, the arbitrator-named folder, and the claimant folder identified by name and AAA claim number.', sourceTopic: 'navigation' },
  { id: 'exhibits-contents', label: 'What is in Exhibits?', answer: 'Joint exhibit lists, the claimant’s 1099 and driver data, and each side’s exhibits.', sourceTopic: 'exhibits' },
  { id: 'transcripts-contents', label: 'What is in Transcripts?', answer: 'Deposition and hearing transcripts and related exhibits. Completed recordings processed by Verbit are placed here.', sourceTopic: 'transcripts' },
  { id: 'arbitrator-file-use', label: 'What is the Arbitrator File?', answer: 'The electronic court file for an assigned matter; filings and pleadings are uploaded and served there. Arbitrators may upload orders and decisions, which automatically notify the parties.', sourceTopic: 'arbitrator-file' },
  { id: 'find-documents', label: 'How are documents found?', answer: 'Use the SharePoint search box at the top of the page; enter a document name, claimant name or number, or matter reference, then select the result.', sourceTopic: 'document-search' },
  { id: 'multiple-downloads', label: 'How are multiple documents downloaded?', answer: 'Select the desired files using their checkboxes and choose Download. The selection is downloaded as a ZIP file.', sourceTopic: 'document-download' },
  { id: 'same-pmi', label: 'Does the hearing link change when rescheduled?', answer: 'No. The same assigned PMI is reused. The arbitrator updates the invitation sent to participants instead.', sourceTopic: 'scheduling' },
  { id: 'recording-rule', label: 'Can the recording be turned off?', answer: 'No. The Agent Reference Guide requires recording to stay active throughout the hearing.', sourceTopic: 'rules' },
  { id: 'manual-sharing', label: 'How is a document manually shared?', answer: 'The training material confirms automatic party notification for uploaded orders/decisions, but does not establish approved manual Share-button steps or recipient permissions.', sourceTopic: 'document-sharing', pending: true },
  { id: 'guest-verification', label: 'Which SharePoint sign-in path is required?', answer: 'Sign in with the exact invited email address. The company-password, email-code, and personal Microsoft-account paths still require verification against the SharePoint Guest Sign-in Guide.', sourceTopic: 'sign-in', pending: true },
]

export const FLEX_HUB_ROADBLOCKS = [
  { id: 'hub-access', issue: 'Cannot access assigned Hub folder', check: 'Confirm the same email address used for the Welcome Email and the individual folder link.', next: 'If access still cannot be established, verify the arbitrator has used the help contact listed in the Welcome Email.', sourceTopic: 'onboarding' },
  { id: 'matter-missing', issue: 'Assigned matter does not appear', check: 'Confirm the assigned tranche library, arbitrator folder, claimant folder and visible account permissions.', next: 'Do not assume missing folders are public; use the approved arbitrator help contact if the expected matter is unavailable.', sourceTopic: 'navigation' },
  { id: 'manual-sharing-unknown', issue: 'Document recipient or Share permission is unclear', check: 'Only the automatic notifications for orders/decisions are verified by the video.', next: 'Do not instruct an unverified manual sharing or permissions change. Obtain the approved SharePoint sharing procedure first.', sourceTopic: 'document-sharing', pending: true },
  { id: 'verification-path-unknown', issue: 'Company verification or email-code path is unclear', check: 'Confirm the email address that received the Welcome Email.', next: 'Use the SharePoint Guest Sign-in Guide for the correct path; its detailed steps are not yet verified in this reference.', sourceTopic: 'sign-in', pending: true },
  { id: 'recording-change', issue: 'Request to stop or disable hearing recording', check: 'The Agent Reference Guide states that hearing recording must stay active.', next: 'Do not stop or turn off the recording.', sourceTopic: 'rules' },
  { id: 'rescheduling', issue: 'Request to change the PMI when a hearing moves', check: 'The same assigned PMI is used across hearing dates and claimants.', next: 'Update the invitation distributed to participants; there is no need to edit or cancel the PMI in Zoom.', sourceTopic: 'scheduling' },
]

export const FLEX_HUB_VIDEOS = [
  { id: 'flex-hub-site-overview', title: 'Flex SP Site Overview (Arbitrator)', provider: 'Synthesia',
    externalUrl: 'https://share.synthesia.io/1244ebcd-573b-4095-886c-7727c3bcdff6',
    usefulFor: 'Arbitrator orientation, folder structure and document actions',
    relatedCategories: ['Flex Arbitration Hub'], sortOrder: 32 },
  { id: 'flex-hub-overview-session', title: 'Flex Mass Arbitration SharePoint Hub Overview Session (15:40)', provider: 'Vimeo',
    externalUrl: 'https://vimeo.com/1229686236/22d91e6a9f?share=copy&fl=sv&fe=ci',
    usefulFor: 'Detailed SharePoint Hub overview session for agent reference',
    relatedCategories: ['Flex Arbitration Hub'], sortOrder: 33 },
]

// Specific queries map to an exact section instead of dumping agents at the top of the guide.
// Generic Zoom microphone, audio, screen-sharing and download queries remain in their own routes.
const HUB_SEARCH_ROUTES = [
  { id: 'exhibits', test: /\b(?:exhibits?|1099|driver data|joint exhibit)\b/ },
  { id: 'transcripts', test: /\b(?:transcripts?|deposition|verbit)\b/ },
  { id: 'arbitrator-file', test: /\b(?:arbitrator file|pleadings?|filings?|electronic court file|ecf docket)\b/ },
  { id: 'navigation', test: /\b(?:active cases|tranche|assigned matter|aaa claim number|claimant folder)\b/ },
  { id: 'document-search', test: /\b(?:search|find|locate)\b.*\b(?:documents?|files?|claimant|matter|sharepoint|flex hub)\b|\b(?:documents?|files?)\b.*\bsearch\b/ },
  { id: 'document-upload', test: /\bupload\b.*\b(?:documents?|files?|orders?|decisions?|sharepoint|flex hub)\b|\b(?:documents?|files?)\b.*\bupload\b/ },
  { id: 'document-download', test: /\bdownload\b.*\b(?:documents?|files?|zip|sharepoint|flex hub)\b|\b(?:documents?|files?)\b.*\bdownload\b/ },
  { id: 'document-sharing', test: /\bshar(?:e|ing)\b.*\b(?:documents?|files?|sharepoint|hub)\b|\b(?:documents?|files?)\b.*\bshar(?:e|ing)\b/ },
  { id: 'sign-in', test: /\b(?:path a|path b|path c|send code|verification code|microsoft authenticator)\b.*\b(?:sharepoint|hub|arbitrator|email|sign in)\b|\b(?:sharepoint|hub)\b.*\b(?:path a|path b|path c|verification code)\b/ },
  { id: 'credentials', test: /\b(?:zoom credentials|assigned zoom password|zoom username)\b/ },
  { id: 'scheduling', test: /\b(?:pmi|pml|personal meeting id|personal meeting link|hearing scheduling|reschedule hearing|schedule hearing)\b/ },
  { id: 'rules', test: /\b(?:stop recording|turn off recording|disable recording|recording rule)\b/ },
  { id: 'onboarding', test: /\b(?:sharepoint|flex hub|arbitration hub|welcome email|sharepoint guest login)\b/ },
]
function normalizedHubQuery(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}
export function findFlexHubTopic(query) {
  const normalized = normalizedHubQuery(query)
  if (normalized.length < 3) return null
  const route = HUB_SEARCH_ROUTES.find(item => item.test.test(normalized))
  return route ? FLEX_HUB_REFERENCE.topics.find(topic => topic.id === route.id) || null : null
}
export function matchesFlexHubReference(query) {
  return Boolean(findFlexHubTopic(query))
}
export const FLEX_HUB_SEARCH_ENTRY = {
  id: FLEX_HUB_REFERENCE.id, title: FLEX_HUB_REFERENCE.title,
  purpose: 'Hub access, assigned matter folders, document actions, PMI invitations and recording rules.',
}
export function flexHubSearchEntry(query) {
  const topic = findFlexHubTopic(query)
  return topic
    ? { id: topic.id, title: topic.label, purpose: topic.summary }
    : FLEX_HUB_SEARCH_ENTRY
}
