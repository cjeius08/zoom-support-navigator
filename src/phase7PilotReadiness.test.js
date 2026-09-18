import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { cwd } from 'node:process'
import { expect, it } from 'vitest'

const ROOT = cwd()
const PROJECT_REF = 'eefpsujuvwfkpuiejtft'
const PROJECT_URL = `https://${PROJECT_REF}.supabase.co`

function read(path) {
  return readFileSync(join(ROOT, path), 'utf8')
}

function walkFiles(dir) {
  const absolute = join(ROOT, dir)
  return readdirSync(absolute).flatMap(name => {
    const path = join(absolute, name)
    if (statSync(path).isDirectory()) {
      return walkFiles(relative(ROOT, path))
    }
    return [relative(ROOT, path)]
  })
}

it('locks the production browser configuration to Wagmi Support', () => {
  const envExample = read('.env.example')
  const deploy = read('.github/workflows/deploy-pages.yml')
  const client = read('src/lib/supabaseClient.js')

  expect(envExample).toContain(`VITE_SUPABASE_URL=${PROJECT_URL}`)
  expect(deploy).toContain(`VITE_SUPABASE_URL: ${PROJECT_URL}`)
  expect(client).toContain('import.meta.env.VITE_SUPABASE_URL')
  expect(client).toContain('import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY')
})

it('keeps Medify project references out of browser source', () => {
  const browserFiles = walkFiles('src').filter(path => /\.(js|jsx|ts|tsx|css)$/.test(path))
  const offenders = browserFiles.filter(path => /medify/i.test(read(path)))

  expect(offenders).toEqual([])
})

it('keeps privileged Supabase credentials out of browser source', () => {
  const browserFiles = walkFiles('src').filter(path => /\.(js|jsx|ts|tsx)$/.test(path))
  const forbidden = [
    /SUPABASE_SERVICE_ROLE_KEY/i,
    /service[_-]?role[_-]?key/i,
    /sb_secret_[A-Za-z0-9_-]+/,
    /SUPABASE_SECRET_KEY/i,
  ]

  const offenders = browserFiles.filter(path => {
    const source = read(path)
    return forbidden.some(pattern => pattern.test(source))
  })

  expect(offenders).toEqual([])
})

it('keeps the deployment workflow on publishable browser credentials only', () => {
  const deploy = read('.github/workflows/deploy-pages.yml')

  expect(deploy).toContain('VITE_SUPABASE_PUBLISHABLE_KEY:')
  expect(deploy).not.toMatch(/SERVICE_ROLE/i)
  expect(deploy).not.toMatch(/sb_secret_/i)
  expect(deploy).not.toMatch(/SUPABASE_SECRET_KEY/i)
})

it('keeps the Phase 7 pilot plan non-destructive until the disposable-account batch', () => {
  const plan = read('docs/superpowers/plans/2026-09-19-phase7-pilot-rollout.md')

  expect(plan).toContain('Batch 1 — Pilot Readiness Gate')
  expect(plan).toContain('No user-facing feature ships in this batch.')
  expect(plan).toContain('Batch 2 — Disposable Agent Lifecycle Pilot')
  expect(plan).toContain('This batch may mutate only the disposable pilot identity created for the test.')
  expect(plan).toContain('Batch 3 — Controlled Team Pilot')
  expect(plan).toContain('No destructive account testing on the real sample agent.')
})
