type LogArgs = unknown[];

const getShouldLogDebug = (): boolean => {
  // Debug logging is intentionally opt-in to keep dev/E2E output clean.
  const isDev =
    typeof import.meta !== 'undefined' &&
    (import.meta as any).env &&
    (import.meta as any).env.DEV === true;

  if (!isDev) return false;

  // Disable debug logs in CI/test runners.
  if (process.env.NODE_ENV === 'test' || process.env.CI === 'true') return false;

  // Playwright / webdriver sessions: keep output minimal.
  try {
    if (typeof navigator !== 'undefined' && (navigator as any).webdriver) return false;
  } catch {
    // ignore
  }

  // Opt-in flag (Vite):
  // - set `VITE_DEBUG_LOGS=true` to enable.
  return (import.meta as any).env?.VITE_DEBUG_LOGS === 'true';
};

export const logger = {
  log: (...args: LogArgs) => {
    if (getShouldLogDebug()) console.log(...args);
  },
  info: (...args: LogArgs) => {
    if (getShouldLogDebug()) console.info(...args);
  },
  debug: (...args: LogArgs) => {
    if (getShouldLogDebug()) console.debug(...args);
  },
  warn: (...args: LogArgs) => {
    // keep warnings visible in prod/CI
    console.warn(...args);
  },
  error: (...args: LogArgs) => {
    // keep errors visible in prod/CI
    console.error(...args);
  },
};
