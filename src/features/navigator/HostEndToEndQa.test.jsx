import { useState } from 'react'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'
import { Navigator } from './Navigator'
import { AppShell } from '../shell/AppShell'
import { loadOwnCallNotes } from '../../lib/callNotesApi'

vi.mock('../../lib/callNotesApi', () => ({
  loadOwnCallNotes: vi.fn(),
  saveOwnCallNote: vi.fn(),
}))

const profile = {
  id: 'agent-qa',
  username: 'qa_agent',
  initials: 'QA',
  role: 'agent',
  workspace_role: 'member',
  avatar_id: null,
}

function HostWorkspaceHarness() {
  const [documentationHandoff, setDocumentationHandoff] = useState(null)

  return <AppShell
    profile={profile}
    currentView="navigator"
    documentationHandoff={documentationHandoff}
    onDocumentationHandoffApplied={() => setDocumentationHandoff(null)}
    avatars={[]}
  >
    <Navigator onAddToDocumentation={setDocumentationHandoff} />
  </AppShell>
}

async function openHostSearchResult(user, query, resultName) {
  const search = screen.getByRole('combobox', { name: 'Search support processes' })
  await user.clear(search)
  await user.type(search, query)
  const listbox = screen.getByRole('listbox', { name: 'Search suggestions' })
  await user.click(within(listbox).getByRole('option', { name: resultName }))
}

function documentationDock() {
  return screen.getByRole('heading', { name: 'Call Documentation' }).closest('aside')
}

beforeEach(() => {
  loadOwnCallNotes.mockReset()
  loadOwnCallNotes.mockResolvedValue([])
})

it('runs a Host audio call end to end and hands the resolved path into the existing Call Documentation', async () => {
  const user = userEvent.setup()
  render(<HostWorkspaceHarness />)

  await openHostSearchResult(user, 'mic not working', /My microphone, speaker, or headset is not working/i)
  const dialog = screen.getByRole('dialog', { name: /Host microphone, speaker, or headset problem/i })

  await user.click(within(dialog).getByRole('button', { name: 'Windows' }))
  await user.click(within(dialog).getByRole('button', { name: 'Others cannot hear the arbitrator' }))
  await user.click(within(dialog).getByRole('button', { name: 'Built-in microphone/speaker' }))
  await user.click(within(dialog).getByRole('button', { name: 'Yes' }))

  expect(within(dialog).getByText(/In Zoom Settings > Audio/i)).toBeInTheDocument()
  expect(within(dialog).getByText(/Can the arbitrator hear the test\/output/i)).toBeInTheDocument()

  await user.click(within(dialog).getByRole('button', { name: 'Yes / confirmed' }))
  expect(within(dialog).getByText(/Resolved within Tier 1/i)).toBeInTheDocument()
  await user.click(within(dialog).getByRole('button', { name: 'Add to Call Documentation' }))

  const dock = await waitFor(() => documentationDock())
  expect(within(dock).getByLabelText('Device / platform')).toHaveValue('Windows')
  expect(within(dock).getByLabelText(/Exact issue/i)).toHaveValue('Host microphone, speaker, or headset problem')
  expect(within(dock).getByLabelText(/Steps attempted \+ result/i).value).toMatch(/Confirmed before proceeding/i)
  expect(within(dock).getByLabelText(/Steps attempted \+ result/i).value).toMatch(/In Zoom Settings > Audio/i)
  expect(within(dock).getByLabelText(/Resolution \/ next steps/i).value).toMatch(/verified audio operation/i)
  expect(within(dock).getByRole('button', { name: 'Resolved' })).toHaveAttribute('aria-pressed', 'true')
  expect(within(dock).getByText(/Guided troubleshooting added to this draft/i)).toBeInTheDocument()
})

