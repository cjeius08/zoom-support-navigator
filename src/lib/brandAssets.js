import { assetUrl } from './assetUrl'

// Shared Ozzie branding approved on 2026-10-16 (Batch 12).
// Full lockup uses the user's first-photo owl, navy wordmark, and FOR OGLETREE subtitle.
// The legacy owl-only asset remains the browser favicon until its matching replacement is reviewed.
export const OZZIE_BRAND = Object.freeze({
  full: 'assets/ozzie-for-ogletree-2026.svg',
  owl: 'assets/ozzie-official-owl.png',
  favicon: 'assets/ozzie-official-favicon.png',
  fullAlt: 'Ozzie for Ogletree',
  owlAlt: 'Ozzie owl',
})

export function ozzieBrandSrc(variant = 'full') {
  if (variant !== 'full' && variant !== 'owl' && variant !== 'favicon') {
    throw new Error('Unsupported Ozzie logo variant')
  }
  return assetUrl(OZZIE_BRAND[variant])
}
