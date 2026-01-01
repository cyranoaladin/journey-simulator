test('setup placeholder', () => {
  expect(true).toBe(true);
});
const { webcrypto } = require('node:crypto');
const { Buffer } = require('node:buffer');

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

if (typeof globalThis.crypto === 'undefined') {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      getRandomValues: (arr) => webcrypto.getRandomValues(arr),
      randomUUID: () => webcrypto.randomUUID(),
      subtle: webcrypto.subtle,
      randomBytes: (size) => webcrypto.getRandomValues(Buffer.alloc(size)),
    },
    configurable: true,
  });
}

if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}
