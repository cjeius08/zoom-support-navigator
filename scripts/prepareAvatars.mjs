import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { gunzipSync } from 'node:zlib'

const root = process.cwd()
const chunkDir = join(root, 'avatar-payload')
const outputDir = join(root, 'public', 'avatars')
const chunks = readdirSync(chunkDir)
  .filter(name => /^chunk_\d+\.txt$/.test(name))
  .sort()

if (!chunks.length) throw new Error('Avatar payload chunks are missing.')

const encodedPayload = chunks.map(name => readFileSync(join(chunkDir, name), 'utf8').trim()).join('')
const decoded = gunzipSync(Buffer.from(encodedPayload, 'base64')).toString('utf8')
const avatars = JSON.parse(decoded)
const entries = Object.entries(avatars).sort(([a], [b]) => a.localeCompare(b))

if (entries.length !== 103) throw new Error(`Expected 103 avatars, found ${entries.length}.`)

rmSync(outputDir, { recursive: true, force: true })
mkdirSync(outputDir, { recursive: true })

entries.forEach(([name, base64], index) => {
  const expected = `avatar_${String(index + 1).padStart(3, '0')}.webp`
  if (name !== expected) throw new Error(`Unexpected avatar filename: ${name}; expected ${expected}.`)
  writeFileSync(join(outputDir, name), Buffer.from(base64, 'base64'))
})

console.log(`Prepared ${entries.length} avatar assets.`)
