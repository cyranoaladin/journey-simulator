import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
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
        return html.replace('<head>', '<head>' + polyfillScript);
      }
    }
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
    sourcemap: true,
    modulePreload: false, // Disable modulepreload to prevent scripts from executing before polyfills
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const chunkMap = [
              { name: 'polyfills', pattern: /readable-stream|stream-browserify|events|buffer|string_decoder/ },
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