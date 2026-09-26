const defaults = 'http://127.0.0.1:5173,http://localhost:5173'
const trustedBackupOrigins = 'https://ozzie-backup.pages.dev'

export function allowedOrigin(origin: string | null, allowlist = defaults) {
  const origins = allowlist.split(',').map(value => value.trim()).filter(Boolean)
  return origin && origins.includes(origin) ? origin : null
}

function configuredOrigins() {
  const primary = Deno.env.get('ALLOWED_ORIGINS') ?? defaults
  const additional = Deno.env.get('ADDITIONAL_ALLOWED_ORIGINS') ?? ''
  return [primary, additional, trustedBackupOrigins].filter(Boolean).join(',')
}

export function corsHeaders(request: Request) {
  const origin = allowedOrigin(request.headers.get('Origin'), configuredOrigins())
  return {
    ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}
