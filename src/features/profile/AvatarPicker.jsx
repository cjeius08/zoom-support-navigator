import { useState } from 'react'
import { AVATAR_IDS, avatarUrl } from './avatarCatalog'

export function AvatarPicker({ selectedId, onSave, onCancel }) {
  const [selected, setSelected] = useState(AVATAR_IDS.includes(selectedId) ? selectedId : AVATAR_IDS[0])
  return <section className="avatar-picker" aria-labelledby="avatar-picker-title"><h2 id="avatar-picker-title">Choose an avatar</h2><div className="avatar-grid">{AVATAR_IDS.map(id => <button key={id} type="button" aria-label={id} aria-pressed={selected === id} onClick={() => setSelected(id)}><img loading="lazy" src={avatarUrl(id)} alt="" /></button>)}</div><div className="dialog-actions"><button type="button" onClick={onCancel}>Cancel</button><button type="button" onClick={() => onSave(selected)}>Save Avatar</button></div></section>
}
