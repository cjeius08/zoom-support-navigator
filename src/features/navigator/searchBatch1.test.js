import {expect,it} from 'vitest'
import {searchCommonIssueRoutes} from './commonIssueRoutes'
import {searchHostTopics,searchHostRoadblocks} from '../../data/hostExperience'
import {commandResults} from '../command/commandSearch'
it.each(['cannot hear me',"they can't hear me"] )('microphone first: %s',q=>{expect(searchCommonIssueRoutes(q)[0].id).toBe('cant-be-heard');expect(commandResults(q,{role:'Participant'})[0].id).toBe('cant-be-heard')})
it('keeps output audio separate',()=>expect(searchCommonIssueRoutes('I cannot hear anyone')[0].id).toBe('cant-hear'))
it('finds initial Host joining route',()=>expect(searchHostTopics("I can't get into my hearing")[0].id).toBe('host-start-hearing'))
it('finds unmuted microphone route',()=>expect(searchHostTopics('Microphone is unmuted but participants cannot hear me')[0].id).toBe('host-audio'))
it('routes policy and account questions to approved boundaries',()=>{expect(searchHostRoadblocks('Recording during breaks')[0].id).toBe('roadblock-proceeding-policy');expect(searchHostRoadblocks('Unable to log out personal Zoom and switch account')[0].id).toBe('roadblock-account-permission')})
it('finds approved rescheduling reference',()=>expect(commandResults('Reschedule hearing date')[0].id).toBe('flex_hub'))
