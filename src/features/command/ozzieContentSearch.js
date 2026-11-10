// Search only curated, already-visible Ozzie reference content. Never index
// private notes, passwords, profiles, or Supabase rows in the client bundle.
import { ALL_TRAINING_VIDEOS } from '../../data/trainingVideos'
import { SUPPLEMENTAL_PROCESS_DOCUMENTS } from '../../data/processDocumentExtras'
import { FLEX_HUB_FAQS, FLEX_HUB_ROADBLOCKS } from '../../data/flexHubReference'
import { updatesForAudience } from '../updates/updatesData'
import { GUIDED_LESSONS } from '../training/guidedLessonsData'
import { DEVICE_WALKTHROUGHS } from '../training/deviceWalkthroughs'
import { TRAINING_ROADMAP_MODULES } from '../training/trainingRoadmapData'
import { COMMUNICATION_SECTIONS } from '../training/communicationScripts'
import { SCENARIO_SCRIPTS } from '../training/scenarioScripts'
import { normalizeSearchText } from '../navigator/smartSearch'

const STOP = new Set(['the','for','and','with','how','do','does','can','where','what','is','are','an','a','in','to','on','my','our','their','i','you','your','of'])
function terms(value) {
  const all = normalizeSearchText(value).split(' ').filter(Boolean)
  const relevant = all.filter(word => !STOP.has(word))
  return relevant.length ? relevant : all
}
function scoreFor(query, item) {
  const words = terms(query)
  if (!words.length) return 0
  const title = normalizeSearchText(item.title)
  const keywords = normalizeSearchText(item.keywords || '')
  const body = normalizeSearchText(item.description || '')
  const haystack = [title,keywords,body].join(' ')
  // All meaningful words must match. Keep unrelated Zoom troubleshooting out.
  if (!words.every(word => haystack.split(' ').some(token => token === word || (word.length >= 4 && token.startsWith(word))))) return 0
  const q = normalizeSearchText(query)
  const titleHit = title === q ? 80 : title.includes(q) ? 50 : words.every(word => title.split(' ').some(token => token === word || (word.length >= 4 && token.startsWith(word)))) ? 30 : 0
  return titleHit + (keywords.includes(q) ? 15 : 0) + 5
}
function training(section,id,title,description,extra={}) {
  return {kind:'training_section',id,title,description,category:'Training & Resources',section,...extra}
}
function searchableEntries(isAdmin) {
  return [
    ...ALL_TRAINING_VIDEOS.map(video => ({
      kind:'video',id:video.id,title:video.title,
      description:video.usefulFor,category:'Training video',
      keywords:video.relatedCategories.join(' '),
    })),
    ...GUIDED_LESSONS.map(lesson => training('lessons',lesson.id,lesson.title,lesson.summary,{
      lessonId:lesson.id,keywords:[lesson.remember,lesson.sourceLabel].join(' '),
    })),
    ...DEVICE_WALKTHROUGHS.map(device => training('devices',device.id,device.title,device.summary,{
      device:device.id,keywords:device.label+' '+device.subtitle,
    })),
    ...TRAINING_ROADMAP_MODULES.filter(module => module.status === 'available').map(module =>
      training(module.target?.section || 'roadmap','roadmap-'+module.id,module.title,module.objective,{
        ...module.target,keywords:module.skills.join(' '),
      })),
    ...COMMUNICATION_SECTIONS.map(section =>
      training('scripts','script-'+section.id,section.title,section.purpose,{
        mode:'language',subsection:section.id,
        keywords:section.phrases?.map(phrase => phrase.label).join(' ') || '',
      })),
    ...SCENARIO_SCRIPTS.map(script => training('scripts','scenario-'+script.id,
      script.label+' — call scenario','Approved scenario script and guided caller discovery',{
        mode:'scenarios',scenario:script.id,keywords:script.opening,
      })),
    ...SUPPLEMENTAL_PROCESS_DOCUMENTS.map(doc => ({
      kind:'source_document',id:doc.id,title:doc.title,description:doc.purpose,
      category:'Process Documents',keywords:doc.category,
    })),
    ...FLEX_HUB_FAQS.map(item => ({
      kind:'hub_reference',id:item.id,title:item.label,description:item.answer,
      category:item.pending?'Flex Hub FAQ · Source verification needed':'Flex Hub FAQ',
      topicId:item.sourceTopic,keywords:'flex arbitration hub faq',
    })),
    ...FLEX_HUB_ROADBLOCKS.map(item => ({
      kind:'hub_reference',id:'roadblock-'+item.id,title:item.issue,
      description:item.check+' '+item.next,
      category:item.pending?'Flex Hub Roadblock · Source verification needed':'Flex Hub Roadblock',
      topicId:item.sourceTopic,keywords:'flex arbitration hub roadblock',
    })),
    ...updatesForAudience(isAdmin).map(entry => ({
      kind:'update',id:entry.id,title:entry.title,description:entry.area,
      category:'What’s New',keywords:entry.changed,
    })),
  ]
}

export function searchOzzieContent(query,{isAdmin=false,role='Host',limit=6}={}) {
  if (!String(query||'').trim() || terms(query).every(word => word.length < 2)) return []
  return searchableEntries(isAdmin)
    .filter(item => role === 'Host' || item.kind !== 'hub_reference')
    .map(item => ({item,score:scoreFor(query,item)}))
    .filter(candidate => candidate.score > 0)
    .sort((a,b)=>b.score-a.score || a.item.title.localeCompare(b.item.title))
    .slice(0,limit)
    .map(({item})=>item)
}
