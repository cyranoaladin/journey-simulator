#!/bin/bash

# Journey Simulator Deployment Script
# Usage: ./scripts/deploy.sh [staging|production]

set -e

ENV=${1:-staging}
APP_NAME="journey-simulator"
REGISTRY="ghcr.io/cyranoaladin"

echo "🚀 Deploying $APP_NAME to $ENV..."

# Build image
echo "📦 Building image..."
docker build -t $REGISTRY/$APP_NAME:latest journey-simulator/web

# Push to registry
echo "📤 Pushing to registry..."
docker push $REGISTRY/$APP_NAME:latest

# Deploy with docker-compose
echo "🐳 Deploying with docker-compose..."

if [ "$ENV" == "production" ]; then
    docker-compose -f docker-compose.prod.yml pull
    docker-compose -f docker-compose.prod.yml up -d
    echo "✅ Production deployment complete"
else
    docker-compose -f docker-compose.yml pull
    docker-compose -f docker-compose.yml up -d
    echo "✅ Staging deployment complete"
fi

# Health check
echo "🏥 Health check..."
for i in {1..30}; do
    if curl -f http://localhost:3001/api/health 2>/dev/null; then
        echo "✅ App is healthy"
        break
    fi
    echo "Waiting... ($i/30)"
    sleep 1
done

echo "✅ Deployment complete!"
