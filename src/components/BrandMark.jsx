export function BrandMark({ variant = 'header', className = '' }) {
  const classes = ['brand-mark', `brand-mark-${variant}`, className].filter(Boolean).join(' ')
  return <span className={classes} aria-label="Ogletree Support Workspace">
    <span className="brand-mark-client">Ogletree</span>
    <strong>Support Workspace</strong>
  </span>
}
