# Deployment Guide

This document describes how to run the Journey simulator backend (`mf-back`) locally with Docker and how to build images for deployment.

## Prerequisites

- Docker Engine 24+ and Docker Compose plugin (`docker compose` CLI)
- Optional: Node.js 20 LTS if you want to run commands outside of containers

## Environment Variables

The backend requires the following variables:

| Variable | Description | Default in `docker-compose.yml` |
| --- | --- | --- |
| `MONGO_URI` | MongoDB connection string | `mongodb://mongo:27017/journey` |
| `ADMIN_API_KEY` | Shared secret for admin routes | `change-me` |
| `PORT` | Express HTTP port | `3000` |

Create an `.env` file inside `mf-back/` when running outside Docker. The container setup already injects safe defaults for local development.

## Local Development (Docker)

```bash
chmod +x start_dev.sh
./start_dev.sh
```

The script builds the backend image with development dependencies and starts two services:

- `api`: Express server with hot reload (`npm run dev`)
- `mongo`: MongoDB 6 with a health check

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
