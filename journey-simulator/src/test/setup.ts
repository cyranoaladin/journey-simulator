/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';

if (typeof globalThis.IntersectionObserver === 'undefined') {
	class MockIntersectionObserver implements IntersectionObserver {
		readonly root: Element | Document | null = null;

		readonly rootMargin: string = '0px';

		readonly thresholds: ReadonlyArray<number> = [0];

		constructor(
			private readonly callback: IntersectionObserverCallback,
			public readonly options?: IntersectionObserverInit,
		) {}

		disconnect(): void {
			/* noop for tests */
		}

		observe(target: Element): void {
			this.callback([
				{
					isIntersecting: true,
					target,
					intersectionRatio: 1,
					boundingClientRect: target.getBoundingClientRect(),
					intersectionRect: target.getBoundingClientRect(),
					rootBounds: null,
					time: Date.now(),
				} as IntersectionObserverEntry,
			], this);
		}

		takeRecords(): IntersectionObserverEntry[] {
			return [];
		}

		unobserve(): void {
			/* noop for tests */
		}
	}

	(globalThis as any).IntersectionObserver = MockIntersectionObserver;
}

(globalThis as any).Buffer = Buffer;
Object.defineProperty(globalThis, 'crypto', {
	value: {
		getRandomValues: (arr: Uint8Array) => crypto.randomFillSync(arr),
		randomUUID: () => crypto.randomUUID(),
		subtle: crypto.webcrypto.subtle,
	},
	configurable: true,
});

vi.mock('../hooks/useArtifacts', () => ({
	useArtifacts: () => ({ artifacts: [], loading: false, error: null }),
}));

// Mock fetch to prevent ECONNREFUSED errors in unit tests
globalThis.fetch = vi.fn(() =>
	Promise.resolve({
		ok: true,
		status: 200,
		json: () => Promise.resolve({ success: true, data: {} }),
		text: () => Promise.resolve(''),
		blob: () => Promise.resolve(new Blob()),
		arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
		formData: () => Promise.resolve(new FormData()),
		clone: () => ({ ok: true, status: 200 }) as Response,
		headers: new Headers(),
		redirected: false,
		statusText: 'OK',
		type: 'basic' as ResponseType,
		url: '',
		bodyUsed: false,
		body: null,
	} as Response)
) as any;
