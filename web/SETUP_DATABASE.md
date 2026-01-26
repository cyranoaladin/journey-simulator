# Database Setup Guide

## PostgreSQL Configuration

PostgreSQL is already running on localhost:5432. You need to create the MFAI user and database.

### Option 1: Using the provided SQL script (Recommended)

```bash
sudo -u postgres psql -f web/scripts/setup-postgres.sql
```

### Option 2: Manual setup

```bash
sudo -u postgres psql
```

Then run:

```sql
CREATE USER mfai_user WITH PASSWORD 'mfai_password';
CREATE DATABASE mfai_db OWNER mfai_user;
GRANT ALL PRIVILEGES ON DATABASE mfai_db TO mfai_user;
\c mfai_db
GRANT ALL ON SCHEMA public TO mfai_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO mfai_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO mfai_user;
\q
```

### Option 3: Using Docker Compose (Isolated environment)

If you prefer isolated containers (requires stopping system PostgreSQL/Redis):

```bash
# Stop system services
sudo systemctl stop postgresql redis

# Start containers
docker compose up -d

# Check status
docker compose ps
```

## Running Migrations

Once PostgreSQL is configured:

```bash
cd web
npx prisma migrate dev --name init
```

This will:
- Create all tables defined in `prisma/schema.prisma`
- Generate Prisma Client
- Apply the migration

## Redis Configuration

Redis is already running on localhost:6379. No additional setup needed.

The connection URL is already configured in `.env`:
```
REDIS_URL="redis://localhost:6379"
```

## Verify Setup

```bash
# Check PostgreSQL connection
psql -U mfai_user -h localhost -d mfai_db -c "SELECT version();"

# Check Redis connection  
redis-cli ping

# Check Prisma
cd web
npx prisma studio
```
