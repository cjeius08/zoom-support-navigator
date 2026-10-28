import {it,expect} from 'vitest'
import {commandResults} from '../src/features/command/commandSearch'
import {approvedQuickAnswer} from '../src/features/navigator/answerFirst'
const cases=[
['cannot hear me','host-audio','cant-be-heard','host-mic-first-check','participant-mic-first-check'],
["they can't hear me",'host-audio','cant-be-heard','host-mic-first-check','participant-mic-first-check'],
['they can’t hear me','host-audio','cant-be-heard','host-mic-first-check','participant-mic-first-check'],
['participants are unable to hear me','host-audio','cant-be-heard','host-mic-first-check','participant-mic-first-check'],
['microphone is unmuted but participants cannot hear me','host-audio','cant-be-heard','host-unmuted-mic','participant-unmuted-mic'],
["I can't hear anyone",'host-audio','cant-hear','host-speaker-check','participant-speaker-check'],
['camera preview is not showing the expected camera','host-camera','camera-not-working','host-wrong-camera','participant-wrong-camera'],
['host controls missing','host-controls-missing','meeting-controls','host-controls-missing',null],
['I can’t get into my hearing','host-start-hearing','cant-join',null,'participant-join-diagnostic'],
['recording during breaks','flex_hub',null,'recording-break-boundary',null],
['reschedule hearing date','flex_hub','waiting-for-the-host-to-start-a-meeting-or-webinar','scheduling',null],
['unable to log out personal zoom and switch account','flex_hub',null,'account-switch-coverage',null],
['automatic recording','host-recording-basic','transfer-device','host-recording-policy',null],
['waiting room','host-waiting-room','waiting-entry',null,null],
['camera not working','host-camera','camera-not-working','host-camera-first-check','participant-camera-first-check'],
['can hear me','troubleshooting-speaker-or-microphone-issues-in-the-zoom-desktop-app','cant-be-heard',null,null],
]
for(const [q,h,p,hq,pq] of cases) for(const role of ['Host','Participant']) it(`${role}: ${q}`,()=>{
 const first=commandResults(q,{role})[0];const answer=approvedQuickAnswer(q,{role});const id=role==='Host'?h:p;const intent=role==='Host'?hq:pq
 if(id) expect(first.id).toBe(id)
 else expect(first?.id ?? null).toBe(null)
 expect(answer?.id??null).toBe(intent)
 if(answer){expect(answer.guide.id).toBe(role==='Host'?(intent==='host-controls-missing'?'host-controls-missing':intent==='scheduling'?'scheduling':intent==='account-switch-coverage'?'credentials':intent==='recording-break-boundary'?'rules':intent==='host-recording-policy'?'Recording':intent?.includes('camera')?'host-camera':'host-audio'):(intent?.includes('camera')?'camera-not-working':intent==='participant-join-diagnostic'?'cant-join':intent==='participant-speaker-check'?'cant-hear':'cant-be-heard'))}
})
