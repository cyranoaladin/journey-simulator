<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# Journey State Machine

## Overview

The Journey State Machine introduces an explicit lifecycle for user journeys in `mf-back`. It ensures deterministic transitions between steps and provides hooks for idempotence.

## Journey Model Updates

The `Journey` model has been extended with:

-   `state`: Enum `['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED']` (Default: `IN_PROGRESS`).
-   `currentStepId`: String identifier for the current logical step (Default: `phase-1`).

## Journey State Service

Located at `mf-back/services/journey-state-service.js`.

### API

-   `getJourneyState(journeyId)`: Returns current state and step.
-   `canRunStep(journeyId, stepId)`: Returns boolean indicating if the step is valid to run.
-   `advanceJourneyStep({ journeyId, fromStepId, toStepId, trigger, ... })`: Safely transitions the journey to the next step, ensuring correct previous state.

## Idempotence

Idempotence is handled at the **Agent Run** level.

-   **Key Generation**: A deterministic `idempotencyKey` is generated based on `journeyId`, `stepId`, `agentName`, and input hash (e.g. user submission).
-   **Execution**:
    1.  `findOrCreateAgentRun` checks if a successful run exists for the key.
    2.  If yes, the existing output is returned immediately (Agent is skipped).
    3.  If no, a new run is created (`started`) and the agent executes.
    4.  On success/failure, the run record is updated.

## Integration

-   **BaseAgent**: Automatically handles idempotence checks if an `idempotencyKey` is provided in options.
-   **Journey Controller**: The `submit` endpoint uses this mechanism to prevent duplicate processing of the same submission. It also calls `advanceJourneyStep` upon successful phase completion.

## Frontend Journey Progress UI

The `journey-simulator` frontend visualizes the backend state machine using:
-   `JOURNEY_PHASES`: A typed config mapping backend states to user-friendly phases.
-   `JourneyProgressBar`: Renders the linear progress.
-   `JourneyNextActionsPanel`: Surfaces the current mission/actions based on the phase.

The UI treats the backend state as the source of truth but enriches it with static metadata (tool suggestions, missions) from the persona configuration.

## Journey Metrics & Product Analytics

We calculate aggregate metrics to track product health:
-   **Global Metrics**: Total journeys, completion rates, and agent usage stats.
-   **Per-Journey Metrics**: Detailed stats for a single user journey.

These are exposed via `/api/journeys/metrics` and computed on-demand using Mongo aggregations.

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer
