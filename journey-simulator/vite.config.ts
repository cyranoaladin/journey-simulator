import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    nodePolyfills({
      // To exclude specific polyfills, add them to this list.
      exclude: [
        'fs', // Exclude fs polyfill
        'vm', // Avoid vm-browserify (eval). Keeps CSP script-src free of unsafe-eval in production.
      ],
      // Whether to polyfill specific globals.
      globals: {
        Buffer: true, // can also be 'build', 'dev', or false
        global: true,
        process: true,
      },
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
    {
      name: 'inject-polyfills',
      transformIndexHtml(html) {
        // CSP (best-effort via meta). Prefer enforcing the same policy at the CDN/Nginx layer.
        // In production, keep script-src strict (no inline, no eval).
        const csp = [
          "default-src 'self'",
          "base-uri 'self'",
          "object-src 'none'",
          // NOTE: `frame-ancestors` is ignored when delivered via `<meta http-equiv=...>`; enforce via HTTP header (Nginx/CDN).
          "form-action 'self'",
          "img-src 'self' data: blob: https:",
          "font-src 'self' https://fonts.gstatic.com data:",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          ...(mode === 'production'
            ? ["script-src 'self'"]
            : ["script-src 'self' 'unsafe-inline' 'unsafe-eval'"]),
          "connect-src 'self' https: http: ws: wss:",
        ].join('; ');

        const cspMeta = `\n<meta http-equiv="Content-Security-Policy" content="${csp}">\n`;
        // Insert CSP meta as the very first thing in the head (polyfills are loaded from /polyfills-init.js).
        return html.replace('<head>', '<head>' + cspMeta);
      }
    }
    ,
    ...(mode === 'analyze'
      ? [
          visualizer({
            filename: 'dist/bundle-stats.html',
            template: 'treemap',
            gzipSize: true,
            brotliSize: true,
            open: false,
          }),
          visualizer({
            filename: 'dist/bundle-stats.json',
            template: 'raw-data',
            gzipSize: true,
            brotliSize: true,
            open: false,
          }),
        ]
      : []),
  ],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    hmr: {
      host: '127.0.0.1',
      port: 5173
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  build: {
    sourcemap: mode !== 'production',
    modulePreload: false, // Disable modulepreload to prevent scripts from executing before polyfills
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const chunkMap = [
              { name: 'polyfills', pattern: /readable-stream|stream-browserify|events|buffer|string_decoder/ },
              { name: 'ui-motion', pattern: /framer-motion|zustand/ },
              { name: 'icons', pattern: /lucide-react/ },
              // UI notifications / toasts (keep them out of the main vendor chunk)
              { name: 'notifications', pattern: /sonner|react-hot-toast/ },
              // Celebration FX is already lazy-loaded via dynamic import in `LazyConfetti`.
              // Do NOT force a manual chunk here: it can create a circular dependency
              // (vendor -> celebration -> vendor) and crash at runtime with
              // `Cannot access '<import>' before initialization`.
              // Keep heavy "export" tooling out of the main vendor bundle (split by feature).
              // - "image-export" is used by NFTProofModal download.
              { name: 'image-export', pattern: /html-to-image|file-saver/ },
              // - "pdf-tools" is used by JourneyCompleted export PDF.
              { name: 'pdf-tools', pattern: /html2canvas|jspdf/ },
              // - "qrcode" is optional.
              { name: 'qrcode', pattern: /qrcode/ },
              // - "svg-render" is used for SVG→canvas export (e.g. canvg).
              { name: 'svg-render', pattern: /canvg/ },
              // Routing libs are used widely, but splitting them keeps the default vendor chunk smaller.
              { name: 'router', pattern: /react-router|@remix-run\/router/ },
              // Wallet adapters / embedded wallet UIs tend to be large.
              // IMPORTANT: keep this entry BEFORE `solana` to avoid chunk cycles like:
              // solana -> wallet-adapter -> solana (TDZ errors: "Cannot access <x> before initialization").
              { name: 'wallet-adapter', pattern: /wallet-adapter|@solana-mobile\/|@toruslabs\/|@wallet-standard\/|@solana\/wallet-standard|@solana\/wallet-adapter/ },
              // Solana stack is big; keep it separate.
              { name: 'solana', pattern: /@solana\/|@metaplex\/|bs58|tweetnacl/ },
              // Mermaid pulls in a big graphing stack.
              { name: 'mermaid', pattern: /mermaid|d3-|d3\/|cytoscape|cytoscape-fcose|layout-base|cose-base|katex|dompurify|marked|chevrotain|langium|vscode-languageserver-types|roughjs|svg-pathdata|@chevrotain\/regexp-to-ast/ },
              // API client wrapper.
              { name: 'openapi', pattern: /openapi-fetch/ },
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
}))
