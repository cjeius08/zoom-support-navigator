import { expect,it } from 'vitest'
import { processSections } from './processText'

it('preserves wording while structuring inline and standalone headings',()=>{
  expect(processSections('Purpose: Exact purpose\nIntroduction\nExact introduction')).toEqual([
    {heading:'Purpose',lines:['Exact purpose']},
    {heading:'Introduction',lines:['Exact introduction']},
  ])
})
