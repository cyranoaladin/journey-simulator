🚀 Demo Quick Start (5 commands)

Pre-req: Node.js 18+ and npm installed. Default API port is 3005 (override possible).

1) Install dependencies (root + backend + frontend)
```
npm install && (cd mf-back && npm install) && (cd journey-simulator && npm install)
```

2) Start backend (Express API on port 3005 by default)
```
cd mf-back && npm run dev
```

3) Start frontend (Vite UI)
```
cd ../journey-simulator && npm run dev
```

4) Verify API + demo load works (expects progress in response)
```
API_PORT=${API_PORT:-3005} API_BASE_URL=${API_BASE_URL:-http://127.0.0.1:${API_PORT}} \
curl -s -X POST "${API_BASE_URL}/journey/load-demo" -H "Content-Type: application/json" -d '{"personaId":"capital-foundry"}' | grep -E "progress|completed_phases|total_xp"
```

5) Open the demo UI
```
http://127.0.0.1:3003/journeys/demo
```

What to confirm (human check)
- `/journey/load-demo` returns `progress` (see step 4 output).
- In the UI, demo progression (XP + completed phases) is visible after launching a persona.
- “Demo Mode” is visually visible (badge/label in the Journey workspace).

Port override example
- To force API port 3002, prefix any command that hits the API with: `API_PORT=3002` (e.g. `API_PORT=3002 npm run dev` inside `mf-back`, and step 4 will target 3002).
