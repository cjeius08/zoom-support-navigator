import { defineConfig } from 'vite'
import process from 'node:process'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.VITE_BASE || '/zoom-support-navigator/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    css: true,
  },
})
