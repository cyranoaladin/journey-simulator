import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

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

vi.mock('../hooks/useArtifacts', () => ({
	useArtifacts: () => ({ artifacts: [], loading: false, error: null }),
}));
