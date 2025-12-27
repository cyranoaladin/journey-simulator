# mf-back API Contract

## Overview

This document outlines the API contract for `mf-back`, the Node.js backend service. The API is formally described using OpenAPI 3.1.

**Spec File**: [docs/openapi/mf-back.openapi.yaml](openapi/mf-back.openapi.yaml)

## Key Areas

### Authentication

- **Wallet Login**: Challenge-Response flow (secure by default).
- **Standard Login**: Email/Password (JWT).
- **Routes**: `/api/user/wallet-challenge`, `/api/user/login-wallet`, `/api/user/login`.

### Journeys

- **Progress**: Tracking user state through phases.
- **Routes**: `/api/journey/user-progress`, `/api/journey/complete-phase`.

### Agents & Observability

- **Runs**: Inspection of agent executions.
- **Routes**: `/api/agents/runs`.

### System

- **Health**: `/api/health`.

## Client Generation

The `journey-simulator` frontend uses a strongly-typed TypeScript client generated from the OpenAPI spec.

**To regenerate the client:**

```bash
cd journey-simulator
npm run generate:api
```

This updates `journey-simulator/src/api/mf-back-client.ts`.

## Usage in Frontend

We use a wrapper `journey-simulator/src/api/mf-back.ts` which provides:

- Automatic `Authorization` header injection.
- Typed helper functions for critical flows (e.g., `auth.loginWithWallet`).

Example:

```typescript
import { auth } from '../api/mf-back';

const { data, error } = await auth.getWalletChallenge(publicKey);
```

---

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer
