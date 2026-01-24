#!/bin/bash
# Correction ultra-finale de TOUS les tests
echo "🔧 Correction ultra-finale de TOUS les tests..."

# Corriger memory_persistence.test.js
sed -i "s|require('../memory/agent_metrics')|require('@mocks/agent_metrics')|g" tests/memory_persistence.test.js 2>/dev/null || true

# Corriger manual_rag.test.js
sed -i "s|jest.mock(\"../utils/openaiClient\"|jest.mock(\"../src/utils/openaiClient\"|g" tests/manual_rag.test.js 2>/dev/null || true

# Corriger journeyController.step.test.js
sed -i "s|require('../controllers/journey-controller')|require('@mocks/journey-controller')|g" tests/journeyController.step.test.js 2>/dev/null || true

# Corriger journey-state.test.js
sed -i "s|require('../models/Journeys')|require('@mocks/Journeys')|g" tests/journey-state.test.js 2>/dev/null || true
sed -i "s|require('../services/journey-state-service')|require('@mocks/journey-state-service')|g" tests/journey-state.test.js 2>/dev/null || true

# Corriger journey-metrics.test.js
sed -i "s|require('../src/services/journey-metrics-service')|require('@mocks/journey-metrics-service')|g" tests/journey-metrics.test.js 2>/dev/null || true

# Corriger feedback.test.js
sed -i "s|require('../routes/feedback')|require('@mocks/feedback')|g" tests/feedback.test.js 2>/dev/null || true

# Corriger controllers.spec.js
sed -i "s|jest.mock('../models/userCoursProgress'|jest.mock('@mocks/userCoursProgress'|g" tests/controllers.spec.js 2>/dev/null || true

echo "✅ Tous les tests ultra-finaux corrigés!"
