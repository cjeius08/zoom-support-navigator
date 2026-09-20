import { useEffect, useRef, useState } from 'react'
import {
  ACCEPTED_AVATAR_TYPES,
  deleteAvatarIds,
  loadAvatarLibrary,
  uploadAvatarFiles,
  validateAvatarFile,
} from '../../lib/avatarLibraryApi'

function previewUrl(file) {
  return typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
    ? URL.createObjectURL(file)
    : ''
}

function pluralize(count, singular, plural = `${singular}s`) {
  return count === 1 ? singular : plural
}

function UploadPreview({ title, files, urls }) {
  if (!files.length) return null
  return <section className="avatar-upload-preview" aria-label={`${title} preview`}>
    <strong>{title}</strong>
    <div className="avatar-upload-preview-grid">
      {files.map((file, index) => <article key={`${file.name}-${file.lastModified}-${index}`}>
        {urls[index] ? <img src={urls[index]} alt="" /> : <span className="avatar-upload-preview-fallback">IMG</span>}
        <span>{file.name}</span>
      </article>)}
    </div>
  </section>
}

function ConfirmDeleteDialog({ ids, busy, onCancel, onConfirm }) {
  const isBatch = ids.length > 1
  return <div className="modal-backdrop" role="presentation">
    <div className="profile-panel admin-dialog avatar-delete-dialog" role="dialog" aria-modal="true" aria-labelledby="avatar-delete-title">
      <h2 id="avatar-delete-title">{isBatch ? `Delete ${ids.length} selected avatars?` : 'Delete this avatar?'}</h2>
      <p>This will permanently remove {isBatch ? 'the selected avatars' : 'this avatar'} from the Avatar Library.</p>
      <div className="dialog-actions">
        <button type="button" onClick={onCancel} disabled={busy}>Cancel</button>
        <button type="button" className="danger-action" onClick={onConfirm} disabled={busy}>
          {busy ? 'Deleting…' : isBatch ? `Delete ${ids.length} Avatars` : 'Delete'}
        </button>
      </div>
    </div>
  </div>
}

