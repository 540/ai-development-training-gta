import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { gtaApi } from './api/plugin'

export default defineConfig({
  plugins: [react(), gtaApi()],
})
