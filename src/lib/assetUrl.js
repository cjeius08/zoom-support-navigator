export function assetUrl(path, base = import.meta.env.BASE_URL) {
  if (!path) return null
  const cleanBase = `/${String(base || '/').replace(/^\/+|\/+$/g, '')}/`.replace('//', '/')
  return `${cleanBase}${String(path).replace(/^\/+/, '')}`
}
