import { OZZIE_BRAND, ozzieBrandSrc } from '../lib/brandAssets'

/** One source of truth for the official full wordmark and owl-only icon. */
export function OzzieBrandImage({ variant = 'full', className, alt, ...imgProps }) {
  const label = alt ?? (variant === 'full' ? OZZIE_BRAND.fullAlt : OZZIE_BRAND.owlAlt)
  return <img {...imgProps} className={className} src={ozzieBrandSrc(variant)} alt={label} />
}
