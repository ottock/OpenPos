import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Self-contained: unlike a service that shares a root .env with a backend,
// this template has no required env vars. Override host/port via
// FRONTEND_HOST / FRONTEND_PORT in a local .env if needed.
export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'FRONTEND_'],
  server: {
    host: 'localhost',
    port: 5173,
  },
})
