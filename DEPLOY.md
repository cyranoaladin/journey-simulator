# Deployment Guide

This document describes how to run the Journey simulator backend (`mf-back`) locally with Docker and how to build images for deployment.

## Prerequisites

- Docker Engine 24+ and Docker Compose plugin (`docker compose` CLI)
- Optional: Node.js 20 LTS if you want to run commands outside of containers

## Environment Variables

All runtime secrets must live in local `.env` files that are **never committed**. Only the `*.env.example` templates remain under version control.

### Backend (`mf-back`)

| Variable | Description | Default in `docker-compose.yml` |
| --- | --- | --- |
| `MONGO_URI` | MongoDB connection string | `mongodb://mongo:27017/journey` |
| `ADMIN_API_KEY` | Shared secret for admin routes | `change-me` |
| `JWT_SECRET` | Symmetric secret used to sign access tokens | _required_ |
| `PORT` | Express HTTP port | `3000` |

Populate these values by copying `mf-back/.env.example` to `mf-back/.env` for local runs. Rotate `JWT_SECRET` and `ADMIN_API_KEY` before deploying.

### Vite Frontend (`journey-simulator`)

| Variable | Description |
| --- | --- |
| `VITE_NOTION_WEBHOOK_URL` | Optional endpoint used by Notion export utilities |

Copy `journey-simulator/.env.example` and provide a target webhook if the export flow is required.

### Next.js App (`journey-simulator/web`)

| Variable | Description | Local default |
| --- | --- | --- |
| `DATABASE_PROVIDER` | Prisma provider (`sqlite` or `postgresql`) | `sqlite` |
| `DATABASE_URL` | Prisma connection string | `file:./prisma/dev.db` |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | Cluster URL exposed to the browser | `https://api.devnet.solana.com` |
| `SOLANA_RPC_URL` | Server-side cluster URL | `https://api.devnet.solana.com` |
| `SENTRY_DSN` | Optional Sentry DSN for full-stack telemetry | _unset_ |
| `MINTER_SECRET_KEY` | Guarded signer secret for NFT minting | _unset_ |
| `KILL_SWITCH` | Disable on-chain execution when set to `1` | `0` |

Use `journey-simulator/web/.env.example` as the base file and adjust `DATABASE_URL` when pointing to Postgres.

## Local Development (Docker)

```bash
chmod +x start_dev.sh
./start_dev.sh
```

The script builds the backend image with development dependencies and starts three core services:

- `api`: Express server with hot reload (`npm run dev`)
- `mongo`: MongoDB 6 with a health check
- `journey-web`: Next.js UI connected to the Prisma database

An optional Postgres service (`postgres`) is available for the Next.js stack. Prisma defaults to SQLite; when Postgres is preferred, update `journey-simulator/web/.env` with `DATABASE_PROVIDER=postgresql` and a `DATABASE_URL` pointing at the container (`postgresql://prisma:prisma@postgres:5432/prisma?schema=public`).

Stop the stack with:

```bash
docker compose down
```

## Running Tests

Execute Jest tests on the host machine:

```bash
make test
```

Or inside the API container when it is running:

```bash
docker compose exec api npm test
```

For the frontend, run the wallet modal Playwright flow before promoting a build:

```bash
npm run test:e2e --prefix journey-simulator
```

> Follow the automated run with a manual wallet regression in Phantom (primary) and Torus (backup) to double-check connection, reconnection, and persisted sessions, keeping an eye on Torus’ pending deprecation warnings.

## Building a Production Image

```bash
make docker-build
```

The resulting image (`journey-mf-back:latest`) installs only production dependencies and runs `npm start` by default. Set concrete values for `MONGO_URI`, `ADMIN_API_KEY`, and `PORT` at runtime:

```bash
docker run -d \
  -e MONGO_URI="mongodb://<mongo-host>:27017/journey" \
  -e ADMIN_API_KEY="<secret>" \
  -e PORT=3000 \
  -p 3000:3000 \
  journey-mf-back:latest
```

## Deploying with Docker Compose

1. Copy `mf-back/`, `docker-compose.yml`, and `start_dev.sh` to the target host.
2. Edit `docker-compose.yml` to set production secrets (never commit real values).
3. Run `docker compose up -d --build`.

Logs can be tailed with:

```bash
docker compose logs -f api
```

## Maintenance Tasks

- Reset containers and volumes: `docker compose down -v`
- Clean dangling resources: `make clean`
- Update dependencies: `npm update --prefix mf-back`

Keep the `.env.example` file in sync with any new variables so deployments remain reproducible.
