import { useCallback, useEffect, useRef, useState } from 'react'
import { avatarUrl } from '../profile/avatarCatalog'
import { deleteAvatarIds, loadAvatarLibrary, uploadAvatarFiles } from '../../lib/avatarAdminApi'
import './avatarLibrary.css'

export function AvatarLibrary({ isAdmin = false }) {
  const [avatars, setAvatars] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const singleInputRef = useRef(null)
  const batchInputRef = useRef(null)

  const refresh = useCallback(async () => {
    if (!isAdmin) return
    setLoading(true)
    setError('')
    try {
      setAvatars(await loadAvatarLibrary())
    } catch (loadError) {
      setError(loadError?.message || 'Could not load the avatar library.')
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    refresh()
  }, [refresh])

  if (!isAdmin) {
    return <section className="console-view"><h1>Avatar Library</h1><p role="alert">Admin access is required.</p></section>
  }

  async function handleUpload(fileList) {
    const files = Array.from(fileList || [])
    if (!files.length || busy) return
    setBusy(true)
    setMessage('')
    setError('')
    try {
      const uploaded = await uploadAvatarFiles(files)
      setMessage(`${uploaded.length} avatar${uploaded.length === 1 ? '' : 's'} uploaded successfully.`)
      await refresh()
    } catch (uploadError) {
      setError(uploadError?.message || 'Avatar upload failed.')
    } finally {
      setBusy(false)
      if (singleInputRef.current) singleInputRef.current.value = ''
      if (batchInputRef.current) batchInputRef.current.value = ''
    }
  }

  async function remove(ids) {
    if (!ids.length || busy) return
    const label = ids.length === 1 ? 'this avatar' : `these ${ids.length} avatars`
    if (!window.confirm(`Delete ${label}? If an avatar is currently in use, that user will fall back to their initials.`)) return

    setBusy(true)
    setMessage('')
    setError('')
    try {
      const result = await deleteAvatarIds(ids)
      setSelected(new Set())
      await refresh()
      const deletedCount = result.deletedIds.length
      setMessage(`${deletedCount} avatar${deletedCount === 1 ? '' : 's'} deleted.${result.cleanupWarning ? ` ${result.cleanupWarning}` : ''}`)
    } catch (deleteError) {
      setError(deleteError?.message || 'Avatar deletion failed.')
    } finally {
      setBusy(false)
    }
  }

  function toggleSelected(id) {
    setSelected(current => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allSelected = avatars.length > 0 && selected.size === avatars.length

  return <section className="console-view avatar-library-page">
    <div className="view-heading avatar-library-heading">
      <div>
        <p className="eyebrow">Admin only</p>
        <h1>Avatar Library</h1>
        <p>Upload or delete avatars one at a time or in batches. Deleted avatars disappear from the user picker immediately.</p>
      </div>
      <div className="avatar-upload-actions" aria-label="Avatar upload options">
        <input
          ref={singleInputRef}
          className="visually-hidden"
          type="file"
          accept="image/webp,image/png,image/jpeg"
          onChange={event => handleUpload(event.target.files)}
          disabled={busy}
          aria-label="Upload one avatar"
        />
        <input
          ref={batchInputRef}
          className="visually-hidden"
          type="file"
          multiple
          accept="image/webp,image/png,image/jpeg"
          onChange={event => handleUpload(event.target.files)}
          disabled={busy}
          aria-label="Upload multiple avatars"
        />
        <button type="button" onClick={() => singleInputRef.current?.click()} disabled={busy}>Upload One</button>
        <button type="button" className="primary-action" onClick={() => batchInputRef.current?.click()} disabled={busy}>Upload Multiple</button>
      </div>
    </div>

    <div className="avatar-library-notes">
      <span>WEBP, PNG, or JPG</span>
      <span>Maximum 5 MB per image</span>
      <span>{avatars.length} available avatar{avatars.length === 1 ? '' : 's'}</span>
    </div>

    {message && <p className="success-message" role="status">{message}</p>}
    {error && <p role="alert">{error}</p>}

    <div className="avatar-batch-toolbar">
      <label>
        <input
          type="checkbox"
          checked={allSelected}
          onChange={() => setSelected(allSelected ? new Set() : new Set(avatars.map(item => item.id)))}
          disabled={loading || busy || !avatars.length}
        />
        Select all
      </label>
      <span>{selected.size} selected</span>
      {selected.size > 0 && <button type="button" onClick={() => setSelected(new Set())} disabled={busy}>Clear selection</button>}
      <button
        type="button"
        className="danger-action"
        onClick={() => remove([...selected])}
        disabled={busy || !selected.size}
      >
        Delete Selected{selected.size ? ` (${selected.size})` : ''}
      </button>
    </div>

    {loading ? <p role="status">Loading avatar library…</p> : avatars.length ? (
      <div className="avatar-admin-grid">
        {avatars.map(item => {
          const checked = selected.has(item.id)
          return <article className={`avatar-admin-card ${checked ? 'selected' : ''}`} key={item.id}>
            <label className="avatar-admin-select">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleSelected(item.id)}
                disabled={busy}
                aria-label={`Select ${item.original_filename || item.id}`}
              />
            </label>
            <div className="avatar-admin-preview">
              {avatarUrl(item.id) ? <img loading="lazy" src={avatarUrl(item.id)} alt="" /> : <span className="avatar-fallback">?</span>}
            </div>
            <div className="avatar-admin-meta">
              <strong title={item.original_filename || item.id}>{item.original_filename || item.id}</strong>
              <small>{item.source === 'static' ? 'Built-in avatar' : 'Uploaded avatar'}</small>
            </div>
            <button
              type="button"
              className="avatar-single-delete danger-action"
              disabled={busy}
              onClick={() => remove([item.id])}
              aria-label={`Delete ${item.original_filename || item.id}`}
            >
              Delete
            </button>
          </article>
        })}
      </div>
    ) : (
      <div className="empty-state">
        <h2>No avatars available</h2>
        <p>Upload one avatar or upload a batch to rebuild the library.</p>
      </div>
    )}
  </section>
}
