import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Simple dev-only mock API to avoid ERR_CONNECTION_REFUSED when backend is down
const mockApiPlugin = () => ({
  name: 'mock-api',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const useMocks = process.env.VITE_API_MOCK === '1' || process.env.VITE_API_MOCK === 'true'
      if (!useMocks) return next()
      const url = req.url || ''

      // Mock user profile
      if (url.startsWith('/user/profile')) {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          ok: true,
          user: {
            id: 'u-dev',
            email: 'dev@example.com',
            name: 'Developer',
            walletAddress: null,
            createdAt: new Date().toISOString(),
          },
        }))
        return
      }

      // Mock journey user-progress
      if (url.startsWith('/journey/user-progress')) {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          ok: true,
          progress: {
            totalXP: 0,
            nfts: [],
            nftMints: [],
            passLevel: 'Free',
            mfaiTokens: 10,
            stakedMfai: 0,
            walletConnected: false,
            walletAddress: undefined,
            completedPhases: [],
            currentPersona: undefined,
            votingPower: 0,
            daoProposals: 0,
            testnetAirdropClaimed: false,
            socialShareCount: 0,
          },
        }))
        return
      }

      next()
    })
  },
})

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [mockApiPlugin(), react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    // Proxy backend routes to Next.js backend on port 3001
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
      '/user': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
      '/journey': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
})
