import {it,expect} from 'vitest'
import {render,screen,cleanup,fireEvent} from '@testing-library/react'
import {Navigator} from '../src/features/navigator/Navigator'
import {CommandCenter} from '../src/features/command/CommandCenter'
import {commandResults} from '../src/features/command/commandSearch'
import {approvedQuickAnswer} from '../src/features/navigator/answerFirst'
it('records the exact audit matrix for both roles',()=>{
for(const role of ['Host','Participant']) for(const q of ['they can’t hear me','microphone is unmuted but participants cannot hear me','camera preview is not showing the expected camera','host controls missing','I can’t get into my hearing','recording during breaks','reschedule hearing date','unable to log out personal zoom and switch account','automatic recording','waiting room','camera not working','can hear me','cannot hear me',"I can't hear anyone","they cannot hear me",'participants are unable to hear me']) console.log(JSON.stringify({role,q,first:commandResults(q,{role})[0]?.title,quick:approvedQuickAnswer(q,{role})?.heading}))
})
it.each(['Host','Participant'])('rendered Command Center microphone ordering %s',role=>{render(<CommandCenter initialRole={role}/>);fireEvent.change(screen.getByRole('combobox'),{target:{value:'cannot hear me'}});const first=screen.getAllByRole('option')[0];expect(first.textContent).toMatch(role==='Host'?/microphone, speaker, or headset/:/They can’t hear me/);cleanup()})
it.each(['Host','Participant'])('Smart Search microphone ordering %s',role=>{render(<Navigator initialRole={role}/>);const input=screen.getByRole('combobox');fireEvent.change(input,{target:{value:'cannot hear me'}});fireEvent.focus(input);console.log('SMART',role,screen.getAllByRole('option')[0].textContent);expect(screen.getAllByRole('option')[0].textContent).toMatch(role==='Host'?/microphone, speaker, or headset/:/They can’t hear me/);cleanup()})
