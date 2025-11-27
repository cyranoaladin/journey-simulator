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

// Initial loading optimization
const rootElement = document.getElementById('root')!;

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