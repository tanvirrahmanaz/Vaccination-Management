const rawApiBase = (import.meta.env.VITE_API_BASE || '').trim()

export const appConfig = {
  apiBase: rawApiBase || 'http://127.0.0.1:8000',
  requireAuth: true,
}
export const isAuthRequired = true
