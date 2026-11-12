import { describe, expect, it } from 'vitest'
import { buildSearchSuggestions } from './searchSuggestions'

describe('safe universal suggestion slots', () => {
  it('preserves every reviewed primary match when there is room', () => {
    const route = {id:'cant-share',title:'Can’t share my screen'}
    const process = {id:'sharing',title:'Sharing Your Screen'}
    const source = {kind:'video',id:'video-1',title:'Video training'}
    const results = buildSearchSuggestions({
      query:'cant share',isHost:false,quickAnswer:null,hubMatch:false,
      routeMatches:[route],processMatches:[process],globalResults:[source],
    })
    expect(results.map(result=>result.kind)).toEqual(['route','process','global'])
  })

  it('preserves approved ordering yet exposes one destination in a crowded list', () => {
    const source = {kind:'training_section',id:'windows',title:'Windows desktop walkthrough'}
    const routes = Array.from({length:8},(_,index)=>({id:'host-'+index,title:'Approved Host route '+index}))
    const results = buildSearchSuggestions({
      query:'windows',isHost:true,quickAnswer:null,hubMatch:false,
      hostTopicMatches:routes,globalResults:[source],
    })
    expect(results).toHaveLength(8)
    expect(results[0].kind).toBe('host')
    expect(results.some(result=>result.kind==='global'&&result.result.id==='windows')).toBe(true)
  })

  it('does not pin an unverified coverage gap as a verified answer', () => {
    const results = buildSearchSuggestions({
      query:'stop recording',isHost:true,quickAnswer:{status:'coverage_gap'},
      hubMatch:false,globalResults:[],
    })
    expect(results).toEqual([])
  })
})
