import { corsHeaders } from './cors.ts'

export const json = (body: unknown, status = 200, request?: Request) => new Response(JSON.stringify(body), {
  status,
  headers: { ...(request ? corsHeaders(request) : {}), 'Content-Type': 'application/json' },
})

export const options = (request: Request) => new Response(null, { status: 204, headers: corsHeaders(request) })
