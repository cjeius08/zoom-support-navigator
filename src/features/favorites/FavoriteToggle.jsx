import { OzzieBrandImage } from '../../components/OzzieBrandImage'

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
    <OzzieBrandImage variant="owl" className="favorite-ozzie-mark" alt="" aria-hidden="true" draggable={false} />
    {!compact && <span>{busy ? 'Saving…' : active ? 'Saved' : 'Save'}</span>}
  </button>
}
