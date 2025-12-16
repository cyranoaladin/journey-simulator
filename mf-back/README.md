# Money Factory AI - Backend API (mf-back)

The core backend service for Money Factory AI, responsible for agent orchestration, user management, and journey execution state.

## Role & Scope

-   **Agent Orchestration**: Hosts the Zyno Orchestrator and specialized AI agents.
-   **Execution State**: Tracks the detailed progress of user journeys in MongoDB.
-   **Authentication**: Issues JWTs and manages shadow user accounts for simulator access.
-   **RAG**: Handles document ingestion and retrieval for context-aware responses.

## AEPO / AECO (Unified Definitions)

Zyno operates two complementary orchestration layers that appear in logs, metrics, and API payloads:

- **AEPO (AI-Enhanced Pathway Orchestration)**: the intelligent engine that creates and manages **personalized user pathways** (milestones, deliverables, next actions). It adapts to user context, skills, intent, and progression, and triggers the appropriate Zyno agents for a single user journey.
- **AECO (AI-Enhanced Cohort Orchestration)**: the orchestration system that manages **cohort / group programs** (bootcamps, accelerators, DAO formations). It synchronizes shared milestones, structures peer reviews, and powers group dashboards—always driven by Zyno.

Developer note (MVP implementation detail):

- **AEPO in `mf-back`** is currently logged as a **per-agent execution signal** (duration/success/retries → `aepoScore`) that feeds pathway decisions.
- **AECO in `mf-back`** is currently logged as a **feedback/cohort signal** (user rating/comment), designed to evolve into cohort analytics (peer review, team readiness, shared milestones).

AEPO vs AECO (summary):

| Feature | AEPO | AECO |
| --- | --- | --- |
| Scope | Individual | Cohort / Group |
| Entry point | Journey onboarding, solo builder | Bootcamps, DAO accelerators |
| Output | Personalized roadmap + rewards | Shared milestones + dashboards |

### Concrete Examples (Investor & Developer View)

#### Example A — Solo Builder (AEPO)

- **Scenario**: a single builder starts a persona journey (Learn → Build → Prove → Activate → Scale).
- **AEPO role**: Zyno generates and updates a **personal roadmap**:
  - detects intent (`product_build`, `token_launch`, `launch_dao`, etc.)
  - triggers the right agents (Builder, Product, Dev, Audit, Tokenomics, Legal…)
  - returns a timeline + structured outputs (tasks, deliverables, recommendations)
  - logs an **AEPO execution signal** per agent (quality/latency/success → `aepoScore`)

#### Example B — Cohort Bootcamp / DAO Accelerator (AECO)

- **Scenario**: a group enters a “DAO Proposal Bootcamp” program with shared milestones.
- **AECO role**: Zyno coordinates **cohort dynamics**:
  - synchronizes milestone checkpoints across members
  - structures peer reviews + collective retrospectives with agent support
  - produces cohort dashboards (group readiness, shared deliverables, governance alignment)
  - logs **AECO signals** (today: feedback/rating/comment; later: cohort analytics)

### Sample `/orchestration` Response (Annotated)

Below is a simplified response shape showing how observers can interpret AEPO/AECO in payloads.

```json
{
  "intent": "product_build",
  "mode": "sequential",
  "executedAgents": ["BuilderAgent", "ProductAgent"],
  "results": {
    "BuilderAgent": {
      "agent": "BuilderAgent",
      "reasoning": "Prioritize MVP scope and architecture primitives.",
      "action": "Propose sprint plan + technical stack decisions.",
      "output": { "sprints": ["S1: scaffold", "S2: auth", "S3: mint queue"] },
      "feedback": {
        "aepo": 89,
        "aeco": null,
        "ae_summary": "Sprint plan generated",
        "ae_outcome": "MVP scope validated"
      }
    }
  },
  "timeline": [
    {
      "agent": "BuilderAgent",
      "intent": "product_build",
      "status": "completed",
      "durationMs": 842,
      "summary": "Sprint plan generated…",
      "feedback": {
        "aepo": 89,
        "aeco": null
      }
      // AEPO note: this per-agent aepo score is an execution signal feeding the pathway engine.
    }
  ],
  "timestamp": "2025-12-16T18:30:00.000Z",
  "meta": {
    "orchestration": {
      "AEPO": {
        "acronym": "AEPO",
        "name": "AI-Enhanced Pathway Orchestration",
        "tooltip": "AEPO builds and updates a personalized roadmap…"
      },
      "AECO": {
        "acronym": "AECO",
        "name": "AI-Enhanced Cohort Orchestration",
        "tooltip": "AECO coordinates cohort programs…"
      },
      "table": [
        { "feature": "Scope", "aepo": "Individual", "aeco": "Cohort / Group" }
      ]
    }
  }
}
```

Interpretation guide:
- **AEPO**: watch `feedback.aepo` (per-agent execution signal) + the agent outputs (roadmap, deliverables).
- **AECO**: in MVP it is primarily a feedback signal (rating/comment) and will expand to cohort-level analytics.

## Requirements

-   Node.js 18+
-   MongoDB (local or Atlas)
-   `tweetnacl`, `bs58` (for wallet auth)

## Common Commands

| Command | Description |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server with nodemon |
| `npm start` | Start production server |
| `npm test` | Run Jest tests (unit/integration) |

## API Integration

-   **Base URL**: `http://localhost:3000` (default dev)
-   **Consumers**:
    -   `journey-simulator`: Main consumer for interactive journeys.
    -   `web` (optional): May consume agent stats or logs.

## Environment Variables

See `.env.example` for full list. Key vars:
-   `MONGO_URI`: Connection string.
-   `JWT_SECRET`: Security key for tokens.
-   `ENABLE_STRICT_WALLET_LOGIN`: Set to `true` to enforce signature verification.
