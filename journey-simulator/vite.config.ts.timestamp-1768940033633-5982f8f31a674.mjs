// vite.config.ts
import { defineConfig } from "file:///home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/node_modules/vite/dist/node/index.js";
import react from "file:///home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/node_modules/@vitejs/plugin-react/dist/index.js";
import { resolve } from "path";
import { nodePolyfills } from "file:///home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/node_modules/vite-plugin-node-polyfills/dist/index.js";
import { visualizer } from "file:///home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
var __vite_injected_original_dirname = "/home/alaeddine/Documents/journey_mfai_back_front/journey-simulator";
var vite_config_default = defineConfig(({ mode }) => ({
  plugins: [
    react(),
    nodePolyfills({
      // To exclude specific polyfills, add them to this list.
      exclude: [
        "fs",
        // Exclude fs polyfill
        "vm"
        // Avoid vm-browserify (eval). Keeps CSP script-src free of unsafe-eval in production.
      ],
      // Whether to polyfill specific globals.
      globals: {
        Buffer: true,
        // can also be 'build', 'dev', or false
        global: true,
        process: true
      },
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true
    }),
    {
      name: "inject-polyfills",
      transformIndexHtml(html) {
        const csp = [
          "default-src 'self'",
          "base-uri 'self'",
          "object-src 'none'",
          // NOTE: `frame-ancestors` is ignored when delivered via `<meta http-equiv=...>`; enforce via HTTP header (Nginx/CDN).
          "form-action 'self'",
          "img-src 'self' data: blob: https:",
          "font-src 'self' https://fonts.gstatic.com data:",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          ...mode === "production" ? ["script-src 'self'"] : ["script-src 'self' 'unsafe-inline' 'unsafe-eval'"],
          "connect-src 'self' https: http: ws: wss: http://localhost:3002 http://localhost:3000"
        ].join("; ");
        const cspMeta = `
<meta http-equiv="Content-Security-Policy" content="${csp}">
`;
        return html.replace("<head>", "<head>" + cspMeta);
      }
    },
    ...mode === "analyze" ? [
      visualizer({
        filename: "dist/bundle-stats.html",
        template: "treemap",
        gzipSize: true,
        brotliSize: true,
        open: false
      }),
      visualizer({
        filename: "dist/bundle-stats.json",
        template: "raw-data",
        gzipSize: true,
        brotliSize: true,
        open: false
      })
    ] : []
  ],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    // Prevent browser caching during local dev to avoid stale chunk issues.
    headers: {
      "Cache-Control": "no-store"
    },
    hmr: {
      host: "127.0.0.1",
      port: 5173
    },
    // Proxy API requests to backend
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3005",
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {
    // Prevent browser caching during local preview to avoid stale dist/assets being reused.
    headers: {
      "Cache-Control": "no-store"
    }
  },
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "src"),
      vm: resolve(__vite_injected_original_dirname, "src/shims/empty.ts")
    }
  },
  optimizeDeps: {
    exclude: ["lucide-react"]
  },
  build: {
    sourcemap: mode !== "production",
    modulePreload: false,
    // Disable modulepreload to prevent scripts from executing before polyfills
    chunkSizeWarningLimit: 3e3,
    // Large third-party chunks (mermaid/solana) are manually split below
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            const chunkMap = [
              { name: "ui-motion", pattern: /framer-motion|zustand/ },
              { name: "icons", pattern: /lucide-react/ },
              // UI notifications / toasts (keep them out of the main vendor chunk)
              { name: "notifications", pattern: /sonner|react-hot-toast/ },
              // Celebration FX is already lazy-loaded via dynamic import in `LazyConfetti`.
              // Do NOT force a manual chunk here: it can create a circular dependency
              // (vendor -> celebration -> vendor) and crash at runtime with
              // `Cannot access '<import>' before initialization`.
              // Keep heavy "export" tooling out of the main vendor bundle (split by feature).
              // - "image-export" is used by NFTProofModal download.
              { name: "image-export", pattern: /html-to-image|file-saver/ },
              // - "pdf-tools" is used by JourneyCompleted export PDF.
              { name: "pdf-tools", pattern: /html2canvas|jspdf/ },
              // - "qrcode" is optional.
              { name: "qrcode", pattern: /qrcode/ },
              // - "svg-render" is used for SVG→canvas export (e.g. canvg).
              { name: "svg-render", pattern: /canvg/ },
              // Routing libs are used widely, but splitting them keeps the default vendor chunk smaller.
              { name: "router", pattern: /react-router|@remix-run\/router/ },
              // Wallet adapters / embedded wallet UIs tend to be large.
              // IMPORTANT: keep this entry BEFORE `solana` to avoid chunk cycles like:
              // solana -> wallet-adapter -> solana (TDZ errors: "Cannot access <x> before initialization").
              { name: "wallet-adapter", pattern: /wallet-adapter|@solana-mobile\/|@toruslabs\/|@wallet-standard\/|@solana\/wallet-standard|@solana\/wallet-adapter/ },
              // Solana stack is big; keep it separate.
              { name: "solana", pattern: /@solana\/|@metaplex\/|bs58|tweetnacl/ },
              // Mermaid pulls in a big graphing stack.
              { name: "mermaid", pattern: /mermaid|d3-|d3\/|cytoscape|cytoscape-fcose|layout-base|cose-base|katex|dompurify|marked|chevrotain|langium|vscode-languageserver-types|roughjs|svg-pathdata|@chevrotain\/regexp-to-ast/ },
              // API client wrapper.
              { name: "openapi", pattern: /openapi-fetch/ }
            ];
            for (const { name, pattern } of chunkMap) {
              if (pattern.test(id)) {
                return name;
              }
            }
            return void 0;
          }
        }
      }
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9hbGFlZGRpbmUvRG9jdW1lbnRzL2pvdXJuZXlfbWZhaV9iYWNrX2Zyb250L2pvdXJuZXktc2ltdWxhdG9yXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9hbGFlZGRpbmUvRG9jdW1lbnRzL2pvdXJuZXlfbWZhaV9iYWNrX2Zyb250L2pvdXJuZXktc2ltdWxhdG9yL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL2FsYWVkZGluZS9Eb2N1bWVudHMvam91cm5leV9tZmFpX2JhY2tfZnJvbnQvam91cm5leS1zaW11bGF0b3Ivdml0ZS5jb25maWcudHNcIjsvKipcbiAqIFByb2plY3Q6IE1vbmV5IEZhY3RvcnkgQUkgKE1GQUkpXG4gKiBTdGF0dXM6IFByb2R1Y3Rpb24gUmVhZHkgLSAyMDI2XG4gKiBDb250cmlidXRvcnM6IEFsYWVkZGluZSBCRU4gUkhPVU1BLCBLYW1lbCBCRU4gUkhPVU1BLCBBZGVtIEJFTEhBSkFJU1NBXG4gKi9cblxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgbm9kZVBvbHlmaWxscyB9IGZyb20gJ3ZpdGUtcGx1Z2luLW5vZGUtcG9seWZpbGxzJ1xuaW1wb3J0IHsgdmlzdWFsaXplciB9IGZyb20gJ3JvbGx1cC1wbHVnaW4tdmlzdWFsaXplcidcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIG5vZGVQb2x5ZmlsbHMoe1xuICAgICAgLy8gVG8gZXhjbHVkZSBzcGVjaWZpYyBwb2x5ZmlsbHMsIGFkZCB0aGVtIHRvIHRoaXMgbGlzdC5cbiAgICAgIGV4Y2x1ZGU6IFtcbiAgICAgICAgJ2ZzJywgLy8gRXhjbHVkZSBmcyBwb2x5ZmlsbFxuICAgICAgICAndm0nLCAvLyBBdm9pZCB2bS1icm93c2VyaWZ5IChldmFsKS4gS2VlcHMgQ1NQIHNjcmlwdC1zcmMgZnJlZSBvZiB1bnNhZmUtZXZhbCBpbiBwcm9kdWN0aW9uLlxuICAgICAgXSxcbiAgICAgIC8vIFdoZXRoZXIgdG8gcG9seWZpbGwgc3BlY2lmaWMgZ2xvYmFscy5cbiAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgQnVmZmVyOiB0cnVlLCAvLyBjYW4gYWxzbyBiZSAnYnVpbGQnLCAnZGV2Jywgb3IgZmFsc2VcbiAgICAgICAgZ2xvYmFsOiB0cnVlLFxuICAgICAgICBwcm9jZXNzOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIC8vIFdoZXRoZXIgdG8gcG9seWZpbGwgYG5vZGU6YCBwcm90b2NvbCBpbXBvcnRzLlxuICAgICAgcHJvdG9jb2xJbXBvcnRzOiB0cnVlLFxuICAgIH0pLFxuICAgIHtcbiAgICAgIG5hbWU6ICdpbmplY3QtcG9seWZpbGxzJyxcbiAgICAgIHRyYW5zZm9ybUluZGV4SHRtbChodG1sKSB7XG4gICAgICAgIC8vIENTUCAoYmVzdC1lZmZvcnQgdmlhIG1ldGEpLiBQcmVmZXIgZW5mb3JjaW5nIHRoZSBzYW1lIHBvbGljeSBhdCB0aGUgQ0ROL05naW54IGxheWVyLlxuICAgICAgICAvLyBJbiBwcm9kdWN0aW9uLCBrZWVwIHNjcmlwdC1zcmMgc3RyaWN0IChubyBpbmxpbmUsIG5vIGV2YWwpLlxuICAgICAgICBjb25zdCBjc3AgPSBbXG4gICAgICAgICAgXCJkZWZhdWx0LXNyYyAnc2VsZidcIixcbiAgICAgICAgICBcImJhc2UtdXJpICdzZWxmJ1wiLFxuICAgICAgICAgIFwib2JqZWN0LXNyYyAnbm9uZSdcIixcbiAgICAgICAgICAvLyBOT1RFOiBgZnJhbWUtYW5jZXN0b3JzYCBpcyBpZ25vcmVkIHdoZW4gZGVsaXZlcmVkIHZpYSBgPG1ldGEgaHR0cC1lcXVpdj0uLi4+YDsgZW5mb3JjZSB2aWEgSFRUUCBoZWFkZXIgKE5naW54L0NETikuXG4gICAgICAgICAgXCJmb3JtLWFjdGlvbiAnc2VsZidcIixcbiAgICAgICAgICBcImltZy1zcmMgJ3NlbGYnIGRhdGE6IGJsb2I6IGh0dHBzOlwiLFxuICAgICAgICAgIFwiZm9udC1zcmMgJ3NlbGYnIGh0dHBzOi8vZm9udHMuZ3N0YXRpYy5jb20gZGF0YTpcIixcbiAgICAgICAgICBcInN0eWxlLXNyYyAnc2VsZicgJ3Vuc2FmZS1pbmxpbmUnIGh0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb21cIixcbiAgICAgICAgICAuLi4obW9kZSA9PT0gJ3Byb2R1Y3Rpb24nXG4gICAgICAgICAgICA/IFtcInNjcmlwdC1zcmMgJ3NlbGYnXCJdXG4gICAgICAgICAgICA6IFtcInNjcmlwdC1zcmMgJ3NlbGYnICd1bnNhZmUtaW5saW5lJyAndW5zYWZlLWV2YWwnXCJdKSxcbiAgICAgICAgICBcImNvbm5lY3Qtc3JjICdzZWxmJyBodHRwczogaHR0cDogd3M6IHdzczogaHR0cDovL2xvY2FsaG9zdDozMDAyIGh0dHA6Ly9sb2NhbGhvc3Q6MzAwMFwiLFxuICAgICAgICBdLmpvaW4oJzsgJyk7XG5cbiAgICAgICAgY29uc3QgY3NwTWV0YSA9IGBcXG48bWV0YSBodHRwLWVxdWl2PVwiQ29udGVudC1TZWN1cml0eS1Qb2xpY3lcIiBjb250ZW50PVwiJHtjc3B9XCI+XFxuYDtcbiAgICAgICAgLy8gSW5zZXJ0IENTUCBtZXRhIGFzIHRoZSB2ZXJ5IGZpcnN0IHRoaW5nIGluIHRoZSBoZWFkIChwb2x5ZmlsbHMgYXJlIGxvYWRlZCBmcm9tIC9wb2x5ZmlsbHMtaW5pdC5qcykuXG4gICAgICAgIHJldHVybiBodG1sLnJlcGxhY2UoJzxoZWFkPicsICc8aGVhZD4nICsgY3NwTWV0YSk7XG4gICAgICB9XG4gICAgfVxuICAgICxcbiAgICAuLi4obW9kZSA9PT0gJ2FuYWx5emUnXG4gICAgICA/IFtcbiAgICAgICAgdmlzdWFsaXplcih7XG4gICAgICAgICAgZmlsZW5hbWU6ICdkaXN0L2J1bmRsZS1zdGF0cy5odG1sJyxcbiAgICAgICAgICB0ZW1wbGF0ZTogJ3RyZWVtYXAnLFxuICAgICAgICAgIGd6aXBTaXplOiB0cnVlLFxuICAgICAgICAgIGJyb3RsaVNpemU6IHRydWUsXG4gICAgICAgICAgb3BlbjogZmFsc2UsXG4gICAgICAgIH0pLFxuICAgICAgICB2aXN1YWxpemVyKHtcbiAgICAgICAgICBmaWxlbmFtZTogJ2Rpc3QvYnVuZGxlLXN0YXRzLmpzb24nLFxuICAgICAgICAgIHRlbXBsYXRlOiAncmF3LWRhdGEnLFxuICAgICAgICAgIGd6aXBTaXplOiB0cnVlLFxuICAgICAgICAgIGJyb3RsaVNpemU6IHRydWUsXG4gICAgICAgICAgb3BlbjogZmFsc2UsXG4gICAgICAgIH0pLFxuICAgICAgXVxuICAgICAgOiBbXSksXG4gIF0sXG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6ICcxMjcuMC4wLjEnLFxuICAgIHBvcnQ6IDUxNzMsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgICAvLyBQcmV2ZW50IGJyb3dzZXIgY2FjaGluZyBkdXJpbmcgbG9jYWwgZGV2IHRvIGF2b2lkIHN0YWxlIGNodW5rIGlzc3Vlcy5cbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQ2FjaGUtQ29udHJvbCc6ICduby1zdG9yZScsXG4gICAgfSxcbiAgICBobXI6IHtcbiAgICAgIGhvc3Q6ICcxMjcuMC4wLjEnLFxuICAgICAgcG9ydDogNTE3M1xuICAgIH0sXG4gICAgLy8gUHJveHkgQVBJIHJlcXVlc3RzIHRvIGJhY2tlbmRcbiAgICBwcm94eToge1xuICAgICAgJy9hcGknOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly8xMjcuMC4wLjE6MzAwNScsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgc2VjdXJlOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgcHJldmlldzoge1xuICAgIC8vIFByZXZlbnQgYnJvd3NlciBjYWNoaW5nIGR1cmluZyBsb2NhbCBwcmV2aWV3IHRvIGF2b2lkIHN0YWxlIGRpc3QvYXNzZXRzIGJlaW5nIHJldXNlZC5cbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQ2FjaGUtQ29udHJvbCc6ICduby1zdG9yZScsXG4gICAgfSxcbiAgfSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjJyksXG4gICAgICB2bTogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvc2hpbXMvZW1wdHkudHMnKSxcbiAgICB9LFxuICB9LFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBleGNsdWRlOiBbJ2x1Y2lkZS1yZWFjdCddLFxuICB9LFxuXG4gIGJ1aWxkOiB7XG4gICAgc291cmNlbWFwOiBtb2RlICE9PSAncHJvZHVjdGlvbicsXG4gICAgbW9kdWxlUHJlbG9hZDogZmFsc2UsIC8vIERpc2FibGUgbW9kdWxlcHJlbG9hZCB0byBwcmV2ZW50IHNjcmlwdHMgZnJvbSBleGVjdXRpbmcgYmVmb3JlIHBvbHlmaWxsc1xuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMzAwMCwgLy8gTGFyZ2UgdGhpcmQtcGFydHkgY2h1bmtzIChtZXJtYWlkL3NvbGFuYSkgYXJlIG1hbnVhbGx5IHNwbGl0IGJlbG93XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rcyhpZCkge1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcbiAgICAgICAgICAgIGNvbnN0IGNodW5rTWFwID0gW3sgbmFtZTogJ3VpLW1vdGlvbicsIHBhdHRlcm46IC9mcmFtZXItbW90aW9ufHp1c3RhbmQvIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdpY29ucycsIHBhdHRlcm46IC9sdWNpZGUtcmVhY3QvIH0sXG4gICAgICAgICAgICAvLyBVSSBub3RpZmljYXRpb25zIC8gdG9hc3RzIChrZWVwIHRoZW0gb3V0IG9mIHRoZSBtYWluIHZlbmRvciBjaHVuaylcbiAgICAgICAgICAgIHsgbmFtZTogJ25vdGlmaWNhdGlvbnMnLCBwYXR0ZXJuOiAvc29ubmVyfHJlYWN0LWhvdC10b2FzdC8gfSxcbiAgICAgICAgICAgIC8vIENlbGVicmF0aW9uIEZYIGlzIGFscmVhZHkgbGF6eS1sb2FkZWQgdmlhIGR5bmFtaWMgaW1wb3J0IGluIGBMYXp5Q29uZmV0dGlgLlxuICAgICAgICAgICAgLy8gRG8gTk9UIGZvcmNlIGEgbWFudWFsIGNodW5rIGhlcmU6IGl0IGNhbiBjcmVhdGUgYSBjaXJjdWxhciBkZXBlbmRlbmN5XG4gICAgICAgICAgICAvLyAodmVuZG9yIC0+IGNlbGVicmF0aW9uIC0+IHZlbmRvcikgYW5kIGNyYXNoIGF0IHJ1bnRpbWUgd2l0aFxuICAgICAgICAgICAgLy8gYENhbm5vdCBhY2Nlc3MgJzxpbXBvcnQ+JyBiZWZvcmUgaW5pdGlhbGl6YXRpb25gLlxuICAgICAgICAgICAgLy8gS2VlcCBoZWF2eSBcImV4cG9ydFwiIHRvb2xpbmcgb3V0IG9mIHRoZSBtYWluIHZlbmRvciBidW5kbGUgKHNwbGl0IGJ5IGZlYXR1cmUpLlxuICAgICAgICAgICAgLy8gLSBcImltYWdlLWV4cG9ydFwiIGlzIHVzZWQgYnkgTkZUUHJvb2ZNb2RhbCBkb3dubG9hZC5cbiAgICAgICAgICAgIHsgbmFtZTogJ2ltYWdlLWV4cG9ydCcsIHBhdHRlcm46IC9odG1sLXRvLWltYWdlfGZpbGUtc2F2ZXIvIH0sXG4gICAgICAgICAgICAvLyAtIFwicGRmLXRvb2xzXCIgaXMgdXNlZCBieSBKb3VybmV5Q29tcGxldGVkIGV4cG9ydCBQREYuXG4gICAgICAgICAgICB7IG5hbWU6ICdwZGYtdG9vbHMnLCBwYXR0ZXJuOiAvaHRtbDJjYW52YXN8anNwZGYvIH0sXG4gICAgICAgICAgICAvLyAtIFwicXJjb2RlXCIgaXMgb3B0aW9uYWwuXG4gICAgICAgICAgICB7IG5hbWU6ICdxcmNvZGUnLCBwYXR0ZXJuOiAvcXJjb2RlLyB9LFxuICAgICAgICAgICAgLy8gLSBcInN2Zy1yZW5kZXJcIiBpcyB1c2VkIGZvciBTVkdcdTIxOTJjYW52YXMgZXhwb3J0IChlLmcuIGNhbnZnKS5cbiAgICAgICAgICAgIHsgbmFtZTogJ3N2Zy1yZW5kZXInLCBwYXR0ZXJuOiAvY2FudmcvIH0sXG4gICAgICAgICAgICAvLyBSb3V0aW5nIGxpYnMgYXJlIHVzZWQgd2lkZWx5LCBidXQgc3BsaXR0aW5nIHRoZW0ga2VlcHMgdGhlIGRlZmF1bHQgdmVuZG9yIGNodW5rIHNtYWxsZXIuXG4gICAgICAgICAgICB7IG5hbWU6ICdyb3V0ZXInLCBwYXR0ZXJuOiAvcmVhY3Qtcm91dGVyfEByZW1peC1ydW5cXC9yb3V0ZXIvIH0sXG4gICAgICAgICAgICAvLyBXYWxsZXQgYWRhcHRlcnMgLyBlbWJlZGRlZCB3YWxsZXQgVUlzIHRlbmQgdG8gYmUgbGFyZ2UuXG4gICAgICAgICAgICAvLyBJTVBPUlRBTlQ6IGtlZXAgdGhpcyBlbnRyeSBCRUZPUkUgYHNvbGFuYWAgdG8gYXZvaWQgY2h1bmsgY3ljbGVzIGxpa2U6XG4gICAgICAgICAgICAvLyBzb2xhbmEgLT4gd2FsbGV0LWFkYXB0ZXIgLT4gc29sYW5hIChURFogZXJyb3JzOiBcIkNhbm5vdCBhY2Nlc3MgPHg+IGJlZm9yZSBpbml0aWFsaXphdGlvblwiKS5cbiAgICAgICAgICAgIHsgbmFtZTogJ3dhbGxldC1hZGFwdGVyJywgcGF0dGVybjogL3dhbGxldC1hZGFwdGVyfEBzb2xhbmEtbW9iaWxlXFwvfEB0b3J1c2xhYnNcXC98QHdhbGxldC1zdGFuZGFyZFxcL3xAc29sYW5hXFwvd2FsbGV0LXN0YW5kYXJkfEBzb2xhbmFcXC93YWxsZXQtYWRhcHRlci8gfSxcbiAgICAgICAgICAgIC8vIFNvbGFuYSBzdGFjayBpcyBiaWc7IGtlZXAgaXQgc2VwYXJhdGUuXG4gICAgICAgICAgICB7IG5hbWU6ICdzb2xhbmEnLCBwYXR0ZXJuOiAvQHNvbGFuYVxcL3xAbWV0YXBsZXhcXC98YnM1OHx0d2VldG5hY2wvIH0sXG4gICAgICAgICAgICAvLyBNZXJtYWlkIHB1bGxzIGluIGEgYmlnIGdyYXBoaW5nIHN0YWNrLlxuICAgICAgICAgICAgeyBuYW1lOiAnbWVybWFpZCcsIHBhdHRlcm46IC9tZXJtYWlkfGQzLXxkM1xcL3xjeXRvc2NhcGV8Y3l0b3NjYXBlLWZjb3NlfGxheW91dC1iYXNlfGNvc2UtYmFzZXxrYXRleHxkb21wdXJpZnl8bWFya2VkfGNoZXZyb3RhaW58bGFuZ2l1bXx2c2NvZGUtbGFuZ3VhZ2VzZXJ2ZXItdHlwZXN8cm91Z2hqc3xzdmctcGF0aGRhdGF8QGNoZXZyb3RhaW5cXC9yZWdleHAtdG8tYXN0LyB9LFxuICAgICAgICAgICAgLy8gQVBJIGNsaWVudCB3cmFwcGVyLlxuICAgICAgICAgICAgeyBuYW1lOiAnb3BlbmFwaScsIHBhdHRlcm46IC9vcGVuYXBpLWZldGNoLyB9LFxuICAgICAgICAgICAgXVxuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHsgbmFtZSwgcGF0dGVybiB9IG9mIGNodW5rTWFwKSB7XG4gICAgICAgICAgICAgIGlmIChwYXR0ZXJuLnRlc3QoaWQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5hbWVcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBMZXQgUm9sbHVwIGRlY2lkZSB0aGUgcmVtYWluaW5nIG5vZGVfbW9kdWxlcyBjaHVua2luZy5cbiAgICAgICAgICAgIC8vIFJldHVybmluZyBhIGZpeGVkIGZhbGxiYWNrIGNodW5rIG5hbWUgKGxpa2UgJ3ZlbmRvcicpIGNhbiBjcmVhdGUgY3ljbGljIGNodW5rIGdyYXBoc1xuICAgICAgICAgICAgLy8gd2hlbiBzaGFyZWQgZGVwcyBzdHJhZGRsZSBtYW51YWwgY2h1bmtzIChlLmcuIHNvbGFuYS93YWxsZXQtYWRhcHRlcikuXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59KSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFNQSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFdBQVc7QUFDbEIsU0FBUyxlQUFlO0FBQ3hCLFNBQVMscUJBQXFCO0FBQzlCLFNBQVMsa0JBQWtCO0FBVjNCLElBQU0sbUNBQW1DO0FBYXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sY0FBYztBQUFBO0FBQUEsTUFFWixTQUFTO0FBQUEsUUFDUDtBQUFBO0FBQUEsUUFDQTtBQUFBO0FBQUEsTUFDRjtBQUFBO0FBQUEsTUFFQSxTQUFTO0FBQUEsUUFDUCxRQUFRO0FBQUE7QUFBQSxRQUNSLFFBQVE7QUFBQSxRQUNSLFNBQVM7QUFBQSxNQUNYO0FBQUE7QUFBQSxNQUVBLGlCQUFpQjtBQUFBLElBQ25CLENBQUM7QUFBQSxJQUNEO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixtQkFBbUIsTUFBTTtBQUd2QixjQUFNLE1BQU07QUFBQSxVQUNWO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQTtBQUFBLFVBRUE7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBLEdBQUksU0FBUyxlQUNULENBQUMsbUJBQW1CLElBQ3BCLENBQUMsaURBQWlEO0FBQUEsVUFDdEQ7QUFBQSxRQUNGLEVBQUUsS0FBSyxJQUFJO0FBRVgsY0FBTSxVQUFVO0FBQUEsc0RBQXlELEdBQUc7QUFBQTtBQUU1RSxlQUFPLEtBQUssUUFBUSxVQUFVLFdBQVcsT0FBTztBQUFBLE1BQ2xEO0FBQUEsSUFDRjtBQUFBLElBRUEsR0FBSSxTQUFTLFlBQ1Q7QUFBQSxNQUNBLFdBQVc7QUFBQSxRQUNULFVBQVU7QUFB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
