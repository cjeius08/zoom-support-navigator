import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0'

const url = Deno.env.get('SUPABASE_URL')!
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

export const adminClient = () => createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
export const userClient = (token: string) => createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: `Bearer ${token}` } } })

export async function requireUser(request: Request) {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) throw new Error('UNAUTHORIZED')
  const { data, error } = await userClient(token).auth.getUser()
  if (error || !data.user) throw new Error('UNAUTHORIZED')
  return { token, user: data.user }
}
