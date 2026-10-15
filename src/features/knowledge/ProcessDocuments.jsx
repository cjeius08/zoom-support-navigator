import { useEffect, useMemo, useState } from 'react'
import { PROCESSES } from '../../data/processes'
import { SUPPLEMENTAL_PROCESS_DOCUMENTS } from '../../data/processDocumentExtras'
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
  hub: 'Flex Arbitration Hub',
}

export function ProcessDocuments({ onTrackEvent, onReportContextChange = () => {}, onOpenReference = () => {} }) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const documents = useMemo(
    () => [...PROCESSES.filter(process => process.images?.length > 0 || process.sourceText?.length > 0), ...SUPPLEMENTAL_PROCESS_DOCUMENTS]
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
        <span>{selected.images?.length ? `${selected.images.length} ${selected.images.length === 1 ? 'page' : 'pages'}` : 'Full source text'}</span>
      </div>

      <header className="process-document-reader-heading">
        <p className="eyebrow">{selected.sourceType === 'redacted-transcription' ? 'Agent reference · source text' : 'Original source pages'}</p>
        <h1>{selected.title}</h1>
        <p>{selected.purpose}</p>
        <div className="process-document-meta">
          <span>{categoryLabels[selected.category] || selected.category}</span>
          <span>{selected.images?.length ? `${selected.images.length} source ${selected.images.length === 1 ? 'page' : 'pages'}` : selected.sourceType === 'redacted-transcription' ? 'Restricted contact redacted' : 'Complete source text'}</span>
        </div>
      </header>

      {selected.sourceDisclosure && <p className="process-document-source-disclosure" role="note">{selected.sourceDisclosure}</p>}
      {selected.referenceView === 'flex_hub' && <button className="process-document-back" type="button" onClick={() => onOpenReference('flex_hub')}>Open guided Flex Arbitration Hub reference →</button>}
      <div className="process-document-pages">
        {(selected.images?.length > 0 ? selected.images : []).map((image, index) => <figure key={image} className="process-document-page">
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
        {!selected.images?.length && selected.sourceText && <article className="process-document-page process-document-text-page">
          <p><strong>{selected.sourceType === 'redacted-transcription' ? 'Agent reference source text (restricted contact withheld)' : 'Complete approved source text'}</strong> — {selected.sourceType === 'redacted-transcription' ? 'The operational content is retained; one confidential contact is intentionally redacted. Original Word page layout is not reproduced.' : 'the original document wording is preserved. Page layout and branding are not reproduced in this text view.'}</p>
          <div className="process-document-transcription">{selected.sourceText}</div>
        </article>}
      </div>
    </section>
  }

  return <section className="process-documents-view" aria-label="Process Documents">
    <header className="process-documents-heading">
      <div>
        <p className="eyebrow">Knowledge · Source library</p>
        <h1>Process Documents</h1>
        <p>Find original Process Guide sources and supporting agent reference documents together. Open a document by title; visual pages are shown when available, otherwise the source text is displayed.</p>
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
          <span>{process.images?.length ? `${process.images.length} ${process.images.length === 1 ? 'page' : 'pages'}` : process.sourceType === 'redacted-transcription' ? 'Source text · redacted' : 'Full source text'}</span>
          <b>Open document →</b>
        </span>
      </button>)}
    </div> : <div className="process-document-empty">
      <h2>No process document found</h2>
      <p>Try another process title or support area.</p>
    </div>}
  </section>
}
