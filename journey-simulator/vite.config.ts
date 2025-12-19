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
        // CSP (best-effort). Note: we still allow inline scripts because we inject polyfills inline
        // and `index.html` contains an inline init script.
        const csp = [
          "default-src 'self'",
          "base-uri 'self'",
          "object-src 'none'",
          "frame-ancestors 'none'",
          "form-action 'self'",
          "img-src 'self' data: blob: https:",
          "font-src 'self' https://fonts.gstatic.com data:",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "connect-src 'self' https: http: ws: wss:",
        ].join('; ');

        const cspMeta = `\n<meta http-equiv="Content-Security-Policy" content="${csp}">\n`;

        // Inject a conditional polyfill script that checks if functions are already defined
        const polyfillScript = `
<script>
// Critical polyfills - Execute immediately at the highest priority
window.global = window.globalThis || window;

// Define utility function for setting global properties only if it doesn't exist
if (typeof window.defineGlobalProperty$2 !== 'function') {
  window.defineGlobalProperty$2 = function(name, value) {
    try {
      Object.defineProperty(window, name, {
        value: value,
        writable: true,
        enumerable: false,
        configurable: true
      });
    } catch (e) {
      window[name] = value;
    }
  };
}

if (typeof window.defineGlobalProperty !== 'function') {
  window.defineGlobalProperty = window.defineGlobalProperty$2;
}

// Only set up process if it doesn't exist
if (!window.process) {
  window.process = {};
}
Object.assign(window.process, {
  env: window.process.env || { NODE_ENV: 'production' },
  browser: true,
  version: '',
  versions: {},
  bind: function() { return this; },
  nextTick: function(fn) { setTimeout(fn, 0); },
  cwd: function() { return '/'; },
  chdir: function() {},
  umask: function() { return 0; },
  on: function() { return this; },
  once: function() { return this; },
  off: function() { return this; },
  emit: function() { return false; },
  removeListener: function() { return this; },
  removeAllListeners: function() { return this; },
  listeners: function() { return []; }
});
</script>`;
        // Insert the polyfill script as the very first thing in the head
        return html.replace('<head>', '<head>' + cspMeta + polyfillScript);
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
              // Celebration FX (loaded only on completion/mint flows)
              { name: 'celebration', pattern: /react-confetti|tween-functions/ },
              // Keep heavy "export" tooling out of the main vendor bundle.
              { name: 'media-tools', pattern: /html-to-image|html2canvas|jspdf|file-saver|qrcode|canvg/ },
              // Routing libs are used widely, but splitting them keeps the default vendor chunk smaller.
              { name: 'router', pattern: /react-router|@remix-run\/router/ },
              // Solana stack is big; keep it separate.
              { name: 'solana', pattern: /@solana\/|@metaplex\/|bs58|tweetnacl/ },
              // Wallet adapters / embedded wallet UIs tend to be large.
              { name: 'wallet-adapter', pattern: /wallet-adapter|@solana-mobile\/|@toruslabs\// },
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
