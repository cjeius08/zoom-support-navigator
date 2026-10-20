import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { expect, it } from 'vitest'

const css = readFileSync(join(cwd(), 'src/features/training/trainingReadability.css'), 'utf8')
const app = readFileSync(join(cwd(), 'src/App.jsx'), 'utf8')
const tokens = readFileSync(join(cwd(), 'src/features/theme/readabilityTokens.css'), 'utf8')

function palette(theme) {
  const section = tokens.match(new RegExp('html\\[data-theme="'+theme+'"\\]\\s*\\{([^}]+)\\}'))
  expect(section, theme + ' token definition').toBeTruthy()
  const colors = {}
  for (const match of section[1].matchAll(/--read-(bg|soft|ink|body|link|selected):\s*(#[a-f0-9]{6})/g)) colors[match[1]] = match[2]
  return colors
}
function luminance(hex) {
  const c = hex.slice(1).match(/.{2}/g).map(c => parseInt(c, 16) / 255)
    .map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4)
  return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]
}
function contrast(a, b) {
  const x = luminance(a), y = luminance(b)
  return (Math.max(x,y) + .05) / (Math.min(x,y) + .05)
}

it.each(['day','night'])('%s training text has 4.5:1 or better contrast on normal and selected cards', theme => {
  const p = palette(theme)
  for (const [foreground, background] of [
    ['ink','bg'], ['ink','soft'], ['ink','selected'],
    ['body','bg'], ['body','soft'], ['link','soft']
  ]) {
    expect(contrast(p[foreground],p[background]),
      theme + ': ' + foreground + ' on ' + background).toBeGreaterThanOrEqual(4.5)
  }
  expect(css).toContain('color: var(--training-ink)')
  expect(css).toContain('color: var(--training-body)')
  expect(css).toContain('background: var(--training-card)')
  expect(css).toContain('background: var(--training-inset)')
})

it('loads the scoped Training & Resources override after every legacy theme and shell CSS', () => {
  expect(app).toContain("import './features/training/trainingReadability.css'")
  expect(app.lastIndexOf("trainingReadability.css")).toBeGreaterThan(app.lastIndexOf('batch12Login.css'))
  expect(css).toContain('.app-shell-horizontal .training-library')
  expect(css).toContain('html:is([data-theme="day"],[data-theme="night"])')
  expect(css).not.toMatch(/font-size:\s*\.[0-6]\d*rem/)
})

it('makes the complete training path legible without modifying content or source navigation', () => {
  for (const selector of [
    '.training-section-tabs button', '.guided-lesson-picker', '.guided-lesson-sources',
    '.guided-flow-stage article', '.guided-lesson-split > article',
    '.guided-takeaways', '.guided-lesson-footer',
    '.device-selector', '.device-walkthrough-section',
    '.device-expected', '.device-platform-notes article',
    '.device-source-list a', '.device-sandbox-launch'
  ]) expect(css).toContain(selector)
  expect(css).toContain('font-size: 1rem !important')
  expect(css).toContain('grid-template-columns:1fr')
  const lessons = readFileSync(join(cwd(), 'src/features/training/GuidedLessons.jsx'), 'utf8')
  const devices = readFileSync(join(cwd(), 'src/features/training/DeviceWalkthroughs.jsx'), 'utf8')
  expect(lessons).toContain('PROCESSES.find(process => process.id === id)')
  expect(devices).toContain('section.steps.map(step')
  expect(devices).toContain('active.sources.map(source')
  expect(css).toContain(':focus-visible')
  expect(contrast('#ffffff','#205b87')).toBeGreaterThanOrEqual(4.5)
})
