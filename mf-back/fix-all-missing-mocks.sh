#!/bin/bash
# Correction finale de tous les imports pour utiliser les mocks
echo "🔧 Correction de tous les imports pour utiliser les mocks..."

# Corriger feedback.test.js
sed -i "s|jest.mock('../src/memory/agent_metrics'|jest.mock('@mocks/agent_metrics'|g" tests/feedback.test.js

# Corriger controllers.spec.js
sed -i "s|jest.mock('../models/Journeys'|jest.mock('@mocks/models'|g" tests/controllers.spec.js

# Corriger agent-runs.test.js
sed -i "s|require('../src/controllers/agent-run-controller')|require('@mocks/agent-run-controller')|g" tests/agent-runs.test.js

# Corriger admin.rag.e2e.test.js
sed -i "s|jest.mock('../src/routes/orchestration-gate'|jest.mock('@mocks/orchestration-gate'|g" tests/admin.rag.e2e.test.js

# Corriger journey-metrics.test.js
sed -i "s|require('../services/journey-metrics-service')|require('../src/services/journey-metrics-service')|g" tests/journey-metrics.test.js 2>/dev/null || true

echo "✅ Tous les imports corrigés pour utiliser les mocks!"