export function AvatarLibraryManagement({ isAdmin, onChanged }) {
  const [avatars, setAvatars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [singleFile, setSingleFile] = useState(null)
  const [singlePreview, setSinglePreview] = useState('')
  const [batchFiles, setBatchFiles] = useState([])
  const [batchPreviews, setBatchPreviews] = useState([])
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [confirmIds, setConfirmIds] = useState(null)
  const [busy, setBusy] = useState('')
  const busyRef = useRef(false)

  async function refresh() {
    setLoading(true)
    try {
      const records = await loadAvatarLibrary()
      setAvatars(records)
      setSelectedIds(current => new Set([...current].filter(id => records.some(record => record.id === id))))
      setError('')
    } catch (loadError) {
      setError(loadError?.message || 'Unable to load the Avatar Library.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) refresh()
  }, [isAdmin])

  useEffect(() => () => {
    if (singlePreview) URL.revokeObjectURL?.(singlePreview)
    batchPreviews.forEach(url => URL.revokeObjectURL?.(url))
  }, [batchPreviews, singlePreview])

  if (!isAdmin) return <section className="console-view"><p role="alert">Admin access required.</p></section>

  function setSingleSelection(file) {
    if (singlePreview) URL.revokeObjectURL?.(singlePreview)
    const validationError = validateAvatarFile(file)
    if (validationError) {
      setSingleFile(null)
      setSinglePreview('')
      setError(validationError)
      return
    }
    setError('')
    setStatus('')
    setSingleFile(file)
    setSinglePreview(previewUrl(file))
  }

  function setBatchSelection(files) {
    batchPreviews.forEach(url => URL.revokeObjectURL?.(url))
    const validFiles = []
    const invalidFiles = []
    files.forEach(file => {
      const validationError = validateAvatarFile(file)
      if (validationError) invalidFiles.push(`${file.name}: ${validationError}`)
      else validFiles.push(file)
    })
    setBatchFiles(validFiles)
    setBatchPreviews(validFiles.map(previewUrl))
    setStatus('')
    setError(invalidFiles.length ? invalidFiles.join(' ') : '')
  }

  async function upload(files, mode) {
    if (busyRef.current || !files.length) return
    busyRef.current = true
    setBusy(mode)
    setError('')
    setStatus('')
    try {
      const result = await uploadAvatarFiles(files)
      const uploadedCount = result?.uploaded?.length || 0
      const failedCount = result?.failed?.length || 0
      if (failedCount) {
        setStatus(`${uploadedCount} ${pluralize(uploadedCount, 'avatar')} uploaded successfully. ${failedCount} failed.`)
      } else if (uploadedCount === 1) {
        setStatus('Avatar uploaded successfully.')
      } else {
        setStatus(`${uploadedCount} avatars uploaded successfully.`)
      }
      if (result?.failed?.length) setError(result.failed.map(item => `${item.name}: ${item.error}`).join(' '))
      if (mode === 'single') {
        setSingleFile(null)
        if (singlePreview) URL.revokeObjectURL?.(singlePreview)
        setSinglePreview('')
      } else {
        setBatchFiles([])
        batchPreviews.forEach(url => URL.revokeObjectURL?.(url))
        setBatchPreviews([])
      }
      await refresh()
      await onChanged?.()
    } catch (uploadError) {
      setError(uploadError?.message || 'Upload failed. Please try again.')
    } finally {
      busyRef.current = false
      setBusy('')
    }
  }

  async function confirmDeletion() {
    if (busyRef.current || !confirmIds?.length) return
    busyRef.current = true
    setBusy('delete')
    setError('')
    setStatus('')
    try {
      const result = await deleteAvatarIds(confirmIds)
      const deletedCount = result?.deleted?.length || 0
      const failedCount = result?.failed?.length || 0
      setStatus(failedCount
        ? `${deletedCount} ${pluralize(deletedCount, 'avatar')} deleted successfully. ${failedCount} failed.`
        : `${deletedCount} ${pluralize(deletedCount, 'avatar')} deleted successfully.`)
      if (failedCount) setError('Unable to delete selected avatars. Please try again.')
      setSelectedIds(current => new Set([...current].filter(id => !confirmIds.includes(id))))
      setConfirmIds(null)
      await refresh()
      await onChanged?.()
    } catch (deleteError) {
      setError(deleteError?.message || 'Unable to delete selected avatars.')
    } finally {
      busyRef.current = false
      setBusy('')
    }
  }

  const selectedCount = selectedIds.size
  const allSelected = avatars.length > 0 && selectedCount === avatars.length

  return <section className="console-view avatar-library-management" aria-labelledby="avatar-library-title">
    <div className="view-heading">
      <div>
        <p className="eyebrow">Admin only</p>
        <h1 id="avatar-library-title">Avatar Library</h1>
        <p>Add or remove available profile avatars without changing existing user accounts.</p>
      </div>
    </div>

    {error && <p role="alert">{error}</p>}
    {status && <p className="success-message" role="status">{status}</p>}

    <div className="avatar-library-upload-panel">
      <div className="avatar-library-upload-group">
        <h2>Upload Avatar</h2>
        <label className="avatar-file-picker">
          Choose one image
          <input
            type="file"
            accept={ACCEPTED_AVATAR_TYPES.join(',')}
            aria-label="Upload Avatar file"
            onChange={event => setSingleSelection(event.target.files?.[0] || null)}
            disabled={Boolean(busy)}
          />
        </label>
        <UploadPreview title="Selected image" files={singleFile ? [singleFile] : []} urls={singlePreview ? [singlePreview] : []} />
        <button type="button" className="primary-action" onClick={() => upload(singleFile ? [singleFile] : [], 'single')} disabled={!singleFile || Boolean(busy)}>
          {busy === 'single' ? 'Uploading…' : 'Upload Avatar'}
        </button>
      </div>

      <div className="avatar-library-upload-group">
        <h2>Upload Multiple Avatars</h2>
        <label className="avatar-file-picker">
          Choose multiple images
          <input
            type="file"
            accept={ACCEPTED_AVATAR_TYPES.join(',')}
            aria-label="Upload Multiple Avatars files"
            multiple
            onChange={event => setBatchSelection([...event.target.files || []])}
            disabled={Boolean(busy)}
          />
        </label>
        <UploadPreview title={`${batchFiles.length} selected`} files={batchFiles} urls={batchPreviews} />
        <button type="button" className="primary-action" onClick={() => upload(batchFiles, 'batch')} disabled={!batchFiles.length || Boolean(busy)}>
          {busy === 'batch' ? 'Uploading…' : 'Upload Multiple Avatars'}
        </button>
      </div>
    </div>

    <section className="avatar-library-panel" aria-labelledby="avatar-library-list-title">
      <div className="avatar-library-toolbar">
        <div>
          <h2 id="avatar-library-list-title">Available avatars</h2>
          <span>{avatars.length} {pluralize(avatars.length, 'avatar')} available</span>
        </div>
        <div className="avatar-library-actions">
          <button type="button" onClick={() => setSelectedIds(new Set(avatars.map(avatar => avatar.id)))} disabled={!avatars.length || allSelected || Boolean(busy)}>Select All</button>
          <button type="button" onClick={() => setSelectedIds(new Set())} disabled={!selectedCount || Boolean(busy)}>Clear Selection</button>
          {selectedCount > 0 && <button type="button" className="danger-action" onClick={() => setConfirmIds([...selectedIds])} disabled={Boolean(busy)}>Delete Selected ({selectedCount})</button>}
        </div>
      </div>
      <p className="avatar-selection-count" aria-live="polite">{selectedCount} {pluralize(selectedCount, 'avatar')} selected</p>

      {loading ? <p>Loading Avatar Library…</p> : <div className="avatar-library-grid">
        {avatars.map(avatar => <article className="avatar-library-card" key={avatar.id}>
          <label className="avatar-library-checkbox">
            <input type="checkbox" checked={selectedIds.has(avatar.id)} onChange={() => setSelectedIds(current => {
              const next = new Set(current)
              if (next.has(avatar.id)) next.delete(avatar.id)
              else next.add(avatar.id)
              return next
            })} disabled={Boolean(busy)} aria-label={`Select ${avatar.id}`} />
            <span className="sr-only">Select {avatar.id}</span>
          </label>
          <img src={avatar.src} alt="" loading="lazy" />
          <span className="avatar-library-card-id">{avatar.id}</span>
          <button type="button" className="danger-action" onClick={() => setConfirmIds([avatar.id])} disabled={Boolean(busy)} aria-label={`Delete ${avatar.id}`}>Delete</button>
        </article>)}
      </div>}
    </section>

    {confirmIds && <ConfirmDeleteDialog ids={confirmIds} busy={busy === 'delete'} onCancel={() => setConfirmIds(null)} onConfirm={confirmDeletion} />}
  </section>
}
