// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        // ❌ remove/avoid rewrite here
        // rewrite: (p) => p.replace(/^\/api/, ''),  <-- delete this line if present
      },
    },
  },
})
