// Lightweight browser polyfills for Node globals used by some web3/wallet libs
import { Buffer } from "buffer";

declare global {
  interface Window {
    Buffer?: any;
    global?: any;
  }
}

if (typeof window !== "undefined") {
  if (!window.Buffer) {
    window.Buffer = Buffer as any;
  }
  if (!window.global) {
    window.global = window;
  }
}
