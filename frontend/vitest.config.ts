import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
/* @ts-ignore */
// eslint-disable-next-line no-undef
const __dirname = import.meta.dirname || path.dirname(new URL(import.meta.url).pathname)

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.spec.ts',
        'src/**/*.spec.tsx',
        'src/__tests__/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
