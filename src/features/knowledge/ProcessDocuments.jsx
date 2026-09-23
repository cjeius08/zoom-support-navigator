import { useEffect, useMemo, useState } from 'react'
import { PROCESSES } from '../../data/processes'
import { assetUrl } from '../../lib/assetUrl'
import { normalizeSearchText } from '../navigator/smartSearch'
import './processDocuments.css'

const categoryLabels = {
  join: 'Joining Meetings',
  audio: 'Audio & Microphone',
  video: 'Camera & Video',
  controls: 'Meeting Controls',
  sharing: 'Screen Sharing',
  devices: 'Devices & App',
  support: 'Support Boundaries',
}

export function ProcessDocuments({ onTrackEvent, onReportContextChange = () => {} }) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const documents = useMemo(
    () => PROCESSES
      .filter(process => process.images?.length > 0)
      .slice()
      .sort((a, b) => a.title.localeCompare(b.title)),
    [],
  )

  const selected = documents.find(process => process.id === selectedId) || null
  const filteredDocuments = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query)
    if (!normalizedQuery) return documents
    return documents.filter(process => [
      process.title,
      process.purpose,
      categoryLabels[process.category] || process.category,
    ].some(value => normalizeSearchText(value).includes(normalizedQuery)))
  }, [documents, query])

  useEffect(() => {
    onReportContextChange({
      selected_tab: 'Process Documents',
      current_section: selected ? selected.title : 'Process Documents library',
      process_id: selected?.id ?? null,
      category_id: selected?.category ?? null,
    })
  }, [selected, onReportContextChange])

  function openDocument(process) {
    setSelectedId(process.id)
    onTrackEvent?.({
      eventType: 'tool_open',
      routeId: 'process_documents',
      processId: process.id,
      categoryId: process.category,
      toolId: 'source_document',
    })
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  }

  if (selected) {
    return <section className="process-documents-view process-document-reader" aria-label="Process document">
      <div className="process-document-reader-toolbar">
        <button type="button" className="process-document-back" onClick={() => setSelectedId(null)}>
          <span aria-hidden="true">←</span>
          Back to Process Documents
        </button>
        <span>{selected.images.length} {selected.images.length === 1 ? 'page' : 'pages'}</span>
      </div>

      <header className="process-document-reader-heading">
        <p className="eyebrow">Original source pages</p>
        <h1>{selected.title}</h1>
        <p>{selected.purpose}</p>
        <div className="process-document-meta">
          <span>{categoryLabels[selected.category] || selected.category}</span>
          <span>{selected.images.length} source {selected.images.length === 1 ? 'page' : 'pages'}</span>
        </div>
      </header>

      <div className="process-document-pages">
        {selected.images.map((image, index) => <figure key={image} className="process-document-page">
          <figcaption>
            <span>Page {index + 1} of {selected.images.length}</span>
            <a href={assetUrl(image)} target="_blank" rel="noreferrer">Open full size</a>
          </figcaption>
          <img
            loading={index === 0 ? 'eager' : 'lazy'}
            src={assetUrl(image)}
            alt={`${selected.title} source page ${index + 1}`}
          />
        </figure>)}
      </div>
    </section>
  }

  return <section className="process-documents-view" aria-label="Process Documents">
    <header className="process-documents-heading">
      <div>
        <p className="eyebrow">Knowledge · Source library</p>
        <h1>Process Documents</h1>
        <p>Open the original source pages by process title. These documents remain available alongside the faster Process Guides and Common Issue routes.</p>
      </div>
      <span className="process-document-count">{documents.length} documents</span>
    </header>

    <label className="process-document-search">
      <span>Find a process document</span>
      <input
        type="search"
        value={query}
        onChange={event => setQuery(event.target.value)}
        placeholder="Search by process title or support area…"
      />
    </label>

    <div className="process-document-library-status" role="status" aria-live="polite">
      {filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'}
    </div>

    {filteredDocuments.length > 0 ? <div className="process-document-grid">
      {filteredDocuments.map(process => <button
        type="button"
        className="process-document-card"
        key={process.id}
        onClick={() => openDocument(process)}
      >
        <span className="process-document-card-category">{categoryLabels[process.category] || process.category}</span>
        <strong>{process.title}</strong>
        <p>{process.purpose}</p>
        <span className="process-document-card-footer">
          <span>{process.images.length} {process.images.length === 1 ? 'page' : 'pages'}</span>
          <b>Open document →</b>
        </span>
      </button>)}
    </div> : <div className="process-document-empty">
      <h2>No process document found</h2>
      <p>Try another process title or support area.</p>
    </div>}
  </section>
}
