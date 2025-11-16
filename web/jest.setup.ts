import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfill for libs requiring TextEncoder/TextDecoder (e.g., noble)
;(global as any).TextEncoder = TextEncoder
;(global as any).TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder

