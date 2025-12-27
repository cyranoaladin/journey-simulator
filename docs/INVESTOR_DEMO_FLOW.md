# Investor Demo Flow

## Overview
The Investor Demo Flow ("Golden Path") allows investors to experience the platform's capabilities through a simulated "Capital Foundry" journey. This flow is opinionated, simplified, and tracked separately from standard user journeys.

## Entry Point
- **URL**: [https://mfai.app/demo/investor](https://mfai.app/demo/investor) (or local equivalent)
- **Deep Link**: Launches `journey-simulator` with `?journey=capital-foundry&mode=investor_demo`

## User Experience
1.  **Landing Page**: A sleek, dark-themed page explaining the demo's purpose.
2.  **Launch**: User clicks "Launch Interactive Demo".
3.  **Simulation**: The simulator loads the "Capital Foundry" persona immediately.
    - **Mode**: `investor_demo` (enables specific UI tweaks if needed).
    - **Narrative**: User acts as an investment strategist using AI agents to build a thesis.
4.  **Completion**: User completes steps, earning simulated XP/Tokens.

## Technical Implementation
### Backend (`mf-back`)
- **AgentRuns**: Stores `journeyMode: 'investor_demo'` in agent execution logs.
- **Metrics**: `JourneyMetricsService` aggregates runs with this mode to track unique sessions.

### Frontend (`web`)
- **Page**: `app/demo/investor/page.tsx`
- **Dashboard**: `app/admin/journeys/metrics` displays "Investor Demo Runs".

### Simulator (`journey-simulator`)
- **Deep Link**: Parses `mode` query param (e.g., `?mode=investor_demo`).
- **Store**: Propagates `mode` to backend API calls (e.g., `runInteractiveStep`).

## Maintenance
- **Healthcheck**: Ensure `NEXT_PUBLIC_SIMULATOR_URL` is set in `web/.env`.
- **Metrics**: Check admin dashboard for usage stats.

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer
