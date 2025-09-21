import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward API calls during dev to Spring Boot backend
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // If backend already serves under /api, just proxy as-is;
        // if not, rewrite: path => path.replace(/^\/api/, '')
      },
    },
  },
})
