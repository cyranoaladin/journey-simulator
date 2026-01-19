/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setupIgnoreExtensionErrors } from '../ignoreExtensionErrors'

// Ensure dev mode for this suite
beforeEach(() => {
  (import.meta as any).env = { ...(import.meta as any).env, DEV: true }
  globalThis.localStorage?.removeItem('debug:allow-extension-errors')
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('setupIgnoreExtensionErrors', () => {
  it('ignores errors coming from browser extensions (chrome-extension://)', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

    const teardown = setupIgnoreExtensionErrors()

    const evt = new ErrorEvent('error', {
      filename: 'chrome-extension://abcdef/content.js',
      message: 'Injected error from extension',
    })
    window.dispatchEvent(evt)

    expect(infoSpy).toHaveBeenCalled()
    const calls = infoSpy.mock.calls
    const matched = calls.some((args) =>
      String(args[0]).includes('Ignored extension error')
    )
    expect(matched).toBe(true)

    teardown?.()
  })
})