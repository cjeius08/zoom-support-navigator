const defaults = 'http://127.0.0.1:5173,http://localhost:5173'

export function allowedOrigin(origin: string | null, allowlist = defaults) {
  const origins = allowlist.split(',').map(value => value.trim()).filter(Boolean)
  return origin && origins.includes(origin) ? origin : null
}

export function corsHeaders(request: Request) {
  const origin = allowedOrigin(request.headers.get('Origin'), Deno.env.get('ALLOWED_ORIGINS') ?? defaults)
  return {
    ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}
