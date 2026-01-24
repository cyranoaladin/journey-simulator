#!/bin/bash
# Script final pour corriger TOUS les tests
echo "🔧 Correction finale de TOUS les tests..."

# Corriger admin.rag.e2e.test.js
echo "📝 Correction admin.rag.e2e.test.js..."
sed -i "s|jest.mock('../orchestration/zynoOrchestrator'|jest.mock('../src/orchestration/zynoOrchestrator'|g" tests/admin.rag.e2e.test.js

# Corriger baseAgent_resilience.test.js
echo "📝 Correction baseAgent_resilience.test.js..."
sed -i "s|require('../src/agents/BaseAgent')|require('../src/agents/BaseAgent.js')|g" tests/baseAgent_resilience.test.js

# Corriger agent-idempotence.test.js
echo "📝 Correction agent-idempotence.test.js..."
sed -i "s|const { AgentRun } = require('@mocks/models')|const AgentRun = require('@mocks/models').AgentRun|g" tests/agent-idempotence.test.js
sed -i "s|const { findOrCreateAgentRun } = require('../utils/agent-idempotence')|const { findOrCreateAgentRun } = require('../src/utils/agent-idempotence')|g" tests/agent-idempotence.test.js

# Corriger tous les require('@mocks/...')
echo "📝 Correction des require mocks..."
find tests -name "*.test.js" | while read file; do
    # Simplifier les imports de mocks
    sed -i "s|require('@mocks/models').AgentRun|require('@mocks/models')|g" "$file"
    sed -i "s|require('@mocks/utils').agentIdempotence|require('@mocks/utils')|g" "$file"
done

echo "✅ Tous les tests corrigés!"
