<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# Agent Runs & Observability

## Overview

We have introduced a dedicated logging layer for tracking AI agent executions. This allows us to trace inputs, outputs, success/failure rates, and performance metrics for every agent interaction within a journey.

## Data Model: `AgentRun`

The `AgentRun` table (PostgreSQL) stores a detailed record of each execution.

| Field | Type | Description |
| :--- | :--- | :--- |
| `journeyId` | String | ID of the journey context. |
| `userId` | String | ID of the user triggering the agent. |
| `stepId` | String | Logical step/phase identifier. |
| `agentName` | String | Name of the agent (e.g., "GrowthAgent"). |
| `agentVersion` | String | Semantic version of the agent logic (default: "v1"). |
| `model` | String | LLM model ID used (e.g., "gpt-5.1"). |
| `status` | String | `started` \| `succeeded` \| `failed` |
| `input` | Mixed | Structured prompts and context. |
| `output` | Mixed | Agent response payload. |
| `error` | Mixed | Error details if failed. |
| `durationMs` | Number | Execution time in milliseconds. |
| `createdAt` | Date | Timestamp of run start. |

## Integration

The logging logic is integrated directly into the `BaseAgent` class in `mf-back`.
-   **Start**: When `run()` is called, an `AgentRun` is created with status `started`.
-   **Success**: After LLM response is parsed, the run is updated to `succeeded` with output and duration.
-   **Failure**: If an error occurs, the run is updated to `failed` with error details.

## Observability Endpoints

### List Agent Runs
`GET /api/agents/runs`
-   **Auth**: Protected (Admin/User).
-   **Params**: `journeyId`, `stepId`, `agentName`, `status`, `page`, `limit`.
-   **Response**: Paginated list of runs (input/output hidden by default for list view).

### Get Run Details
`GET /api/agents/runs/:id`
-   **Auth**: Protected.
-   **Response**: Full details including input prompts and output payload.

### Health Check
`GET /api/health`
-   Returns service status, PostgreSQL connection state, and uptime.

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer
