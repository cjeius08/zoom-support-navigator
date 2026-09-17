import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { expect, it } from 'vitest'

it('runs the production Pages workflow on a Node version supported by current Supabase packages', () => {
  const workflow = readFileSync(join(cwd(), '.github/workflows/deploy-pages.yml'), 'utf8')
  expect(workflow).toMatch(/node-version:\s*(?:22|24)/)
  expect(workflow).not.toMatch(/node-version:\s*20/)
})
