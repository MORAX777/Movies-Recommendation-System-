import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // This tells Vite to listen on all addresses
    port: 5173,  // This forces port 5173
  }
})