it('captures a mid-troubleshooting meeting-details roadblock and its approved next action in Call Documentation', async () => {
  const user = userEvent.setup()
  render(<HostWorkspaceHarness />)

  await openHostSearchResult(user, 'meeting id not working', /The meeting link, ID, or passcode is not working/i)
  const dialog = screen.getByRole('dialog', { name: /Meeting link, ID, or passcode is not working/i })

  const errorInput = within(dialog).getByLabelText(/What exact error or message does Zoom show/i)
  await user.type(errorInput, 'Invalid Meeting ID')
  await user.click(within(dialog).getByRole('button', { name: 'Confirm and continue' }))
  await user.click(within(dialog).getByRole('button', { name: 'No' }))

  expect(within(dialog).getByText(/Review only the details the arbitrator already received/i)).toBeInTheDocument()
  await user.click(within(dialog).getByRole('button', { name: 'No / not resolved' }))

  expect(within(dialog).getByText('Tier 1 roadblock')).toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: /Incorrect or uncertain meeting link/i })).toBeInTheDocument()
  expect(within(dialog).getByText(/welcome email from kipsflexmassarbs@ogletreedeakins.com/i)).toBeInTheDocument()
  await user.click(within(dialog).getByRole('button', { name: /Add roadblock to Call Documentation/i }))

  const dock = await waitFor(() => documentationDock())
  expect(within(dock).getByLabelText(/Exact issue/i)).toHaveValue('Meeting link, ID, or passcode is not working')
  expect(within(dock).getByLabelText(/Steps attempted \+ result/i).value).toMatch(/Invalid Meeting ID/i)
  expect(within(dock).getByLabelText(/Steps attempted \+ result/i).value).toMatch(/Not resolved/i)
  expect(within(dock).getByLabelText(/Resolution \/ next steps/i).value).toMatch(/submit an Alaga escalation/i)
  expect(within(dock).getByRole('button', { name: 'Not Resolved | Escalated' })).toHaveAttribute('aria-pressed', 'false')
})

it('stops immediately on a recording-setting or policy request instead of forcing irrelevant troubleshooting', async () => {
  const user = userEvent.setup()
  render(<Navigator />)

  await openHostSearchResult(user, 'stop recording', /I have a question about the recording indicator or stopping the recording/i)
  const dialog = screen.getByRole('dialog', { name: /Recording indicator or request to stop\/change recording/i })

  await user.click(within(dialog).getByRole('button', { name: 'Can I stop/pause/change the recording?' }))

  expect(within(dialog).getByText('Tier 1 roadblock')).toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: /Privacy, recording, confidentiality, or proceeding-policy question/i })).toBeInTheDocument()
  expect(within(dialog).queryByText(/Approved troubleshooting/i)).not.toBeInTheDocument()
  expect(within(dialog).getByText(/cannot interpret privacy, recording, confidentiality, or proceeding rules/i)).toBeInTheDocument()
})

it('redirects a Host who is not inside the hearing to the Host start/join guide without falling into Participant guidance', async () => {
  const user = userEvent.setup()
  render(<Navigator />)

  await openHostSearchResult(user, 'no host controls', /I do not see my host controls/i)
  let dialog = screen.getByRole('dialog', { name: /Host controls are missing/i })

  await user.click(within(dialog).getByRole('button', { name: 'Yes' }))
  await user.click(within(dialog).getByRole('button', { name: 'No' }))

  dialog = screen.getByRole('dialog', { name: /Start or join the hearing as host/i })
  expect(within(dialog).getByText(/Confirm before proceeding/i)).toBeInTheDocument()
  expect(within(dialog).getByText(/signed in to Zoom using the assigned credentials/i)).toBeInTheDocument()
  expect(screen.queryByText(/Waiting for the host to start/i)).not.toBeInTheDocument()
})

it('keeps the Participant baseline available after Host QA', async () => {
  const user = userEvent.setup()
  render(<Navigator />)

  await user.click(screen.getByRole('button', { name: 'Participant' }))
  expect(screen.getByRole('heading', { name: 'Fastest Routes' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /I’m waiting to get in/i })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Fastest Host Routes' })).not.toBeInTheDocument()
})
