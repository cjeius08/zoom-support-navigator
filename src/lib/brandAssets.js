import { assetUrl } from './assetUrl'

// Shared Ozzie branding approved on 2026-10-16 (Batch 12).
// Full lockup uses the user's first-photo owl, navy wordmark, and FOR OGLETREE subtitle.
// Full wordmark and owl-only favicon are sourced from the same approved first-photo artwork.
export const OZZIE_BRAND = Object.freeze({
  full: 'assets/ozzie-for-ogletree-2026.svg',
  owl: 'assets/ozzie-for-ogletree-owl-2026.svg',
  favicon: 'assets/ozzie-for-ogletree-owl-2026.svg',
  fullAlt: 'Ozzie for Ogletree',
  owlAlt: 'Ozzie owl',
})

export function ozzieBrandSrc(variant = 'full') {
  if (variant !== 'full' && variant !== 'owl' && variant !== 'favicon') {
    throw new Error('Unsupported Ozzie logo variant')
  }
  return assetUrl(OZZIE_BRAND[variant])
}
