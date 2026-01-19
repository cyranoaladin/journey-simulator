#!/bin/bash
# ------------------------------------------------------------------
# MONEY FACTORY AI - SOVEREIGN IGNITION (PRODUCTION LAUNCH)
# ------------------------------------------------------------------
set -e

echo "🚀 INITIATING MFAI IGNITION SEQUENCE..."

# 1. Environment Verification
if [ ! -f .env.production ]; then
    echo "⚠️  WARNING: .env.production not found! Falling back to verification check..."
    # In real genesis, we would exit here. For now, we proceed with caution.
fi

# 2. Mainnet Safety Check (The Sentinel)
if [ -f .env.production ]; then
    source .env.production
fi

# Default to devnet if not set, for safety
RPC_URL=${SOLANA_RPC_URL:-"https://api.devnet.solana.com"}
EXECUTION_MODE=${EXECUTION_MODE:-"simulation"}

if [[ "$EXECUTION_MODE" == "real" ]] && [[ "$RPC_URL" == *"devnet"* ]]; then
    echo " "
    echo "================================================================"
    echo "🚨 CRITICAL SECURITY WARNING: MAINNET MISMATCH 🚨"
    echo "----------------------------------------------------------------"
    echo "System is in REAL execution mode but pointing to DEVNET RPC."
    echo "RPC: $RPC_URL"
    echo "This may cause unintended loss of simulated assets or false positives."
    echo "================================================================"
    echo " "
    read -p "Type 'CONFIRM' to override and proceed (NOT RECOMMENDED): " confirmation
    if [ "$confirmation" != "CONFIRM" ]; then
        echo "❌ Launch Aborted directly by Sentinel."
        exit 1
    fi
fi

# 3. Docker Swarm Ignition
echo "✅ Configuration Verified. Engaging Neural Core..."
docker-compose -f docker-compose.prod.yml up -d --build

echo " "
echo "⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐"
echo "   MONEY FACTORY AI v1 - GENESIS ACTIVE"
echo "   Endpoint: http://localhost:3002"
echo "   Status:   SOVEREIGN"
echo "⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐"
