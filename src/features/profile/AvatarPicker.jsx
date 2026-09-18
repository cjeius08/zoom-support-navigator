import { useRef, useState } from 'react'
import { AVATAR_IDS, avatarUrl } from './avatarCatalog'

export function AvatarPicker({ selectedId, onSave, onCancel }) {
  const [selected, setSelected] = useState(AVATAR_IDS.includes(selectedId) ? selectedId : AVATAR_IDS[0])
  const optionRefs = useRef([])

  function selectAt(index, { focus = false } = {}) {
    const normalizedIndex = (index + AVATAR_IDS.length) % AVATAR_IDS.length
    const id = AVATAR_IDS[normalizedIndex]
    setSelected(id)
    if (focus) optionRefs.current[normalizedIndex]?.focus()
  }

  function handleKeyDown(event, index) {
    let nextIndex = null
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = index + 1
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = index - 1
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = AVATAR_IDS.length - 1
    if (nextIndex === null) return
    event.preventDefault()
    selectAt(nextIndex, { focus: true })
  }

  return <section className="avatar-picker" aria-labelledby="avatar-picker-title">
    <h2 id="avatar-picker-title">Choose an avatar</h2>
    <div className="avatar-grid" role="radiogroup" aria-label="Choose an avatar">
      {AVATAR_IDS.map((id, index) => {
        const active = selected === id
        return <button
          key={id}
          ref={element => { optionRefs.current[index] = element }}
          type="button"
          role="radio"
          aria-label={id}
          aria-checked={active}
          tabIndex={active ? 0 : -1}
          onKeyDown={event => handleKeyDown(event, index)}
          onClick={() => setSelected(id)}
        >
          <img loading="lazy" src={avatarUrl(id)} alt="" />
          {active && <span className="avatar-selected-indicator" aria-hidden="true">✓</span>}
        </button>
      })}
    </div>
    <div className="dialog-actions">
      <button type="button" onClick={onCancel}>Cancel</button>
      <button type="button" onClick={() => onSave(selected)}>Save Avatar</button>
    </div>
  </section>
}
