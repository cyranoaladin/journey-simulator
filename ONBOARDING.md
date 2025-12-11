# Onboarding checklist for new contributors

Follow this checklist when you want to contribute code or documentation to this repository.

## Local setup
- [ ] Fork the repository and clone your fork
- [ ] Install Node.js v18+ and npm
- [ ] Run `npm ci` to install dependencies
- [ ] Ensure `npm run lint`, `npm run typecheck` and `npm test` pass locally

## Before opening a PR
- [ ] Ensure your branch name follows pattern `feat/..` or `fix/..`
- [ ] Rebase on top of the latest `main` branch
- [ ] Run `npm run format` to format files
- [ ] Run `npm run lint` and fix reported issues
- [ ] Add or update tests if you change behavior

## PR process
- [ ] Open a PR with a clear title and description
- [ ] Link to related issue(s) if any
- [ ] Be responsive to review comments

## Communication
- [ ] Use issues to discuss large or breaking changes before implementation
