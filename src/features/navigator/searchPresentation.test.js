import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { describe, expect, it } from 'vitest'

const accessibilityCss = fs.readFileSync(
  path.join(process.cwd(), 'src/accessibility-ui.css'),
  'utf8',
)

function ruleBody(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = accessibilityCss.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 'm'))
  return match?.[1] ?? ''
}

describe('search suggestion presentation', () => {
  it('allows the suggestion list to escape the hero and layer above following content', () => {
    const searchCardRule = ruleBody('.smart-search-card')
    expect(searchCardRule).toMatch(/overflow\s*:\s*visible/)
    expect(searchCardRule).toMatch(/position\s*:\s*relative/)
    expect(searchCardRule).toMatch(/z-index\s*:\s*[1-9]\d*/)
  })

  it('keeps the suggestion list positioned as an overlay below the search field', () => {
    const suggestionsRule = ruleBody('.search-suggestions')
    expect(suggestionsRule).toMatch(/position\s*:\s*absolute/)
    expect(suggestionsRule).toMatch(/top\s*:\s*calc\(100%\s*\+/)
    expect(suggestionsRule).toMatch(/z-index\s*:\s*[1-9]\d*/)
  })
})
