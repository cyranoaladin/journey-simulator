#!/bin/bash
# ------------------------------------------------------------------
# MONEY FACTORY AI - LIVENESS PROBE (SOVEREIGN)
# ------------------------------------------------------------------

echo "[*] pinging Money Factory AI (Mainnet Node)..."

# 1. Frontend Check (Port 3000)
if curl -sI http://localhost:3000 | grep "200 OK" > /dev/null; then
    echo "✅ Journey Web .......... [ONLINE]"
else
    echo "❌ Journey Web .......... [OFFLINE/ERROR]"
    exit 1
fi

# 2. Backend Health Check (Port ${PORT:-3002})
BACKEND_PORT=${PORT:-3002}
if curl -s http://localhost:$BACKEND_PORT/health | grep "ok" > /dev/null; then
    echo "✅ Neural Core (API) .... [ONLINE] (Port $BACKEND_PORT)"
else
    echo "❌ Neural Core (API) .... [OFFLINE] (Port $BACKEND_PORT)"
    exit 1
fi

# 3. Production URL Simulation (Optional simulation check)
echo "[*] Simulating external access..."
# In a real deploy, we'd check the domain. Here we just confirm the script ran.
echo "✅ DNS Resolution ....... [SIMULATED]"

echo "------------------------------------------------"
echo "VERDICT: SYSTEM_OPERATIONAL"
exit 0
