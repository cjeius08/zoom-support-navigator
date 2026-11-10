import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProcessDocuments } from '../knowledge/ProcessDocuments'
import { TrainingResources } from '../training/TrainingResources'
import { UpdatesView } from '../updates/UpdatesView'

describe('Ozzie-wide search direct destinations', () => {
  it('opens the exact approved source document instead of a generic process page', () => {
    render(<ProcessDocuments initialDocumentId="flex-hub-agent-reference-source" />)
    expect(screen.getByRole('heading', { name: /Flex Arbitration Hub – Agent Reference Guide/i })).toBeInTheDocument()
    expect(screen.getByText(/Restricted contact redacted/i)).toBeInTheDocument()
  })

  it('opens a selected Guided Visual Lesson directly from a search result', async () => {
    render(<TrainingResources initialTarget={{ section:'lessons', lessonId:'official-call-flow' }} />)
    await waitFor(() => expect(screen.getByRole('tabpanel', { name:/Follow the Ogletree call flow before troubleshooting/i })).toBeInTheDocument())
  })

  it('filters What’s New to the selected search result', async () => {
    render(<UpdatesView initialEntryId="ozzie-cross-workspace-search-20261110" />)
    await waitFor(() => expect(screen.getByRole('searchbox',{name:'Find an update'})).toHaveValue('Search Across Ozzie — Guides, Videos, Documents, Training and Updates'))
    expect(screen.getByRole('heading',{name:'Search Across Ozzie — Guides, Videos, Documents, Training and Updates'})).toBeInTheDocument()
    expect(screen.queryByRole('heading',{name:'Easier Knowledge Navigation — Three Support Areas and Expanded Flex Hub'})).not.toBeInTheDocument()
  })
})
