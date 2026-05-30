import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    threads: false,
    globals: true,
    setupFiles: './tests/setup.js',
  },
})
