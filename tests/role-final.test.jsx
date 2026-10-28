import {it,expect} from 'vitest'
import {approvedQuickAnswer} from '../src/features/navigator/answerFirst'
import {commandResults} from '../src/features/command/commandSearch'
it.each(['Reschedule hearing date','Recording during breaks','Unable to log out personal Zoom and switch account'])('Host-only answer: %s',q=>{expect(approvedQuickAnswer(q,{role:'Participant'})).toBeNull();expect(commandResults(q,{role:'Participant'}).some(x=>x.id==='flex_hub')).toBe(false);expect(approvedQuickAnswer(q,{role:'Host'})).toBeTruthy()})
