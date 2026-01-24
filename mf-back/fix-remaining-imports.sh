#!/bin/bash
# Script de correction des imports restants dans les tests
# Project: Money Factory AI (MFAI)

echo "🔧 Correction des imports restants..."

# Corriger les imports d'agents
echo "📝 Correction des imports agents..."
find tests -name "*.test.js" -o -name "*.spec.js" | while read file; do
    sed -i "s|require('../../agents/|require('../../src/agents/|g" "$file"
    sed -i "s|require('../agents/|require('../src/agents/|g" "$file"
done

# Corriger les imports de llmClient et openaiClient
echo "📝 Correction des imports llmClient..."
find tests -name "*.test.js" -o -name "*.spec.js" | while read file; do
    sed -i "s|require('../../orchestration/llmClient')|require('../../src/orchestration/llmClient')|g" "$file"
    sed -i "s|require('../../utils/openaiClient')|require('../../src/utils/openaiClient')|g" "$file"
done

# Corriger les imports de workflowMap
echo "📝 Correction des imports workflowMap..."
find tests -name "*.test.js" -o -name "*.spec.js" | while read file; do
    sed -i "s|require('../../orchestration/workflowMap')|require('@mocks/orchestration').workflowMap|g" "$file"
done

echo "✅ Correction des imports restants terminée!"
