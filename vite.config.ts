import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  envPrefix: ['VITE_', 'APP_'],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    allowedHosts: [
    "8d4a-105-164-119-56.ngrok-free.app",
    "laptop.tailb98511.ts.net"
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
test: {
  include: [
    'src/**/*.unit.test.ts',
    'src/**/*.api.test.ts',
    'src/**/*.e2e.test.ts',
  ],
}
})
