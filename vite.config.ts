import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const enableWallet = env.VITE_ENABLE_WALLET === "1";
  return {
    plugins: [react()],
    resolve: {
      alias: {
        buffer: "buffer",
        ...(enableWallet
          ? {}
          : {
              "@solana/wallet-adapter-react": path.resolve(
                __dirname,
                "src/stubs/wallet-adapter-react.ts",
              ),
              "@solana/wallet-adapter-react-ui": path.resolve(
                __dirname,
                "src/stubs/wallet-adapter-react-ui.ts",
              ),
              "@solana/web3.js": path.resolve(__dirname, "src/stubs/web3.ts"),
            }),
      },
    },
    define: {
      "process.env": {},
      global: "globalThis",
    },
    optimizeDeps: {
      exclude: ["lucide-react"],
      include: ["buffer"],
      esbuildOptions: {
        define: {
          global: "globalThis",
          "process.env": "{}",
        },
      },
    },
  };
});
