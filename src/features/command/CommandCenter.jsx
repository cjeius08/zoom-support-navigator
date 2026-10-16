import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useDialogFocus } from '../../lib/useDialogFocus'
import { commandResults } from './commandSearch'

const ROLE_CHOICES = [
  { value: 'Host', label: 'Host / Arbitrator' },
  { value: 'Participant', label: 'Participant' },
]

export function CommandCenter({
  isAdmin = false,
  initialRole = 'Host',
  onClose = () => {},
  onSelect = () => {},
}) {
  const [query, setQuery] = useState('')
  const [role, setRole] = useState(initialRole === 'Participant' ? 'Participant' : 'Host')
  const [active, setActive] = useState(0)
  const dialogRef = useRef(null)
  const inputRef = useRef(null)
  const listId = useId()
  const results = useMemo(() => commandResults(query, { role, isAdmin }), [query, role, isAdmin])
  useDialogFocus(dialogRef, true, onClose)

  useEffect(() => { inputRef.current?.focus() }, [])

  function select(item) {
    onSelect(item)
    onClose()
  }

  function onKeys(event) {
    if (event.key === 'ArrowDown' && results.length) {
      event.preventDefault()
      setActive(current => (current + 1) % results.length)
    } else if (event.key === 'ArrowUp' && results.length) {
      event.preventDefault()
      setActive(current => (current - 1 + results.length) % results.length)
    } else if (event.key === 'Enter' && results[active]) {
      event.preventDefault()
      select(results[active])
    }
  }

  return <div className="command-backdrop" onMouseDown={event => {
    if (event.target === event.currentTarget) onClose()
  }}>
    <section ref={dialogRef} className="command-dialog" role="dialog" aria-modal="true" aria-labelledby="command-title" tabIndex={-1}>
      <div className="command-topline">
        <div>
          <p className="command-eyebrow">OZZIE COMMAND CENTER</p>
          <h2 id="command-title">Find anything in Ozzie</h2>
        </div>
        <button type="button" className="command-close" onClick={onClose} aria-label="Close Command Center">Esc <span aria-hidden="true">×</span></button>
      </div>
      <div className="command-searchline">
        <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>
        <input
          ref={inputRef}
          type="search"
          aria-label="Search Ozzie commands and approved guides"
          role="combobox"
          aria-expanded="true"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-activedescendant={results[active] ? `${listId}-result-${active}` : undefined}
          placeholder="Search a symptom, FAQ, guide, or page…"
          autoComplete="off"
          value={query}
          onChange={event => { setQuery(event.target.value); setActive(0) }}
          onKeyDown={onKeys}
        />
        <span className="command-shortcut" aria-hidden="true">Ctrl K</span>
      </div>
      <div className="command-context">
        <span>Find support content for:</span>
        <div className="command-roles" role="group" aria-label="Caller role for search">
          {ROLE_CHOICES.map(choice => <button key={choice.value} type="button" aria-pressed={role === choice.value}
            onClick={() => { setRole(choice.value); setActive(0) }}>{choice.label}</button>)}
        </div>
      </div>
      <div className="command-results-head">
        <strong>{query.trim() ? 'Matches in approved sources & tools' : 'Quick access'}</strong>
        <span>{results.length} {results.length === 1 ? 'result' : 'results'}</span>
      </div>
      <div className="command-results" id={listId} role="listbox" aria-label="Command Center results">
        {results.length ? results.map((item,index) => <button
          id={`${listId}-result-${index}`}
          key={`${item.kind}:${item.id}`}
          type="button"
          role="option"
          aria-selected={active === index}
          className={`command-result ${active === index ? 'command-result-active' : ''}`}
          onMouseEnter={() => setActive(index)}
          onClick={() => select(item)}
        >
          <span className="command-result-icon" aria-hidden="true">{item.kind === 'page' ? '▦' : item.kind === 'faq' ? '?' : item.kind === 'process' ? '≡' : '↗'}</span>
          <span className="command-result-content"><strong>{item.title}</strong><small>{item.description}</small></span>
          <span className="command-result-meta"><span>{item.category}</span><span aria-hidden="true">↗</span></span>
        </button>) : <div className="command-empty" role="status">
          <strong>No approved matches found.</strong>
          <p>Try another phrase or switch caller role. Ozzie only shows verified support references here.</p>
        </div>}
      </div>
      <footer className="command-footer">
        <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate <kbd>Enter</kbd> Open</span>
        <span><kbd>Esc</kbd> Close</span>
      </footer>
    </section>
  </div>
}
