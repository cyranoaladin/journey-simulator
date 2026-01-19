#!/bin/bash

echo "Starting Absolute Zero Liveness Check..."

# Check Frontend
echo "Checking Journey Simulator (Frontend)..."
FRONTEND_STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000)
if [ "$FRONTEND_STATUS" == "200" ]; then
  echo "✅ Frontend ALIVE (200)"
else
  echo "❌ Frontend FAILED ($FRONTEND_STATUS)"
  exit 1
fi

# Check Backend Health
echo "Checking Neural Core (Backend)..."
BACKEND_STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3002/api/health)
if [ "$BACKEND_STATUS" == "200" ]; then
  echo "✅ Backend ALIVE (200)"
else
  echo "❌ Backend FAILED ($BACKEND_STATUS)"
  exit 1
fi

echo "ABSOLUTE ZERO LIVENESS PASSED."
exit 0
