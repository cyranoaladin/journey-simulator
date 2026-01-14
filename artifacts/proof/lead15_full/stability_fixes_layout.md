# Layout Stability Fixes (R1.3 Remediation)

## 1. Global CSS Hardening
- **Change**: Injected `* { transition: none !important; animation: none !important; }` via pure Playwright fixture (`hardening.ts`).
- **Target**: All E2E tests (`import ... from 'hardening'`).
- **Reason**: Eliminates layout shifts caused by animations during screenshots/check.

## 2. Stable Locators
- **Change**: Added `data-testid="trinity-layout"` to `Layout.tsx` (Source).
- **Target**: `layout-trinity.spec.ts`.
- **Reason**: Previous locators (`getByRole('article')`) detached during re-renders. `data-testid` on root container is invariant.

## 3. Idempotent Assertions
- **Change**: Added `await page.waitForLoadState('networkidle')` before layout checks.
- **Reason**: Ensures hydration is complete before measuring geometry.

## 4. Font Blocking
- **Change**: Blocked `fonts.googleapis.com` and `fonts.gstatic.com`.
- **Reason**: Prevents "Element is not attached" caused by font-swap layout shifts and Network 215 errors.
