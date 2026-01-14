<!-- Multi-Agent Orchestration & Simulation Platform | 2026 -->

# 🏭 Money Factory AI - Monorepo

![Build Status](https://img.shields.io/badge/build-passing-brightgreen) ![Test Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen) ![License](https://img.shields.io/badge/license-Private-red) ![Status](https://img.shields.io/badge/status-production--ready-blue)

**Money Factory AI** is a high-performance, decentralized simulation environment and orchestration engine for Web3. It combines advanced **AI Agents**, **Solana Blockchain** integration, and **RAG (Retrieval-Augmented Generation)** to guide users through the "Cognitive Activation Protocol" and beyond.

This monorepo houses the complete ecosystem: the Journey Simulator (Frontend), the Web Portal (NFT/Minting), and the Backend Orchestrator.

---

## 🏗️ System Architecture

The platform follows a modern micro-service architecture, split into three primary pillars:

| Component | Directory | Tech Stack | Description |
|-----------|-----------|------------|-------------|
| **Journey Simulator** | [`journey-simulator`](./journey-simulator) | React 19, Vite, Zustand, Tailwind | The core interactive experience. Users interact with AI agents, track progress, and complete "Journeys". |
| **Web Portal** | [`web`](./web) | Next.js 14, Prisma, PostgreSQL | The public facing portal. Handles NFT minting, user dashboard, DAO governance, and marketing pages. |
| **Backend API** | [`mf-back`](./mf-back) | Express, MongoDB, OpenAI, RAG | The central brain. Orchestrates 20+ AI agents, manages vector search (RAG), and handles auth/session logic. |

> 📘 **Deep Dive**: See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for detailed diagrams and data flow.

---

## 🚀 Key Features

### 🤖 AI Orchestration (Zyno Core)
- **Multi-Agent System**: specialized agents for Coaching, Pitch Deck creation, Market Research, and DAO Governance.
- **RAG Powered**: Agents have access to a vast library of "Cognitive Activation" knowledge via vector search.
- **Context Awareness**: Agents remember user progress and tailor advice accordingly.

### ⛓️ Web3 & Solana
- **Wallet Integration**: Seamless connection with Phantom, Backpack, and Solflare.
- **NFT Access**: "Passes" (e.g., Genesis Cognition Pass) are minted as NFTs to unlock system features.
- **On-Chain Governance**: DAO integration for community decision making.

### 🛡️ Compliance & Quality (R-Series)
- **R1 (Language)**: Strict adherence to English-only UI.
- **R2 (Guidance)**: Mandatory user guide restoration and clarity.
- **R3 (Reliability)**: Zero-defect policy enforced by rigorous E2E testing (Playwright).

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Docker**: For running databases (MongoDB, PostgreSQL, Redis)
- **Git**: For version control

### 1. Installation
Clone the repo and install dependencies for **all** workspaces:

```bash
# Install root dependencies
npm install

# Install dependencies for Backend, Simulator, and Web
npm run install:all
```

### 2. Environment Setup
Create `.env` files in each directory based on the examples:
- `mf-back/.env` (needs OpenAI Key, MongoDB URI)
- `journey-simulator/.env` (needs Solana RPC, Backend URL)
- `web/.env` (needs Database URL, Redis URL)

### 3. Start the Stack (Monorepo Mode)
The recommended way to develop is running all services concurrently:

```bash
npm run dev
```
> This command starts:
> - **Backend API** at `http://localhost:3002`
> - **Journey Simulator** at `http://localhost:3000`
> - **Web Portal** at `http://localhost:3001` (or 3010 depending on config)

### 4. Alternative: Docker Start
For a production-like environment (with DBs included):
```bash
make up
# OR
./artifacts/start_stack.sh
```

---

## 🧪 Testing & Validation

We enforce a sophisticated testing pyramid.

| Scope | Command | Description |
|-------|---------|-------------|
| **Unit Tests** | `npm run test:all` | Runs Jest/Vitest across all workspaces. |
| **E2E (Simulator)** | `npm run test:e2e:simulator` | Playwright tests for user flows. |
| **Compliance** | `npm run compliance:check` | Scans for R1 (Language) violations. |
| **Full QA** | `npm run qa:full` | Runs the "Supreme Audit" (Unit + E2E + Compliance). |

---

## 📚 Documentation Map

The [`docs/`](./docs) folder is the source of truth for all project details.

- **Architecture**: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- **API Spec**: [`docs/API_CONTRACT_MF_BACK.md`](./docs/API_CONTRACT_MF_BACK.md)
- **Security**: [`docs/SECURITY.md`](./docs/SECURITY.md)
- **Solana Spec**: [`docs/solana_spec.md`](./docs/solana_spec.md)
- **Agents**: [`docs/cahier_charges_agents.md`](./docs/cahier_charges_agents.md)

---

## 🤝 Contributing

1.  **Branching**: Use `feature/` or `fix/` prefixes.
2.  **Commits**: Use semantic commits (e.g., `feat: add new agent`, `fix: resolve proxy timeout`).
3.  **Hooks**: Husky hooks will block commits that fail linting or unit tests.

---

## 👥 Contributors

**Money Factory AI Team**
*   **Alaeddine BEN RHOUMA** - Architect & Lead
*   **Kamel BEN RHOUMA** - Strategy & Operations
*   **Adem BELHAJAISSA** - QA & Backend

---

© 2026 Money Factory AI. All rights reserved.
