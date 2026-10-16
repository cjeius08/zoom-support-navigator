import { PROCESSES } from '../../data/processes'
import { FAQ_ITEMS } from '../../data/supportReference'
import { HOST_ROADBLOCKS } from '../../data/arbitratorHostSupport'
import { hostFaqItems, hostProcesses, hostFastestTopics, searchHostTopics, searchHostRoadblocks } from '../../data/hostExperience'
import { searchProcesses, normalizeSearchText } from '../navigator/smartSearch'
import { searchCommonIssueRoutes } from '../navigator/commonIssueRoutes'

const PAGES = [
  { id: 'navigator', title: 'Dashboard & Smart Search', description: 'Search approved Zoom support and start a call', keywords: 'home smart search find help' },
  { id: 'favorites', title: 'Favorites', description: 'Your saved support references', keywords: 'saved guides bookmark star' },
  { id: 'my_saved_notes', title: 'My Saved Notes', description: 'Your saved notes and follow-ups', keywords: 'call notes follow up documentation' },
  { id: 'training', title: 'Training & Resources', description: 'Guides, lessons and practice environments', keywords: 'Zoom sandbox device scripts training' },
  { id: 'process_documents', title: 'Process Documents', description: 'Official process source pages', keywords: 'source library process' },
  { id: 'flex_hub', title: 'Flex Arbitration Hub', description: 'Onboarding, scheduling and program references', keywords: 'PMI meeting rules credentials' },
  { id: 'updates', title: 'What’s New / Updates', description: 'Recent Ozzie improvements', keywords: 'changes announcements release' },
  { id: 'feedback', title: 'Submit Feedback', description: 'Report a problem or suggest an improvement', keywords: 'bug issue report' },
  { id: 'admin', title: 'Admin Home', description: 'Workspace administration', adminOnly: true, keywords: 'manage admin' },
  { id: 'team', title: 'Team Management', description: 'User roles and account management', adminOnly: true, keywords: 'users leads agents access' },
  { id: 'saved_notes', title: 'All Saved Notes', description: 'Admin-only team notes and follow-ups', adminOnly: true, keywords: 'team call notes' },
  { id: 'usage', title: 'Usage Analytics', description: 'Admin-only usage reporting', adminOnly: true, keywords: 'report traffic activity' },
  { id: 'feedback_queue', title: 'Feedback Queue', description: 'Review feedback reports', adminOnly: true, keywords: 'manage feedback' },
  { id: 'avatar_library', title: 'Avatar Library', description: 'Manage approved profile avatars', adminOnly: true, keywords: 'images admin' },
]

function matchesText(query, text) {
  const words = normalizeSearchText(query).split(' ').filter(Boolean)
  const haystack = normalizeSearchText(text)
  return words.length > 0 && words.every(word => haystack.includes(word))
}

function pageResult(page) {
  return { kind: 'page', id: page.id, title: page.title, description: page.description, category: 'Workspace', role: null }
}

function faqMatches(query, role) {
  const items = role === 'Host' ? hostFaqItems(FAQ_ITEMS) : FAQ_ITEMS
  return items
    .filter(item => matchesText(query, [item.label, item.answer, ...(item.points || [])].join(' ')))
    .sort((left,right) => Number(matchesText(query, right.label)) - Number(matchesText(query, left.label)))
    .slice(0, 3)
    .map(item => ({ kind: 'faq', id: item.label, title: item.label, description: item.answer, category: 'Approved FAQ', role }))
}

export function commandQuickLinks(isAdmin = false, role = 'Host') {
  const pages = ['navigator','favorites','my_saved_notes','training','feedback']
  const commands = PAGES.filter(p => pages.includes(p.id) || (isAdmin && p.id === 'team')).map(pageResult)
  if (role === 'Host') {
    const topic = hostFastestTopics()[0]
    if (topic) commands.splice(1, 0, { kind: 'host', id: topic.id, title: topic.title, description: 'Approved Host / Arbitrator route', category: 'Host guided support', role })
  }
  return commands.slice(0, 7)
}

export function commandResults(query, { role = 'Host', isAdmin = false } = {}) {
  const clean = String(query || '').trim()
  if (!clean) return commandQuickLinks(isAdmin, role)
  const allowedPages = PAGES.filter(page => !page.adminOnly || isAdmin)
  const pages = allowedPages
    .filter(page => matchesText(clean, [page.title,page.description,page.keywords].join(' ')))
    .slice(0, 3).map(pageResult)

  const hostMode = role === 'Host'
  const hostRoutes = hostMode ? searchHostTopics(clean).slice(0, 4).map(topic => ({
    kind: 'host', id: topic.id, title: topic.title,
    description: topic.group + ' · Approved Host / Arbitrator guided support',
    category: 'Host guide', role: 'Host',
  })) : []
  const roadblocks = hostMode ? searchHostRoadblocks(clean).slice(0, 2).map(item => ({
    kind: 'roadblock', id: item.id, title: item.title,
    description: item.trigger, category: 'Host Tier 1 boundary', role: 'Host',
  })) : []
  const participantRoutes = !hostMode ? searchCommonIssueRoutes(clean).slice(0, 4).map(item => ({
    kind: 'issue', id: item.id, title: item.title,
    description: item.subtitle, category: 'Participant common issue', role: 'Participant',
  })) : []
  const processes = searchProcesses(hostMode ? hostProcesses(PROCESSES) : PROCESSES, clean).slice(0, 3).map(item => ({
    kind: 'process', id: item.id, title: item.title.trim(),
    description: item.purpose, category: 'Approved Process Guide', role,
  }))
  // Approved Host routes and Tier-1 stop boundaries take priority over generic
  // process wording. Never mix Participant-only routes into Host results.
  return [...pages,...hostRoutes,...roadblocks,...participantRoutes,...processes,...faqMatches(clean, role)].slice(0, 10)
}

export function findCommandPage(id, isAdmin = false) {
  const page = PAGES.find(item => item.id === id && (!item.adminOnly || isAdmin))
  return page ? pageResult(page) : null
}
