#!/bin/bash
# Correction finale de tous les modules manquants
echo "🔧 Correction de tous les modules manquants..."

# Corriger feedback.test.js
sed -i "s|jest.mock('../memory/agent_metrics'|jest.mock('../src/memory/agent_metrics'|g" tests/feedback.test.js

# Corriger controllers.spec.js
sed -i "s|jest.mock('../models/user'|jest.mock('@mocks/user'|g" tests/controllers.spec.js

# Corriger baseAgent_resilience.test.js
sed -i "s|require('../src/agents/BaseAgent.js')|require('../src/agents/BaseAgent')|g" tests/baseAgent_resilience.test.js

# Corriger agent-runs.test.js
sed -i "s|require('../controllers/agent-run-controller')|require('../src/controllers/agent-run-controller')|g" tests/agent-runs.test.js

# Corriger admin.rag.e2e.test.js
sed -i "s|jest.mock('../routes/orchestration-gate'|jest.mock('../src/routes/orchestration-gate'|g" tests/admin.rag.e2e.test.js

# Corriger ZynoAgent.js pour callGpt5
sed -i 's|require("../llm/callGpt5")|require("../utils/openaiClient")|g' src/agents/ZynoAgent.js
sed -i 's|callGpt5Responses|callGpt5|g' src/agents/ZynoAgent.js

echo "✅ Tous les modules manquants corrigés!"
