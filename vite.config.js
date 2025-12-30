import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/sg-hr-assistant/",
  server: {
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
})
