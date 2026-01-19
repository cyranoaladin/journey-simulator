<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->


## 📚 Table of Contents
- [Architecture](#-architecture)
- [Directory Structure](#-directory-structure)
- [Prerequisites & Setup](#-prerequisites--setup)
- [Running the Application](#-running-the-application)
- [Testing & Compliance](#-testing--compliance)
- [Troubleshooting](#-troubleshooting)

---

> [!WARNING]
> **Technical Debt & Maintenance**
> This V1 release ("Genesis") is stable for mainnet deployment. However, please note that approximately **15% of the legacy unit test suite** (specifically pre-Zyno modules) remains technical debt. These tests are currently skipped or deprecated and are scheduled for refactoring in the `v1.1` "Resilience" update. This does not affect runtime production stability.

## 🏛️ Architecture

The system follows a micro-service architecture designed for scalability and fault tolerance.

### System Overview

```mermaid
graph TD
    Client[Frontend (Vite/React)] -->|REST/WebSockets| API[Backend Orchestrator (Express)]
    API -->|Auth/Session| Redis[(Redis Cache)]
    API -->|Persistance| Mongo[(MongoDB)]
    API -->|Vector Search| RAG[RAG Service]
    
    subgraph "Agent Ecosystem"
        API --> Agent1[InvestorDemoAgent]
        API --> Agent2[CoachAgent]
        API --> Agent3[SentinelAgent]
    end

    subgraph "External Integrations"
        RAG --> OpenAI[LLM Provider]
        API --> Solana[Solana RPC]
    end
```

### Key Components

*   **Frontend (`journey-simulator`)**: React 18, Vite, TailwindCSS. Handles user interaction, wallet connection (Solana), and real-time agent feedback.
*   **Backend (`mf-back`)**: Express.js, MongoDB. Orchestrates specialized AI agents, manages user sessions, and handles RAG (Retrieval-Augmented Generation) operations.
*   **Agents**: Specialized modules for Investment Demo, Coaching, and Security Sentinel.

---

## 📂 Directory Structure

```text
journey_mfai_back_front/
├── journey-simulator/       # Frontend Application (React/Vite)
│   ├── src/                 # Source code
│   ├── tests/e2e/           # Playwright End-to-End Tests
│   └── package.json
├── mf-back/                 # Backend Application (Express)
│   ├── agents/              # AI Agent Logic
│   ├── models/              # MongoDB Schemas
│   └── package.json
├── artifacts/               # Build artifacts, logs, and proof scripts
│   ├── proof_lead11.sh      # Main R1/R2 Compliance Proof Script
│   ├── run_r1_1.sh          # Wrapper for robust execution
│   └── start_stack.sh       # Stack startup utility
├── AUDIT.md                 # Audit logs and strategy
└── README.md                # This file
```

---

## 🛠️ Prerequisites & Setup

1.  **Node.js**: v18 or higher.
2.  **MongoDB**: Local instance running on default port (27017) or Docker container.
3.  **Ports**: Ensure ports `3000` (Frontend) and `3002` (Backend) are free.

### Installation

```bash
# Install root dependencies (if any)
npm install

# Install Validation/Proof dependencies
sudo apt-get install netcat-openbsd ripgrep

# Install Sub-project dependencies
(cd mf-back && npm install)
(cd journey-simulator && npm install)
```

---

## 🚀 Running the Application

### Option A: Automated Stack Launch (Recommended)

Use the provided helper script to launch both Backend and Frontend, ensuring correct ports are used.

```bash
chmod +x artifacts/start_stack.sh
./artifacts/start_stack.sh
```

*   **Frontend**: `http://localhost:3000`
*   **Backend**: `http://localhost:3002`

### Option B: Manual Launch

**Backend:**
```bash
cd mf-back
npm start
```

**Frontend:**
```bash
cd journey-simulator
npm run dev -- --port 3000
```

---

## 🛡️ Testing & Compliance

This project enforces a **Zero-Defect Policy** with strict compliance levels.

### R1: English-Only UI
The UI is strictly English. Any French content detection will fail the build.
*   **Verification**: Run `artifacts/run_r1_1.sh` to scan for compliance.

### R2: Guide Restoration
Ensure the User Guide (`GuidePage.tsx`) contains all required sections:
*   NFT Certificates
*   Staking Mechanisms
*   DAO Governance
*   Simulation Mode

### R3: Strict E2E Capabilities
End-to-End tests use Playwright with a custom "Route Tracker" to ensure test coverage is real and not mocked incorrectly.
*   **Run Tests**:
    ```bash
    cd journey-simulator
    npx playwright test
    ```
*   **Full Proof Run**:
    ```bash
    ./artifacts/run_r1_1.sh
    ```
    This script executes the full chain: Build -> Unit Tests -> French Scan -> Connect Only Test -> Full Suite.

---

## 🔧 Troubleshooting

*   **Port Conflicts**: If `start_stack.sh` fails, check if ports 3000/3002 are occupied:
    ```bash
    lsof -i :3000
    lsof -i :3002
    ```
*   **"Connect Wallet" Test Failure**: The `connect-only.spec.ts` may fail if the wallet state persists unpredictably. Ensure `artifacts/start_stack.sh` is restarting fresh instances or clean browser state manually.

---

---

## 🚨 Disaster Recovery (Sovereign Shield)

The system is protected by the **Final Guard Protocol**.

### 1. Emergency Kill-Switch
To instantly halt all neural activity (API & Agents) without taking down the server:
1.  SSH into production server.
2.  Edit `.env.production`: `MFAI_EMERGENCY_STOP=true`.
3.  Restart backend: `docker-compose -f docker-compose.prod.yml restart api`.
4.  **Result**: API returns `503 Service Unavailable` globally.

### 2. Sovereign Snapshot (Backup)
To generate a "Black Box" backup of the entire state:
```bash
./scripts/sovereign-snapshot.sh
```
This produces a strictly timestamped, SHA-256 sealed tarball in `artifacts/backups/`.

---

## ✍️ Signatures

**Certified for Production by:**

*   **Alaeddine BEN RHOUMA** - Architect & Lead Developer
*   **Kamel BEN RHOUMA** - Strategies & Operations
*   **Adem BELHAJAISSA** - QA & Automation Specialist

---

© 2026 Money Factory AI. All rights reserved.
