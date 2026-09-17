import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { ProcessDrawer } from './ProcessDrawer'

it('shows scripts where they belong without a duplicated aggregate script', () => {
  const process = {
    title: 'Audio troubleshooting test process',
    purpose: 'Verify live-call script presentation.',
    category: 'support',
    referral: '',
    visualReferences: [],
    images: [],
    text: [
      'Process / Step-by-Step Guide',
      '1. Check audio device',
      'Confirm the selected audio device.',
      'Sample Script',
      'Please test your microphone.',
      '2. Confirm playback',
      'Confirm the customer can hear audio.',
      'Sample Script',
      'Please confirm you can hear me.',
      'Sample Closing Script',
      'Thanks for testing with me.',
    ].join('\n'),
  }

  render(<ProcessDrawer process={process} onClose={() => {}} />)

  // Only the two step cards should carry the generic Suggested Script label.
  expect(screen.getAllByText('Suggested Script')).toHaveLength(2)
  expect(screen.getByText('Please test your microphone.')).toBeInTheDocument()
  expect(screen.getByText('Please confirm you can hear me.')).toBeInTheDocument()

  // A source-level script must still be preserved once instead of being hidden in a giant aggregate block.
  expect(screen.getByText('Additional Source Script')).toBeInTheDocument()
  expect(screen.getAllByText('Thanks for testing with me.')).toHaveLength(1)
})
