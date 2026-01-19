/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

// Loaded before Vite modules to provide minimal globals required by some libraries.
// This file is referenced from index.html so we can keep CSP strict (no inline scripts).

(() => {
  try {
    // global/globalThis shim
    window.global = window.globalThis || window

    // process shim (minimal)
    if (!window.process) {
      window.process = {}
    }

    Object.assign(window.process, {
      env: window.process.env || { NODE_ENV: 'production' },
      browser: true,
      version: '',
      versions: {},
      nextTick: function (fn) {
        setTimeout(fn, 0)
      },
      cwd: function () {
        return '/'
      },
      chdir: function () {},
      umask: function () {
        return 0
      },
    })

    // Buffer placeholder (vite-plugin-node-polyfills will provide the real impl in bundles when needed)
    window.Buffer = window.Buffer || []
  } catch {
    // no-op
  }
})()

// Critical polyfills that MUST load before any other code
// This file is loaded as a regular script (not module) to ensure it executes first

window.global = window.globalThis || window;

// Define utility function for setting global properties (used by process polyfill)
// Define utility function for setting global properties (used by process polyfill)
window.defineGlobalProperty$2 = function (name, value) {
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
window.defineGlobalProperty = window.defineGlobalProperty$2;

// Complete process stub with all commonly accessed methods
window.process = window.process || {};
Object.assign(window.process, {
    env: window.process.env || { NODE_ENV: 'production' },
    browser: true,
    version: '',
    versions: {},
    // Add bind method that some libraries expect
    bind: function () { return this; },
    // Add other commonly used methods as no-ops
    nextTick: function (fn) { setTimeout(fn, 0); },
    cwd: function () { return '/'; },
    chdir: function () { },
    umask: function () { return 0; },
    // EventEmitter-like methods
    on: function () { return this; },
    once: function () { return this; },
    off: function () { return this; },
    emit: function () { return false; },
    removeListener: function () { return this; },
    removeAllListeners: function () { return this; },
    listeners: function () { return []; }
});
