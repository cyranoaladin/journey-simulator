# CI/CD pipeline

- Node 20, npm ci
- Lint, Build
- Unit tests + coverage report (backend ≥85% recommandé)
- Playwright E2E (retain-on-failure)
- Docker build (multi-stage) + Trivy scan
- Release on SemVer tag vX.Y.Z (artifacts attached)
