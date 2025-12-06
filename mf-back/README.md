# Money Factory AI - Backend API (mf-back)

The core backend service for Money Factory AI, responsible for agent orchestration, user management, and journey execution state.

## Role & Scope

-   **Agent Orchestration**: Hosts the Zyno Orchestrator and specialized AI agents.
-   **Execution State**: Tracks the detailed progress of user journeys in MongoDB.
-   **Authentication**: Issues JWTs and manages shadow user accounts for simulator access.
-   **RAG**: Handles document ingestion and retrieval for context-aware responses.

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
