/* eslint-env node */
import { cwd } from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), '')

  const parsePort = (value, fallback) => {
    const numeric = Number(value)
    return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback
  }

  const serverHost = env.VITE_DEV_SERVER_HOST || env.VITE_HOST || '127.0.0.1'
  const serverPort = parsePort(env.VITE_DEV_SERVER_PORT || env.VITE_PORT, 5173)
  const previewPort = parsePort(env.VITE_PREVIEW_PORT, 4173)

  return {
    plugins: [react()],
    server: {
      host: serverHost,
      port: serverPort,
    },
    preview: {
      host: serverHost,
      port: previewPort,
    },
  }
})
