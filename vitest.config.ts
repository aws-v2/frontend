import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    // Use jsdom for DOM simulation (component tests)
    environment: 'jsdom',
    // Run setup file before each test suite
    setupFiles: ['./src/test/setup.ts'],
    // Global test APIs (describe, it, expect) without importing
    globals: true,
    // Coverage via v8
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/test/**', 'src/**/*.d.ts', 'src/main.ts'],
    },
    // Separate reporters for readability
    reporters: ['verbose'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
