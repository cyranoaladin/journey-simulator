<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

### Suivi éradication issues Sonar (rapport 30/12/2025)

- [ ] CRITICAL (à traiter en priorité)
- [x] zynoVerticalSlice.js (complexité < 15)
    - [x] ragService extrait
    - [x] scoringService extrait
    - [x] executionService extrait
    - [x] Lot 3 purge finale (squelette + variables mortes)
  - [x] MainNavigation.tsx (complexité < 15)
  - [x] ZynoConsole.tsx (complexité < 15)
  - [ ] useOptimizedLoading.ts (complexité < 15)
  - [x] agents.test.js (complexité < 15)
  - [x] journeyStore.ts (complexité < 15)
  - [ ] mf-back scripts/tests (check-rag-connection.js, agents.test.js)
- [ ] MAJOR (ternaires, spacing, aria, duplication, optional chaining, vars inutiles)
  - [x] zynoOrchestrator.js (ternaires)
  - [x] zynoVerticalSlice.js (assign inutiles, ternaires)
  - [ ] ResourceUploader.tsx / MissionFeedbackSummary.tsx / WalletFaucetButton.tsx / ProofCertificationsBoard.tsx / DashboardZyno.tsx / JourneySimulationMode.tsx / PhaseDetails.tsx / JourneyLayout.tsx / ResourceHub.tsx / JourneyWorkspace.test.tsx / WalletStatusDisplay.tsx / etc.
  - [ ] mf-back tests/scripts (agents.test.js doublons/ternaires, run_agent.js top-level await, scripts check)
- [ ] MINOR / INFO (globalThis, node: prefixes, replaceAll, assertions inutiles, Twitter/LinkedIn, TODO)
  - [x] Remplacer window → globalThis, fs → node:fs, path → node:path, replace → replaceAll
  - [ ] Nettoyer assertions inutiles, negations, fragments, params catch renommés
  - [ ] Renommer interfaces/type alias (mf-back-client.ts)

Note : Ne pas relancer l’audit avant que toutes les cases soient cochées.
