import { expect,it } from 'vitest'
import { processSections } from './processText'

it('preserves wording while structuring inline and standalone headings',()=>{
  expect(processSections('Purpose: Exact purpose\nIntroduction\nExact introduction')).toEqual([
    {heading:'Purpose',lines:['Exact purpose']},
    {heading:'Introduction',lines:['Exact introduction']},
  ])
})

it('surfaces source-specific requirement, quick-guide, limitation, and referral headings',()=>{
  const sections=processSections('Requirements and Important Notes\nKeep this note.\nQuick Flow\nDo this next.\nImportant Transfer Limitations\nDo not transfer.\nReferral / Roadblock Matrix\nContact IT.')
  expect(sections.map(section=>section.heading)).toEqual(['Requirements and Important Notes','Quick Flow','Important Transfer Limitations','Referral / Roadblock Matrix'])
})
