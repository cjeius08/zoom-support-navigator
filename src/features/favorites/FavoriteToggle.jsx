export function FavoriteToggle({
  active = false,
  busy = false,
  compact = false,
  label = 'resource',
  className = '',
  onToggle = () => {},
}) {
  const action = active ? 'Remove from Favorites' : 'Add to Favorites'

  return <button
    type="button"
    className={`favorite-toggle${active ? ' is-favorite' : ''}${compact ? ' favorite-toggle-compact' : ''}${className ? ` ${className}` : ''}`}
    aria-pressed={active}
    aria-label={action}
    title={`${action}: ${label}`}
    disabled={busy}
    onClick={event => {
      event.stopPropagation()
      onToggle?.()
    }}
  >
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 3.4 14.6 8.7l5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.2-4.1 5.8-.8L12 3.4Z"
        fill={active ? 'currentColor' : 'none'}
      />
    </svg>
    {!compact && <span>{busy ? 'Saving…' : active ? 'Saved' : 'Save'}</span>}
  </button>
}
