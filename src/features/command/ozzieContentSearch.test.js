import { describe, expect, it } from 'vitest'
import { commandResults } from './commandSearch'
import { searchOzzieContent } from './ozzieContentSearch'
import { UPDATES } from '../updates/updatesData'

describe('Ozzie-wide source-backed search', () => {
  const cases = [
    ['Flex SP Site Overview', 'video', 'flex-hub-site-overview'],
    ['Zoom Personal Profile and Meeting ID', 'video', 'training-03'],
    ['Windows desktop walkthrough', 'training_section', 'windows'],
    ['Follow the Ogletree call flow', 'training_section', 'official-call-flow'],
    ['Opening Greeting', 'training_section', 'script-opening'],
    ['Flex Arbitration Hub Agent Reference Guide', 'source_document', 'flex-hub-agent-reference-source'],
    ['Easier Knowledge Navigation', 'update', 'flex-hub-knowledge-three-areas-and-reference-20261110'],
  ]
  it.each(cases)('locates %s with its exact destination', (query, kind, id) => {
    expect(searchOzzieContent(query, {role:'Host',limit:20})).toEqual(expect.arrayContaining([
      expect.objectContaining({kind,id}),
    ]))
  })


  it('finds specific training even with conversational wording and a typo', () => {
    expect(searchOzzieContent('pano Windows desktp walkthrough',{role:'Host'})[0])
      .toMatchObject({kind:'training_section',id:'windows'})
    expect(searchOzzieContent('Opening Greeting',{role:'Host'})[0])
      .toMatchObject({kind:'training_section',id:'script-opening'})
  })

  it('keeps role boundaries and avoids hallucinating an unrelated reference', () => {
    const request='How is a document manually shared?'
    expect(searchOzzieContent(request,{role:'Participant'}).every(item=>item.kind!=='hub_reference')).toBe(true)
    expect(searchOzzieContent('zzzzxxxyyyunknownmaterial',{role:'Host'})).toEqual([])
    expect(commandResults('no host controls',{role:'Host'})[0]).toMatchObject({kind:'host',id:'host-controls-missing'})
  })

  it('integrates training, documents and updates with Command Center results', () => {
    expect(commandResults('Windows desktop walkthrough',{role:'Host'}).some(result => result.kind === 'training_section' && result.device === 'windows')).toBe(true)
    expect(commandResults('Flex SP Site Overview',{role:'Host'}).some(result => result.kind === 'video' && result.id === 'flex-hub-site-overview')).toBe(true)
    expect(commandResults('Easier Knowledge Navigation',{role:'Host'}).some(result => result.kind === 'update' && result.id === 'flex-hub-knowledge-three-areas-and-reference-20261110')).toBe(true)
  })

  it('preserves the reviewed troubleshooting and FAQ route priorities', () => {
    expect(commandResults('no host controls',{role:'Host'})[0]).toMatchObject({kind:'host',id:'host-controls-missing'})
    expect(commandResults('Recording',{role:'Host'}).some(result => result.kind === 'faq' && result.id === 'Recording')).toBe(true)
    expect(commandResults('cant share',{role:'Participant'}).some(result => result.kind === 'issue')).toBe(true)
  })

  it('does not index admin updates for members or leak admin page navigation', () => {
    const adminEntry = UPDATES.find(item => item.audience === 'admin')
    expect(adminEntry).toBeDefined()
    expect(searchOzzieContent(adminEntry.title,{isAdmin:false,limit:50}).some(x => x.kind === 'update' && x.id === adminEntry.id)).toBe(false)
    expect(commandResults('Team Management',{isAdmin:false}).some(x => x.id === 'team')).toBe(false)
    expect(commandResults('Team Management',{isAdmin:true}).some(x => x.id === 'team')).toBe(true)
  })

  it('keeps member notes private and role-specific references correctly gated', () => {
    expect(commandResults('My Saved Notes',{isAdmin:false}).some(x => x.kind === 'page' && x.id === 'my_saved_notes')).toBe(true)
    expect(commandResults('All Saved Notes',{isAdmin:false}).some(x => x.kind === 'page' && x.id === 'saved_notes')).toBe(false)
    expect(searchOzzieContent('How is a document manually shared?',{role:'Host'}).some(x => x.kind === 'hub_reference' && /Source verification needed/.test(x.category))).toBe(true)
    expect(searchOzzieContent('How is a document manually shared?',{role:'Participant'}).some(x => x.kind === 'hub_reference')).toBe(false)
  })
})
