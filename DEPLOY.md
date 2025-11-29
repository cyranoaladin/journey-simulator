# Deployment Guide for journey.mfai.app

This guide explains how to deploy the Money Factory AI Journey Simulator on a dedicated server alongside existing projects without conflicts.

## 1. Architecture & Isolation

To avoid conflicts with the existing local RAG project, we use:
- **Docker Containers**: All services are isolated in containers with unique names (`mfai-api`, `mfai-web`, `mfai-mongo`, `mfai-postgres`).
- **Custom Ports**:
  - Backend: `3002` (Host) -> `3002` (Container)
  - Frontend: `3003` (Host) -> `80` (Container)
  - Mongo: `27018` (Host) -> `27017` (Container)
  - Postgres: `5435` (Host) -> `5432` (Container)

## 2. Prerequisites

Ensure the server has:
- Docker & Docker Compose installed.
- Nginx (as a reverse proxy).
- A domain pointing to the server IP (`journey.mfai.app`).

## 3. Deployment Steps

### Step 1: Clone & Configure
1. Clone the repository to the server.
2. Copy the example environment file:
   ```bash
   cp .deploy.env.example .deploy.env
   ```
3. Edit `.deploy.env` and add your real API keys (OpenAI, etc.).

### Step 2: Launch Services
Run the deployment compose file:
```bash
docker compose -f docker-compose.deploy.yml up -d --build
```

### Step 3: Configure Nginx
Create a new Nginx configuration file (e.g., `/etc/nginx/sites-available/journey.mfai.app`):

```nginx
server {
    server_name journey.mfai.app;

    # Frontend Proxy
    location / {
        proxy_pass http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API Proxy
    location /api {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Remove /api prefix if your backend expects paths without it
        # rewrite ^/api/(.*) /$1 break; 
    }
}
```

Enable the site and restart Nginx:
```bash
ln -s /etc/nginx/sites-available/journey.mfai.app /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## 4. Verification
- Visit `https://journey.mfai.app`.
- Check logs if needed: `docker compose -f docker-compose.deploy.yml logs -f`.
