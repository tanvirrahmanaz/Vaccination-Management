const rawApiBase = (import.meta.env.VITE_API_BASE || '').trim()

const rawRequireAuth = String(import.meta.env.VITE_REQUIRE_AUTH ?? '').trim().toLowerCase()
const requireAuth = rawRequireAuth
  ? !['false', '0', 'no', 'off'].includes(rawRequireAuth)
  : true

export const appConfig = {
  apiBase: rawApiBase || 'http://127.0.0.1:8000',
  requireAuth,
}
export const isAuthRequired = appConfig.requireAuth
