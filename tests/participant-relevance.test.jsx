import {it,expect} from 'vitest'
import {render,screen,fireEvent,cleanup} from '@testing-library/react'
import {Navigator} from '../src/features/navigator/Navigator'
import {CommandCenter} from '../src/features/command/CommandCenter'
import {commandResults} from '../src/features/command/commandSearch'
it.each(['Reschedule hearing date','Automatic recording'])('no unrelated Participant guides: %s',q=>{
 expect(commandResults(q,{role:'Participant'})).toEqual([])
 render(<Navigator initialRole="Participant"/>);fireEvent.change(screen.getByRole('combobox'),{target:{value:q}});fireEvent.focus(screen.getByRole('combobox'));expect(screen.queryAllByRole('option')).toHaveLength(0);expect(screen.getByText(/No verified quick answer/)).toBeInTheDocument();cleanup()
 render(<CommandCenter initialRole="Participant"/>);fireEvent.change(screen.getByRole('combobox'),{target:{value:q}});expect(screen.queryAllByRole('option')).toHaveLength(0);expect(screen.getByText('No approved matches found.')).toBeInTheDocument();cleanup()
})
