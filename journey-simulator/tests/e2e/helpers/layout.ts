/**
 * Layout validation helpers for Phase 2 UX/UI tests
 * Provides utilities for checking dimensions, overlap, and viewport constraints
 */

export interface Rect {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
}

/**
 * Assert that a value is close to a target within tolerance
 */
export function expectCloseTo(actual: number, target: number, tolerance = 6) {
    const diff = Math.abs(actual - target);
    if (diff > tolerance) {
        throw new Error(
            `Expected ${actual} to be within ${tolerance} of ${target}, but difference was ${diff}`
        );
    }
}

/**
 * Assert that two rectangles do not overlap
 */
export function expectNoOverlap(rectA: Rect, rectB: Rect) {
    const overlapX = Math.max(0, Math.min(rectA.right, rectB.right) - Math.max(rectA.left, rectB.left));
    const overlapY = Math.max(0, Math.min(rectA.bottom, rectB.bottom) - Math.max(rectA.top, rectB.top));
    const overlapArea = overlapX * overlapY;

    if (overlapArea > 0) {
        throw new Error(
            `Rectangles overlap with area ${overlapArea}px²\n` +
            `Rect A: (${rectA.left}, ${rectA.top}) to (${rectA.right}, ${rectA.bottom})\n` +
            `Rect B: (${rectB.left}, ${rectB.top}) to (${rectB.right}, ${rectB.bottom})`
        );
    }
}

/**
 * Assert that a rectangle is fully within viewport bounds
 */
export function expectInViewport(rect: Rect, viewportWidth: number, viewportHeight: number) {
    if (rect.left < 0) {
        throw new Error(`Rectangle left edge (${rect.left}) is outside viewport (< 0)`);
    }
    if (rect.top < 0) {
        throw new Error(`Rectangle top edge (${rect.top}) is outside viewport (< 0)`);
    }
    if (rect.right > viewportWidth) {
        throw new Error(`Rectangle right edge (${rect.right}) exceeds viewport width (${viewportWidth})`);
    }
    if (rect.bottom > viewportHeight) {
        throw new Error(`Rectangle bottom edge (${rect.bottom}) exceeds viewport height (${viewportHeight})`);
    }
}

/**
 * Convert DOMRect to our Rect interface
 */
export function domRectToRect(domRect: DOMRect): Rect {
    return {
        left: domRect.left,
        top: domRect.top,
        right: domRect.right,
        bottom: domRect.bottom,
        width: domRect.width,
        height: domRect.height,
    };
}
