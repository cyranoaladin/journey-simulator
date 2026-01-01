/* (c) 2025 - Money Factory AI. Developed by Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA. All rights reserved. */
import { Buffer } from 'buffer'
import process from 'process'

// Enhance polyfills - HTML provides minimal stubs, we add full implementations
const globalObject = globalThis as any
if (!globalObject.Buffer) {
  globalObject.Buffer = Buffer
}
// Merge the full process module with the minimal stub from HTML
Object.assign(globalObject.process, process)

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { setupIgnoreExtensionErrors } from './utils/ignoreExtensionErrors'

// Initial loading optimization
const rootElement = document.getElementById('root')!;

// Dev guard: ignore noisy extension errors in local runs
const teardownIgnore = setupIgnoreExtensionErrors()

const root = ReactDOM.createRoot(rootElement);

// Deferred application loading to improve performance
const performantRender = () => {
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  );
};

// Direct rendering without delay
performantRender();

// Optional: clean up on hot-reload dispose
if (import.meta.hot) {
  import.meta.hot.dispose(() => teardownIgnore?.())
}

// Service worker registration for offline caching (temporarily disabled)
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js')
//       .then((registration) => {
//         console.log('Service Worker registered successfully:', registration.scope);
//       })
//       .catch((error) => {
//         console.log('Service Worker registration failed:', error);
//       });
//   });
// }

// Export for tests
export { root };