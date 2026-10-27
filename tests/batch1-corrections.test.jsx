import {it,expect} from 'vitest'
import {render,screen,fireEvent,cleanup} from '@testing-library/react'
import {approvedQuickAnswer} from '../src/features/navigator/answerFirst'
import {commandResults} from '../src/features/command/commandSearch'
import {Navigator} from '../src/features/navigator/Navigator'
it.each(['Host','Participant'])('unable microphone quick answer %s',role=>expect(approvedQuickAnswer('participants are unable to hear me',{role})).toBeTruthy())
it('participant joining has destination',()=>expect(commandResults("I can't get into my hearing",{role:'Participant'})[0].id).toBe('cant-join'))
it('switching is a coverage gap, not automatic escalation',()=>expect(approvedQuickAnswer('Unable to log out personal Zoom and switch account').heading).toMatch(/Coverage gap/))
it('break answer preserves approved rule with confirmation boundary',()=>{const a=approvedQuickAnswer('Recording during breaks');expect(a.answer).toMatch(/must remain active/);expect(a.confirmation).toMatch(/confirmation/)})
it('rescheduling rendered quick action carries section destination',()=>{let target;render(<Navigator onOpenFlexHub={v=>{target=v}}/>);fireEvent.change(screen.getByRole('combobox'),{target:{value:'Reschedule hearing date'}});fireEvent.focus(screen.getByRole('combobox'));fireEvent.click(screen.getAllByRole('option')[0]);expect(target).toBe('scheduling');cleanup()})

it('section destination is focused and approved PMI text renders',async()=>{
 const {FlexHubReference}=await import('../src/features/knowledge/FlexHubReference')
 render(<FlexHubReference initialSection="scheduling"/>)
 expect(document.activeElement.id).toBe('flex-scheduling')
 expect(document.activeElement.textContent).toMatch(/PMI link itself does not need to be edited/)
 cleanup()
})
it('Command Center selection retains scheduling section',()=>{
 const target=commandResults('Reschedule hearing date')[0]
 expect(target).toMatchObject({kind:'page',id:'flex_hub',section:'scheduling'})
})
