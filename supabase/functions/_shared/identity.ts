export const normalizeUsername = (value: string) => value.trim().toLowerCase()
export const normalizeInitials = (value: string) => value.trim().toUpperCase()
export const validUsername = (value: string) => /^[a-z0-9_]{3,}$/.test(normalizeUsername(value))
export const validInitials = (value: string) => /^[A-Z]{2,3}$/.test(normalizeInitials(value))
export const validPassword = (value: string) => value.length >= 8

export async function hashInvite(code: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code))
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}
