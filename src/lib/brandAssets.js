import { assetUrl } from './assetUrl'

// Official artwork approved on 2026-10-15. Brand variants must use these paths;
// retain the original owl artwork and 'OGLETREE SUPPORT WORKSPACE' lettering.
export const OZZIE_BRAND = Object.freeze({
  full: 'assets/ozzie-official-full.png',
  owl: 'assets/ozzie-official-owl.png',
  favicon: 'assets/ozzie-official-favicon.png',
  fullAlt: 'Ozzie — Ogletree Support Workspace',
  owlAlt: 'Ozzie owl',
})

export function ozzieBrandSrc(variant = 'full') {
  if (variant !== 'full' && variant !== 'owl' && variant !== 'favicon') {
    throw new Error('Unsupported Ozzie logo variant')
  }
  return assetUrl(OZZIE_BRAND[variant])
}
