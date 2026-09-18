import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { expect, it } from 'vitest'

function read(path) {
  return readFileSync(join(cwd(), path), 'utf8')
}

it('keeps a visible keyboard focus indicator on interactive controls', () => {
  const css = read('src/styles.css')
  expect(css).toMatch(/button:focus-visible,[\s\S]*?input:focus-visible,[\s\S]*?select:focus-visible,[\s\S]*?textarea:focus-visible,[\s\S]*?a:focus-visible\s*\{[^}]*outline:\s*3px\s+solid/)
  expect(css).toMatch(/outline-offset:\s*3px/)
})

it('protects narrow and zoomed layouts from horizontal loss of core actions', () => {
  const baseCss = read('src/styles.css')
  const responsiveCss = read('src/features/shell/responsiveShell.css')

  expect(responsiveCss).toMatch(/\.app-main\s*\{[^}]*min-width:\s*0[^}]*overflow-x:\s*clip/)
  expect(responsiveCss).toMatch(/@media\s*\(max-width:\s*620px\)[\s\S]*?\.category-grid\s*\{[^}]*grid-template-columns:\s*1fr/)
  expect(responsiveCss).toMatch(/@media\s*\(max-width:\s*620px\)[\s\S]*?\.agent-workflow ol\s*\{[^}]*grid-template-columns:\s*1fr/)
  expect(responsiveCss).toMatch(/@media\s*\(max-width:\s*800px\)[\s\S]*?\.sidebar\s*\{[^}]*width:\s*min\(17\.5rem,\s*calc\(100vw\s*-\s*1\.2rem\)\)/)
  expect(responsiveCss).toMatch(/@media\s*\(max-width:\s*620px\)[\s\S]*?\.feedback-fab\s*\{[^}]*max-width:\s*calc\(100vw\s*-\s*1\.5rem\)/)
  expect(baseCss).toMatch(/@media\s*\(max-width:\s*700px\)[\s\S]*?\.process-drawer\s*\{[^}]*width:\s*100vw/)
  expect(baseCss).toMatch(/@media\s*\(max-width:\s*430px\)[\s\S]*?\.usage-summary,[^}]*\.usage-user-row dl\s*\{[^}]*grid-template-columns:\s*1fr/)
})

it('respects reduced-motion preferences across the console', () => {
  const accessibilityCss = read('src/accessibility-ui.css')
  const responsiveCss = read('src/features/shell/responsiveShell.css')

  expect(accessibilityCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?scroll-behavior:\s*auto\s*!important/)
  expect(accessibilityCss).toMatch(/animation-duration:\s*\.01ms\s*!important/)
  expect(accessibilityCss).toMatch(/transition-duration:\s*\.01ms\s*!important/)
  expect(responsiveCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.sidebar\s*\{[^}]*transition:\s*none/)
})

it('keeps search suggestions visible and scrollable instead of clipping under the hero', () => {
  const css = read('src/accessibility-ui.css')
  expect(css).toMatch(/\.hero\s*\{[^}]*overflow:\s*visible/)
  expect(css).toMatch(/\.search-suggestions\s*\{[^}]*z-index:\s*60[^}]*max-height:\s*23rem[^}]*overflow-y:\s*auto/)
})
