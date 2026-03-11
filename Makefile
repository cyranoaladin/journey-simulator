# Money Factory AI - Makefile
# Standardized commands for development, testing, and deployment

.PHONY: help install dev build test clean deploy docker

# Default target
help:
	@echo "Money Factory AI - Available Commands:"
	@echo ""
	@echo "Setup & Installation:"
	@echo "  make install       Install all dependencies"
	@echo "  make setup         Initial project setup"
	@echo ""
	@echo "Development:"
	@echo "  make dev           Start development environment"
	@echo "  make dev-web       Start web app only"
	@echo "  make dev-api       Start API only"
	@echo ""
	@echo "Build & Deploy:"
	@echo "  make build         Build all applications"
	@echo "  make build-web     Build web app"
	@echo "  make build-api     Build API"
	@echo ""
	@echo "Testing:"
	@echo "  make test          Run all tests"
	@echo "  make test-web      Test web app"
	@echo "  make test-api      Test API"
	@echo "  make test-e2e      Run E2E tests"
	@echo ""
	@echo "Database:"
	@echo "  make db-migrate    Run database migrations"
	@echo "  make db-seed       Seed database"
	@echo "  make db-reset      Reset database"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-dev    Start with Docker (dev)"
	@echo "  make docker-prod   Start with Docker (prod)"
	@echo "  make docker-down   Stop Docker containers"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean         Clean build artifacts"
	@echo "  make lint          Run linters"
	@echo "  make format        Format code"
	@echo "  make security      Run security audit"

# ============================================================================
# Setup & Installation
# ============================================================================

install:
	@echo "📦 Installing dependencies..."
	npm install
	cd apps/web && npm install
	cd apps/api && npm install

setup: install
	@echo "⚙️  Initial setup..."
	cp -n .env.example .env || true
	cp -n apps/web/.env.example apps/web/.env.local || true
	cp -n apps/api/.env.example apps/api/.env || true
	@echo "✅ Setup complete. Edit .env files with your configuration."

# ============================================================================
# Development
# ============================================================================

dev:
	@echo "🚀 Starting development environment..."
	npx concurrently \
		"make dev-api" \
		"make dev-web"

dev-web:
	@echo "🌐 Starting Web app..."
	cd apps/web && npm run dev

dev-api:
	@echo "⚡ Starting API..."
	cd apps/api && npm run dev

# ============================================================================
# Build
# ============================================================================

build: build-api build-web
	@echo "✅ All builds complete"

build-web:
	@echo "🔨 Building Web app..."
	cd apps/web && npm run build

build-api:
	@echo "🔨 Building API..."
	cd apps/api && npm run build

# ============================================================================
# Testing
# ============================================================================

test: test-api test-web
	@echo "✅ All tests complete"

test-web:
	@echo "🧪 Testing Web app..."
	cd apps/web && npm run test:unit

test-api:
	@echo "🧪 Testing API..."
	cd apps/api && npm test

test-e2e:
	@echo "🎭 Running E2E tests..."
	cd apps/web && npm run test:e2e

test-coverage:
	@echo "📊 Running tests with coverage..."
	cd apps/web && npm run test:coverage
	cd apps/api && npm run test:coverage

# ============================================================================
# Database
# ============================================================================

db-migrate:
	@echo "🗄️  Running migrations..."
	cd apps/web && npx prisma migrate dev

db-seed:
	@echo "🌱 Seeding database..."
	cd apps/web && npx prisma db seed

db-reset:
	@echo "⚠️  Resetting database..."
	cd apps/web && npx prisma migrate reset --force

db-generate:
	@echo "🔄 Generating Prisma client..."
	cd apps/web && npx prisma generate

# ============================================================================
# Docker
# ============================================================================

docker-dev:
	@echo "🐳 Starting Docker development environment..."
	docker-compose up --build

docker-prod:
	@echo "🐳 Starting Docker production environment..."
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build

docker-down:
	@echo "🛑 Stopping Docker containers..."
	docker-compose down

docker-clean:
	@echo "🧹 Cleaning Docker containers and volumes..."
	docker-compose down -v --rmi local

# ============================================================================
# Utilities
# ============================================================================

clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf apps/web/.next
	rm -rf apps/web/dist
	rm -rf apps/api/dist
	rm -rf apps/api/logs/*.log
	rm -f *.log
	find . -type d -name "node_modules" -prune -o -type f -name "*.log" -delete

lint:
	@echo "🔍 Running linters..."
	cd apps/web && npm run lint
	cd apps/api && npm run lint

format:
	@echo "✨ Formatting code..."
	cd apps/web && npm run format
	cd apps/api && npm run format

security:
	@echo "🔒 Running security audit..."
	npm audit
	./scripts/security/audit-git-history.sh

prune: clean
	@echo "🗑️  Pruning node_modules..."
	rm -rf node_modules
	rm -rf apps/web/node_modules
	rm -rf apps/api/node_modules

# ============================================================================
# Deployment
# ============================================================================

deploy-check:
	@echo "✅ Pre-deployment checks..."
	make lint
	make test
	make build

deploy: deploy-check
	@echo "🚀 Deploying to production..."
	@echo "Update this target with your deployment process"
	# Add your deployment commands here

# ============================================================================
# Maintenance
# ============================================================================

update-deps:
	@echo "📦 Updating dependencies..."
	npm update
	cd apps/web && npm update
	cd apps/api && npm update

health-check:
	@echo "🏥 Running health checks..."
	curl -f http://localhost:3001/api/health || exit 1
	curl -f http://localhost:3002/healthz || exit 1
	@echo "✅ All services healthy"
