type LogArgs = unknown[];

const shouldLogDebug =
  typeof import.meta !== 'undefined' &&
  (import.meta as any).env &&
  (import.meta as any).env.DEV === true &&
  // Avoid noisy stdout in Vitest/CI.
  process.env.NODE_ENV !== 'test' &&
  process.env.CI !== 'true';

export const logger = {
  log: (...args: LogArgs) => {
    if (shouldLogDebug) console.log(...args);
  },
  info: (...args: LogArgs) => {
    if (shouldLogDebug) console.info(...args);
  },
  debug: (...args: LogArgs) => {
    if (shouldLogDebug) console.debug(...args);
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
