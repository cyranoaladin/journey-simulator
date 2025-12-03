import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'
import { WritableStream } from 'web-streams-ponyfill';

if (typeof global.WritableStream === 'undefined') {
  (global as any).WritableStream = WritableStream;
}

  // Polyfill for libs requiring TextEncoder/TextDecoder (e.g., noble)
  ; (global as any).TextEncoder = TextEncoder
  ; (global as any).TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder

// Polyfill for Request/Response in Jest environment
if (typeof Request === 'undefined') {
  global.Request = class Request {
    constructor(input: any, init: any) {
      this.json = async () => init?.body ? JSON.parse(init.body) : {};
    }
    json() { return Promise.resolve({}) }
  } as any;
}
if (typeof Response === 'undefined') {
  global.Response = class Response {
    constructor(body?: any, init?: any) {
      this.status = init?.status || 200;
      this._body = body;
    }
    json() { return Promise.resolve(JSON.parse(this._body || '{}')) }
    static json(data: any, init?: any) {
      return new Response(JSON.stringify(data), init);
    }
  } as any;
}

// Mock BroadcastChannel for MSW in JSDOM environment
if (typeof BroadcastChannel === 'undefined') {
  class BroadcastChannelMock {
    constructor(name: string) {
      // console.log(`BroadcastChannelMock: ${name} created`);
    }
    postMessage(message: any) {
      // console.log(`BroadcastChannelMock: message posted: ${message}`);
    }
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
      // console.log(`BroadcastChannelMock: addEventListener: ${type}`);
    }
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) {
      // console.log(`BroadcastChannelMock: removeEventListener: ${type}`);
    }
    close() {
      // console.log('BroadcastChannelMock: closed');
    }
  }
  (global as any).BroadcastChannel = BroadcastChannelMock;
}

// Ensure tests use in-memory state store and demo fallbacks by default
process.env.STATE_DRIVER = process.env.STATE_DRIVER || 'memory'
process.env.DEMO_MODE = process.env.DEMO_MODE || 'true'
process.env.KILL_SWITCH = '0'
// Ensure MINTER_SECRET_KEY is unset by default in tests
if (process.env.MINTER_SECRET_KEY) delete process.env.MINTER_SECRET_KEY

// Mock Solana tools to avoid network during tests
jest.mock('agents/tools/solana', () => ({
  simulateTx: jest.fn(async () => ({ ok: true, estFeeLamports: 5000, riskScore: 0.12, network: 'devnet', txB64: 'AQID' })),
  executeReward: jest.fn(async () => ({ txSig: 'test-devnet-txsig' })),
}))
