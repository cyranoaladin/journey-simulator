import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      buffer: 'buffer/',
      'buffer/': 'buffer/',
      process: resolve(__dirname, 'node_modules/process/browser.js'),
      'process/': resolve(__dirname, 'node_modules/process/browser.js'),
      'process/browser': resolve(__dirname, 'node_modules/process/browser.js'),
      'process/browser.js': resolve(__dirname, 'node_modules/process/browser.js'),
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
    },
  },
  optimizeDeps: {
    include: ['buffer', 'process', 'crypto-browserify', 'stream-browserify'],
    exclude: ['lucide-react'],
  },
  define: {
    global: 'globalThis',
    'process.env': 'import.meta.env',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const chunkMap = [
              { name: 'torus', pattern: /@toruslabs/ },
              { name: 'polyfills', pattern: /readable-stream|stream-browserify|events|buffer/ },
              { name: 'ui-motion', pattern: /framer-motion|zustand/ },
              { name: 'icons', pattern: /lucide-react/ },
              { name: 'media-tools', pattern: /html-to-image|qrcode/ }
            ]

            for (const { name, pattern } of chunkMap) {
              if (pattern.test(id)) {
                return name
              }
            }

            return 'vendor'
          }
        }
      }
    }
  }
})