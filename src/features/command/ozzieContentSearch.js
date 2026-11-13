// Search only curated, already-visible Ozzie reference content. Never index
// private notes, passwords, profiles, or Supabase rows in the client bundle.
import { ALL_TRAINING_VIDEOS } from '../../data/trainingVideos'
import { SUPPLEMENTAL_PROCESS_DOCUMENTS } from '../../data/processDocumentExtras'
import { FLEX_HUB_REFERENCE, FLEX_HUB_FAQS, FLEX_HUB_ROADBLOCKS } from '../../data/flexHubReference'
import { updatesForAudience } from '../updates/updatesData'
import { GUIDED_LESSONS } from '../training/guidedLessonsData'
import { DEVICE_WALKTHROUGHS } from '../training/deviceWalkthroughs'
import { TRAINING_ROADMAP_MODULES } from '../training/trainingRoadmapData'
import { COMMUNICATION_SECTIONS } from '../training/communicationScripts'
import { SCENARIO_SCRIPTS } from '../training/scenarioScripts'
import { normalizeSearchText } from '../navigator/smartSearch'
import { isUnverifiedParticipantSearch, normalizeSupportQuery } from './supportSearchLanguage'

const STOP = new Set([
  'the','for','and','with','how','do','does','can','where','what','is','are','an','a','in','to','on',
  'my','our','their','i','you','your','of','they','please','tell','show','find','need','want',
  'pano','paano','panu','po','ba','yung','ang','ng','sa','naman','ako','ko',
])
const ALIASES = {
  mic:['microphone'],mike:['microphone'],cam:['camera'],vidyo:['video'],bidyo:['video'],
  transkript:['transcript'],transcription:['transcript'],captions:['transcript','caption'],
  download:['downloaded','downloading','downloads','export','save'],
  resched:['reschedule','rescheduling'],rescheduling:['reschedule'],
  recording:['record','recorded'],record:['recording'],shared:['share','sharing'],sharing:['share'],
  join:['joining'],joining:['join'],cant:['cannot','unable'],cannot:['cant','unable'],
  meeting:['zoom'],hearing:['arbitration'],login:['sign','signin'],logon:['login','sign'],
  faq:['questions'],steps:['procedure','guide'],guide:['steps','procedure'],
}
const TOPIC_ANCHORS = new Set([
  'record','recording','reschedule','rescheduling','transcript','transkript','share','sharing',
  'microphone','speaker','camera','host','participant','break','breaks',
])
const CORPUS_CACHE = new Map()
const tokenize = value => new Set(normalizeSearchText(value).split(' ').filter(Boolean))
function terms(query) {
  const all = normalizeSearchText(query).split(' ').filter(Boolean)
  const filtered = all.filter(word => !STOP.has(word))
  return [...new Set(filtered.length ? filtered : all)]
}
function distanceWithin(a,b,limit) {
  if (Math.abs(a.length-b.length)>limit) return false
  const row = Array.from({length:b.length+1},(_,i)=>i)
  for(let i=1;i<=a.length;i++) {
    let prev=row[0]; row[0]=i
    let lowest=row[0]
    for(let j=1;j<=b.length;j++) {
      const old=row[j]
      row[j]=Math.min(row[j]+1,row[j-1]+1,prev+(a[i-1]===b[j-1]?0:1))
      prev=old;lowest=Math.min(lowest,row[j])
    }
    if(lowest>limit)return false
  }
  return row[b.length]<=limit
}
function matchStrength(word,tokens) {
  if(tokens.has(word))return 1
  const related=ALIASES[word] || []
  if(related.some(alias=>tokens.has(alias)))return 0.92
  for(const token of tokens) {
    // Audio "hear" and proceeding "hearing" have distinct meanings.
    if ((word==='hear'&&token==='hearing')||(word==='hearing'&&token==='hear'))continue
    if(word.length>=4 && token.startsWith(word))return 0.87
    if(token.length>=4 && word.startsWith(token) && word.length-token.length<=2)return 0.83
    if(related.some(alias=>alias.length>=4 && token.startsWith(alias)))return 0.82
  }
  for(const token of tokens) {
    const limit=Math.max(word.length,token.length)>=9?2:1
    if(word.length<5||token.length<5||Math.abs(word.length-token.length)>limit)continue
    if(distanceWithin(word,token,limit))return limit===1?0.73:0.61
  }
  return 0
}
function indexedEntries(isAdmin) {
  const key=Boolean(isAdmin)
  if(!CORPUS_CACHE.has(key))CORPUS_CACHE.set(key,searchableEntries(key).map(item=>({
    item,
    title:normalizeSearchText(item.title),
    keywords:normalizeSearchText(item.keywords || ''),
    fields:[
      tokenize(item.title),
      tokenize(item.keywords || ''),
      tokenize(item.description || ''),
    ],
  })))
  return CORPUS_CACHE.get(key)
}
function scoreFor(query, entry) {
  const words=terms(query)
  if(!words.length)return 0
  const [titleTokens,keywordTokens,bodyTokens]=entry.fields
  let found=0,score=0
  for(const word of words) {
    const title=matchStrength(word,titleTokens)
    const keyword=matchStrength(word,keywordTokens)
    const body=matchStrength(word,bodyTokens)
    const strongest=Math.max(title,keyword,body)
    if(strongest<0.6) {
      // A key topic (especially recording or caller role) is never optional.
      if(TOPIC_ANCHORS.has(word))return 0
      continue
    }
    found++
    score+=Math.max(title*50,keyword*32,body*12)
    if(TOPIC_ANCHORS.has(word) && !title && !keyword) score-=5
  }
  const required=words.length<=2?words.length:Math.max(2,Math.ceil(words.length*0.7))
  if(found<required)return 0
  // Exact titles and title phrases beat incidental source-document text.
  const q=normalizeSearchText(query)
  if(entry.title===q)score+=250
  else if(entry.title.includes(q))score+=110
  if(entry.keywords.includes(q))score+=45
  score+=found*7-(words.length-found)*15
  return score
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
      lessonId:lesson.id,keywords:[lesson.remember,lesson.sourceLabel,...(lesson.takeaways||[]),...(lesson.flow||[]).map(stage=>stage.label+' '+stage.cue)].join(' '),
    })),
    ...DEVICE_WALKTHROUGHS.map(device => training('devices',device.id,device.title,device.summary,{
      device:device.id,keywords:[device.label,device.subtitle,...(device.sections||[]).map(section=>section.title+' '+section.steps.join(' '))].join(' '),
    })),
    ...TRAINING_ROADMAP_MODULES.filter(module => module.status === 'available').map(module =>
      training(module.target?.section || 'roadmap','roadmap-'+module.id,module.title,module.objective,{
        ...module.target,keywords:module.skills.join(' '),
      })),
    ...COMMUNICATION_SECTIONS.map(section =>
      training('scripts','script-'+section.id,section.title,section.purpose,{
        mode:'language',subsection:section.id,
        keywords:section.phrases?.map(phrase => phrase.label+' '+phrase.text).join(' ') || '',
      })),
    ...SCENARIO_SCRIPTS.map(script => training('scripts','scenario-'+script.id,
      script.label+' — call scenario','Approved scenario script and guided caller discovery',{
        mode:'scenarios',scenario:script.id,keywords:[script.opening,script.guidePhrase,script.confirmPhrase,script.boundaryPhrase].join(' '),
      })),
    ...SUPPLEMENTAL_PROCESS_DOCUMENTS.map(doc => ({
      kind:'source_document',id:doc.id,title:doc.title,description:doc.purpose,
      category:'Process Documents',sourceCategory:doc.category,keywords:doc.sourceText || doc.category,
    })),
    ...FLEX_HUB_REFERENCE.topics.map(topic => ({
      kind:'hub_reference',id:'guide-'+topic.id,title:topic.label,description:topic.summary,
      category:topic.pending?'Flex Hub Guide · Source verification needed':'Flex Hub Process Guide',
      topicId:topic.id,tab:'processes',
      keywords:[topic.keywords,...topic.points,...(topic.steps||[])].join(' '),
    })),
    ...FLEX_HUB_FAQS.map(item => ({
      kind:'hub_reference',id:item.id,title:item.label,description:item.answer,
      category:item.pending?'Flex Hub FAQ · Source verification needed':'Flex Hub FAQ',
      topicId:item.sourceTopic,tab:'faqs',keywords:'flex arbitration hub faq',
    })),
    ...FLEX_HUB_ROADBLOCKS.map(item => ({
      kind:'hub_reference',id:'roadblock-'+item.id,title:item.issue,
      description:item.check+' '+item.next,
      category:item.pending?'Flex Hub Roadblock · Source verification needed':'Flex Hub Roadblock',
      topicId:item.sourceTopic,tab:'roadblocks',keywords:'flex arbitration hub roadblock',
    })),
    ...updatesForAudience(isAdmin).map(entry => ({
      kind:'update',id:entry.id,title:entry.title,description:entry.area,
      category:'What’s New',keywords:entry.changed,
    })),
  ]
}

export function searchOzzieContent(query,{isAdmin=false,role='Host',limit=6}={}) {
  const normalized=normalizeSupportQuery(query)
  if(!normalized || terms(normalized).every(word=>word.length<2))return []
  if(role==='Participant' && isUnverifiedParticipantSearch(normalized))return []
  return indexedEntries(isAdmin)
    .filter(({item})=>role==='Host'||(item.kind!=='hub_reference' && item.sourceCategory!=='hub'))
    .map(entry=>({item:entry.item,score:scoreFor(normalized,entry)}))
    .filter(result=>result.score>0)
    .sort((a,b)=>b.score-a.score||a.item.title.localeCompare(b.item.title))
    .slice(0,limit)
    .map(({item})=>item)
}
