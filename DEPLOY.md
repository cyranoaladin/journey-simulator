# Deployment Guide

This repository supports two distinct deployment modes. Do NOT mix them on the same environment.

## Mode A: VPS + PM2 (Bare Metal)

Best for: High performance, direct control, simple VPS environments (Ubuntu/Debian).

### Prerequisites
- Node.js 18+
- NPM
- PM2 (`npm install -g pm2`)
- MongoDB & Postgres running (or external URIs)

### How to Deploy
1. Configure `.deploy.env` with secrets.
2. Run the deployment script:
   ```bash
   ./scripts/deploy_pm2.sh
   ```
   This will:
   - Pull latest code.
   - Install dependencies.
   - Build frontend & backend.
   - Restart services via `ecosystem.config.cjs`.

### Process Management
- Logs: `pm2 logs`
- Status: `pm2 status`
- Restart: `pm2 restart all`

---

## Mode B: Docker Compose

Best for: Portable deployments, CI/CD pipelines, local dev with full stack.

### Prerequisites
- Docker & Docker Compose

### How to Deploy
1. Configure `.deploy.env` or `.env`.
2. Run the deployment script:
   ```bash
   ./scripts/deploy_docker.sh
   ```
   This will:
   - Build Docker images (using `docker-compose.prod.yml` overrides for production settings).
   - Start containers in detached mode.

### Services
- `api`: Backend (Port 3002 -> 3000 internal)
- `journey-web`: Frontend (Port 3003 -> 80 internal)
- `mongo`, `postgres`: Databases

### Management
- Logs: `docker-compose logs -f`
- Stop: `docker-compose down`

---

## ⚠️ DOs and DON'Ts

- **DO** use PM2 for bare metal deployments.
- **DO** use Docker for containerized environments.
- **DON'T** run PM2 inside Docker containers. The Docker images are configured to run `npm start` (node) directly.
- **DON'T** mix modes. If you switch, stop one before starting the other to avoid port conflicts.
