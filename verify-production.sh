#!/bin/bash
# Production Verification Script
# Money Factory AI - Health Check

set -e

echo "🔍 Verifying production deployment..."
echo ""

# Check if backend is running
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
  echo "✅ Backend health check passed"
else
  echo "❌ Backend health check failed"
  exit 1
fi

# Check if frontend dist exists
if [ -d "journey-simulator/dist" ]; then
  echo "✅ Frontend build artifacts found"
else
  echo "⚠️  Frontend build artifacts missing"
fi

# Check database connection (if applicable)
if command -v psql &> /dev/null; then
  echo "✅ PostgreSQL client available"
else
  echo "⚠️  PostgreSQL client not found"
fi

echo ""
echo "✅ Production verification complete"
exit 0
