#!/bin/bash
set -euo pipefail

mkdir -p artifacts

# Start Backend
echo "Starting Backend..."
cd mf-back
nohup npm start > ../artifacts/backend_run.log 2>&1 &
BACK_PID=$!
echo "Backend PID: $BACK_PID"
cd ..

# Parse arguments
MODE="dev"
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --mode) MODE="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

# Start Frontend
echo "Starting Frontend in $MODE mode..."
cd journey-simulator
if [ "$MODE" = "preview" ]; then
    nohup npm run preview -- --host 0.0.0.0 --port 3000 > ../artifacts/frontend_run.log 2>&1 &
else
    nohup npm run dev -- --port 3000 > ../artifacts/frontend_run.log 2>&1 &
fi
FRONT_PID=$!
echo "Frontend PID: $FRONT_PID"
cd ..

# Wait for ports
echo "Waiting for ports 3000 and 3002..."
timeout 60 bash -c 'until nc -z localhost 3000 && nc -z localhost 3002; do sleep 2; done' || { echo "FAIL: Ports did not open in 60s"; exit 1; }

echo "Stack is UP!"
