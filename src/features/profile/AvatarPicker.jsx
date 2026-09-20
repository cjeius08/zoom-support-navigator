import { useRef, useState } from 'react'
import { getBundledAvatarRecords } from './avatarCatalog'

export function AvatarPicker({ selectedId, onSave, onCancel, avatars = getBundledAvatarRecords() }) {
  const [selected, setSelected] = useState(avatars.some(avatar => avatar.id === selectedId) ? selectedId : avatars[0]?.id)
  const optionRefs = useRef([])

  function selectAt(index, { focus = false } = {}) {
    const normalizedIndex = (index + avatars.length) % avatars.length
    const id = avatars[normalizedIndex]?.id
    setSelected(id)
    if (focus) optionRefs.current[normalizedIndex]?.focus()
  }

  function handleKeyDown(event, index) {
    let nextIndex = null
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = index + 1
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = index - 1
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = avatars.length - 1
    if (nextIndex === null || !avatars.length) return
    event.preventDefault()
    selectAt(nextIndex, { focus: true })
  }

  return <section className="avatar-picker" aria-labelledby="avatar-picker-title">
    <h2 id="avatar-picker-title">Choose an avatar</h2>
    {!avatars.length && <p role="status">No avatars are currently available.</p>}
    <div className="avatar-grid" role="radiogroup" aria-label="Choose an avatar">
      {avatars.map((avatar, index) => {
        const active = selected === avatar.id
        return <button
          key={avatar.id}
          ref={element => { optionRefs.current[index] = element }}
          type="button"
          role="radio"
          aria-label={avatar.id}
          aria-checked={active}
          tabIndex={active ? 0 : -1}
          onKeyDown={event => handleKeyDown(event, index)}
          onClick={() => setSelected(avatar.id)}
        >
          <img loading="lazy" src={avatar.src} alt="" />
          {active && <span className="avatar-selected-indicator" aria-hidden="true">✓</span>}
        </button>
      })}
    </div>
    <div className="dialog-actions">
      <button type="button" onClick={onCancel}>Cancel</button>
      <button type="button" onClick={() => onSave(selected)} disabled={!selected}>Save Avatar</button>
    </div>
  </section>
}
