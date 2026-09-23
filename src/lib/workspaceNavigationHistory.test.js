import { describe, expect, it } from 'vitest'
import {
  completeWorkspaceNavigation,
  createWorkspaceNavigationState,
  resolveWorkspaceNavigationState,
  startWorkspaceNavigation,
} from './workspaceNavigationHistory'

describe('workspace browser navigation state', () => {
  it('restores the previous view on Back and the destination on Forward', () => {
    const home = { view: 'navigator', reportContext: {} }
    const notes = { view: 'my_saved_notes', reportContext: {} }

    const initial = createWorkspaceNavigationState(home)
    const pending = startWorkspaceNavigation(initial, home)
    const notesEntry = completeWorkspaceNavigation(pending, notes)

    expect(resolveWorkspaceNavigationState(initial)).toMatchObject({ snapshot: home, backStack: [] })
    expect(resolveWorkspaceNavigationState(notesEntry)).toMatchObject({ snapshot: notes, backStack: [home] })
  })

  it('truncates the Forward branch after navigating from a restored earlier view', () => {
    const home = { view: 'navigator' }
    const training = { view: 'training' }

    const currentHomeEntry = createWorkspaceNavigationState(home)
    const newEntry = completeWorkspaceNavigation(startWorkspaceNavigation(currentHomeEntry, home), training)

    expect(newEntry.stack).toEqual([home, training])
    expect(newEntry.index).toBe(1)
  })
})
