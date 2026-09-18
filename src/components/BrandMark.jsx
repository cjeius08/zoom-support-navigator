import { assetUrl } from '../lib/assetUrl'

export function BrandMark({ variant = 'header', className = '' }) {
  const classes = ['brand-mark', `brand-mark-${variant}`, className].filter(Boolean).join(' ')
  return <img className={classes} src={assetUrl('assets/ogcon-logo.png')} alt="OGCon" />
}
