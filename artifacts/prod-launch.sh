#!/bin/bash
set -e

# Production Launch Script for Verification
# Generates temporary .env, launches Backend and Frontend.
# Cleans up on exit.

cleanup() {
    echo "🧹 Cleaning up..."
    rm -f mf-back/.env
    pkill -P $$
    echo "✅ Cleanup complete."
}
trap cleanup EXIT INT TERM

echo "🚀 Generating temporary Production Environment..."
cat > mf-back/.env <<EOL
PORT=3002
NODE_ENV=production
MONGO_URI=mongodb://localhost:27017/mfai_prod_test
JWT_SECRET=prod_verification_secret_$(date +%s)
MFAI_ONCHAIN_MODE=connect-only
MFAI_SIMULATION_ONLY=true
ENFORCE_CONNECT_ONLY=true
ALLOWED_ORIGINS=http://localhost:4173,http://127.0.0.1:4173
OPENAI_API_KEY=sk-mock-key-verification
SKIP_OPENAI=false
MFAI_OPENAI_MODEL=gpt-4o-mini
LOG_LEVEL=info
EOL

echo "✅ .env generated."

echo "🚀 Starting Backend (Port 3002)..."
cd mf-back
npm start &
BACKEND_PID=$!
cd ..

echo "⏳ Waiting for Backend health..."
for i in {1..30}; do
    if curl -s http://localhost:3002/health | grep "ok" > /dev/null; then
        echo "✅ Backend is UP and Healthy."
        break
    fi
    sleep 1
done

echo "🚀 Starting Frontend (Preview Port 4173)..."
cd journey-simulator
npm run preview -- --port 4173 &
FRONTEND_PID=$!
cd ..

echo " "
echo "=================================================="
echo "🌟 ENVIRONMENT READY FOR MANUAL VERIFICATION 🌟"
echo "=================================================="
echo "Frontend: http://localhost:4173"
echo "Backend:  http://localhost:3002"
echo "Mode:     Production (Connect-Only)"
echo "Test User: test@mfai.app / MFAITest2026! (if seeded)"
echo " "
echo "Press Ctrl+C to Stop and Clean Up."
echo "=================================================="

wait $BACKEND_PID $FRONTEND_PID
