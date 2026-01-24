#!/bin/bash
# Correction finale et complète de TOUS les imports
echo "🔧 Correction finale de TOUS les imports restants..."

# Tests dans le dossier racine tests/
echo "📝 Correction des tests racine..."
find tests -maxdepth 1 -name "*.test.js" -o -name "*.spec.js" | while read file; do
    # Corriger openaiClient
    sed -i "s|jest.mock('../utils/openaiClient'|jest.mock('../src/utils/openaiClient'|g" "$file"
    sed -i "s|require('../utils/openaiClient')|require('../src/utils/openaiClient')|g" "$file"
    
    # Corriger models
    sed -i "s|jest.mock('../models/agent-run'|jest.mock('@mocks/models'|g" "$file"
    sed -i "s|require('../models/agent-run')|require('@mocks/models').AgentRun|g" "$file"
    
    # Corriger orchestration
    sed -i "s|jest.mock('../orchestration/vsliceSchema'|jest.mock('../src/orchestration/vsliceSchema'|g" "$file"
    sed -i "s|require('../orchestration/|require('../src/orchestration/|g" "$file"
    
    # Corriger agents
    sed -i "s|'../agents/|'../src/agents/|g" "$file"
done

# Corriger cache-key.test.js spécifiquement
if [ -f "tests/cache-key.test.js" ]; then
    sed -i "s|require('../utils/agent-idempotence')|require('@mocks/utils').agentIdempotence|g" tests/cache-key.test.js
fi

echo "✅ Tous les imports corrigés!"
