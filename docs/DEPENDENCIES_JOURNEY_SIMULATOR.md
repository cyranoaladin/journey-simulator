# Journey Simulator Dependencies & Security

**Date**: 6 December 2025
**Status**: Pending Major Upgrades

## Current Vulnerabilities
`npm audit` reports moderate/high vulnerabilities related to:
-   **Vite**: `esbuild` dependency issues. Requires upgrade to Vite 6+.
-   **jsPDF**: `dompurify` XSS vulnerability. Requires upgrade to jsPDF 3.x.

## Mitigation Strategy
We have decided **NOT** to force upgrade these dependencies on the main branch at this time to avoid destabilizing the simulator.

### Plan
1.  **Isolate Upgrades**: Create a dedicated branch `refactor/simulator-deps`.
2.  **Vite Upgrade**: Bump to latest stable Vite. Fix any config breakages.
3.  **jsPDF Upgrade**: Bump to latest jsPDF. Verify PDF generation (certificates).
4.  **Testing**: Full regression test of the simulator UI and PDF generation.

## interim Security Posture
-   These vulnerabilities primarily affect build-time (esbuild) or specific client-side rendering scenarios.
-   Risk is assessed as **Manageable** for a dev-tool/simulator in the short term.
-   Developers should remain on the internal network or VPN when using the simulator.
