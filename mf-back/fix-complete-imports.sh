#!/bin/bash
# Correction complète et exhaustive de TOUS les imports
echo "🔧 Correction exhaustive de TOUS les imports..."

# Corriger agent-idempotence dans tous les tests
echo "📝 Correction agent-idempotence..."
find tests -name "*.test.js" -o -name "*.spec.js" | while read file; do
    sed -i "s|jest.mock('../utils/agent-idempotence'|jest.mock('@mocks/utils'|g" "$file"
    sed -i "s|require('../utils/agent-idempotence')|require('@mocks/utils').agentIdempotence|g" "$file"
done

# Corriger zynoVerticalSlice
echo "📝 Correction zynoVerticalSlice..."
find tests -name "*.test.js" -o -name "*.spec.js" | while read file; do
    sed -i "s|jest.mock('../orchestration/zynoVerticalSlice'|jest.mock('@mocks/orchestration'|g" "$file"
    sed -i "s|require('../orchestration/zynoVerticalSlice')|require('@mocks/orchestration').zynoVerticalSlice|g" "$file"
done

# Corriger agent-run model
echo "📝 Correction agent-run model..."
find tests -name "*.test.js" -o -name "*.spec.js" | while read file; do
    sed -i "s|const AgentRun = require('@mocks/models')|const { AgentRun } = require('@mocks/models')|g" "$file"
done

echo "✅ Correction exhaustive terminée!"
