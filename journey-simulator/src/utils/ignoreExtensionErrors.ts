/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

// Development-time filter to ignore errors originating from browser extensions
// (e.g., chrome-extension://, moz-extension://). This avoids noisy false positives
// in the console like "Cannot access 'ae' before initialization" from injected scripts.
//
// Enabled by default in dev. Disable via either:
// - VITE_DISABLE_EXTENSION_ERROR_FILTER=true (env)
// - localStorage.setItem('debug:allow-extension-errors', '1')

const EXT_PROTOCOLS = [
  'chrome-extension://',
  'moz-extension://',
  'safari-extension://',
  'edge-extension://',
  'ms-browser-extension://',
] as const

function isExtensionUrl(url: string | undefined | null): boolean {
  if (!url) return false
  return EXT_PROTOCOLS.some((p) => url.startsWith(p))
}

function stackHasExtensionUrl(stack?: string | null): boolean {
  if (!stack) return false
  return EXT_PROTOCOLS.some((p) => stack.includes(p))
}

function shouldEnable(): boolean {
  // Only consider this in dev builds
  const isDev = import.meta.env.DEV
  if (!isDev) return false

  // Env toggle: if explicitly disabled, do not enable
  const disabledByEnv =
    (import.meta as any).env?.VITE_DISABLE_EXTENSION_ERROR_FILTER === 'true'
  if (disabledByEnv) return false

  // Local override: allow extension errors (useful to debug an extension)
  const allow = globalThis.localStorage?.getItem('debug:allow-extension-errors')
  if (allow === '1' || allow === 'true') return false

  return true
}

export function setupIgnoreExtensionErrors(): () => void {
  if (!shouldEnable()) return () => {}

  const onError = (ev: ErrorEvent) => {
    const fromExt = isExtensionUrl(ev.filename) || stackHasExtensionUrl(ev.error?.stack)
    if (fromExt) {
      // Prevent the default red console error
      ev.preventDefault()
      // Keep a lightweight breadcrumb in the console for awareness
      // Do not log the full stack to avoid noise
      console.info('[dev] Ignored extension error:', {
        filename: ev.filename,
        message: ev.message,
      })
    }
  }

  const onUnhandledRejection = (ev: PromiseRejectionEvent) => {
    const reason = ev.reason as any
    const stack: string | undefined = reason?.stack || String(reason || '')
    if (stackHasExtensionUrl(stack)) {
      ev.preventDefault()
      console.info('[dev] Ignored extension unhandledrejection')
    }
  }

  globalThis.addEventListener('error', onError)
  globalThis.addEventListener('unhandledrejection', onUnhandledRejection)

  return () => {
    globalThis.removeEventListener('error', onError)
    globalThis.removeEventListener('unhandledrejection', onUnhandledRejection)
  }
}