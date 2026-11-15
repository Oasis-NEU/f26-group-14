import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Settings for `npm test` (Vitest). See docs/workflow/testing.md.
  test: {
    environment: 'jsdom', // a fake browser, so components can render without opening Chrome
    setupFiles: './src/test/setup.js', // runs before every test file
  },
})
