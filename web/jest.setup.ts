/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'node:util';
import { WritableStream } from 'web-streams-ponyfill';
import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';

if (typeof globalThis.WritableStream === 'undefined') {
  ; (globalThis as any).WritableStream = WritableStream
}

// Polyfill for libs requiring TextEncoder/TextDecoder (e.g., noble)
; (globalThis as any).TextEncoder = TextEncoder
  ; (globalThis as any).TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder

  ; (globalThis as any).Buffer = Buffer

Object.defineProperty(globalThis, 'crypto', {
  value: {
    getRandomValues: (arr: Uint8Array) => crypto.randomFillSync(arr),
    randomUUID: () => crypto.randomUUID(),
    subtle: crypto.webcrypto.subtle,
  },
  configurable: true,
});

// Polyfill for Request/Response in Jest environment
if (typeof Request === 'undefined') {
  globalThis.Request = class Request {
    constructor(input: any, init: any) {
      this.json = async () => (init?.body ? JSON.parse(init.body) : {})
    }
    json() {
      return Promise.resolve({})
    }
  } as any
}
if (typeof Response === 'undefined') {
  globalThis.Response = class Response {
    constructor(body?: any, init?: any) {
      this.status = init?.status || 200
      this._body = body
    }
    json() {
      return Promise.resolve(JSON.parse(this._body || '{}'))
    }
    static json(data: any, init?: any) {
      return new Response(JSON.stringify(data), init)
    }
  } as any
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
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ) {
      // console.log(`BroadcastChannelMock: addEventListener: ${type}`);
    }
    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions
    ) {
      // console.log(`BroadcastChannelMock: removeEventListener: ${type}`);
    }
    close() {
      // console.log('BroadcastChannelMock: closed');
    }
  }
  ; (globalThis as any).BroadcastChannel = BroadcastChannelMock
}

// Ensure tests use in-memory state store and demo fallbacks by default
process.env.STATE_DRIVER = process.env.STATE_DRIVER || 'memory'
process.env.DEMO_MODE = process.env.DEMO_MODE || 'true'
process.env.KILL_SWITCH = '0'
// Ensure MINTER_SECRET_KEY is unset by default in tests
if (process.env.MINTER_SECRET_KEY) delete process.env.MINTER_SECRET_KEY

// Mock fetch to avoid "Property fetch does not exist"
if (typeof globalThis.fetch === 'undefined') {
  globalThis.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    } as any)
  ) as any
}
// Mock NextResponse for all tests to avoid edge-runtime issues with getSetCookie
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server')
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      json: (body: any, init?: any) => {
        return new Response(JSON.stringify(body), {
          status: init?.status || 200,
          headers: {
            'Content-Type': 'application/json',
            ...(init?.headers || {}),
          },
        })
      },
    },
  }
})
