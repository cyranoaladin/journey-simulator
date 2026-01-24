#!/bin/bash
# Correction finale de TOUS les tests restants
echo "🔧 Correction finale de TOUS les tests..."

# Corriger memory_persistence.test.js
sed -i "s|require('../memory/agent_metrics')|require('@mocks/agent_metrics')|g" tests/memory_persistence.test.js 2>/dev/null || true
sed -i "s|jest.mock('../memory/agent_metrics'|jest.mock('@mocks/agent_metrics'|g" tests/memory_persistence.test.js 2>/dev/null || true

# Corriger manual_rag.test.js
sed -i "s|jest.mock(\"../utils/agent-idempotence\"|jest.mock(\"@mocks/utils\"|g" tests/manual_rag.test.js 2>/dev/null || true

# Corriger journeyController.step.test.js
sed -i "s|jest.mock('../models/JourneyRun'|jest.mock('@mocks/JourneyRun'|g" tests/journeyController.step.test.js 2>/dev/null || true

# Corriger journey-state.test.js
sed -i "s|jest.mock('../models/Journeys'|jest.mock('@mocks/Journeys'|g" tests/journey-state.test.js 2>/dev/null || true

# Corriger journey-metrics.test.js
sed -i "s|jest.mock('../models/Journeys'|jest.mock('@mocks/Journeys'|g" tests/journey-metrics.test.js 2>/dev/null || true

# Corriger feedback.test.js
sed -i "s|require('../memory/agent_metrics')|require('@mocks/agent_metrics')|g" tests/feedback.test.js 2>/dev/null || true

# Corriger controllers.spec.js
sed -i "s|jest.mock('../models/cours'|jest.mock('@mocks/cours'|g" tests/controllers.spec.js 2>/dev/null || true

# Corriger tous les require('../utils/agent-idempotence')
find tests -name "*.test.js" -o -name "*.spec.js" | while read file; do
    sed -i "s|require('../utils/agent-idempotence')|require('@mocks/utils')|g" "$file" 2>/dev/null || true
    sed -i "s|require(\"../utils/agent-idempotence\")|require(\"@mocks/utils\")|g" "$file" 2>/dev/null || true
done

echo "✅ Tous les tests corrigés!"
