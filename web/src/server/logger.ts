export function shouldLog() {
  // En tests, on évite le bruit (sauf si explicitement demandé)
  if (process.env.NODE_ENV === 'test' && process.env.DEBUG_LOGS !== '1') return false;
  return true;
}

export function log(...args: any[]) {
  if (!shouldLog()) return;
  // eslint-disable-next-line no-console
  console.log(...args);
}

export function warn(...args: any[]) {
  if (!shouldLog()) return;
  // eslint-disable-next-line no-console
  console.warn(...args);
}

export function error(...args: any[]) {
  if (!shouldLog()) return;
  // eslint-disable-next-line no-console
  console.error(...args);
}
