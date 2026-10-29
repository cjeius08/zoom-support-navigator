import {it,expect} from 'vitest'
import {render,screen,cleanup,fireEvent} from '@testing-library/react'
import {Navigator} from '../src/features/navigator/Navigator'
import {CommandCenter} from '../src/features/command/CommandCenter'
it.each(['Host','Participant'])('rendered Command Center microphone ordering %s',role=>{render(<CommandCenter initialRole={role}/>);fireEvent.change(screen.getByRole('combobox'),{target:{value:'cannot hear me'}});const first=screen.getAllByRole('option')[0];expect(first.textContent).toMatch(role==='Host'?/microphone, speaker, or headset/:/They can’t hear me/);cleanup()})
it.each(['Host','Participant'])('Smart Search microphone ordering %s',role=>{render(<Navigator initialRole={role}/>);const input=screen.getByRole('combobox');fireEvent.change(input,{target:{value:'cannot hear me'}});fireEvent.focus(input);expect(screen.getAllByRole('option')[0].textContent).toMatch(role==='Host'?/microphone, speaker, or headset/:/They can’t hear me/);cleanup()})
