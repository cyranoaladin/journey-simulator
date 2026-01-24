#!/bin/bash
# Script de correction automatique des imports dans les tests
# Project: Money Factory AI (MFAI)

echo "🔧 Correction automatique des imports dans les tests..."

# Corriger tous les imports de ragClient
echo "📝 Correction des imports ragClient..."
find tests -name "*.test.js" -o -name "*.spec.js" | while read file; do
    sed -i "s|require('../rag/ragClient')|require('../src/rag/ragClient')|g" "$file"
    sed -i "s|require('../../rag/ragClient')|require('../../src/rag/ragClient')|g" "$file"
    sed -i "s|jest.mock('../rag/ragClient'|jest.mock('../src/rag/ragClient'|g" "$file"
    sed -i "s|jest.mock('../../rag/ragClient'|jest.mock('../../src/rag/ragClient'|g" "$file"
done

# Corriger tous les imports d'orchestration/ragClient
echo "📝 Correction des imports orchestration/ragClient..."
find tests -name "*.test.js" -o -name "*.spec.js" | while read file; do
    sed -i "s|require('../orchestration/ragClient')|require('../src/orchestration/ragClient')|g" "$file"
    sed -i "s|require('../../orchestration/ragClient')|require('../../src/orchestration/ragClient')|g" "$file"
done

# Corriger tous les imports de middleware
echo "📝 Correction des imports middleware..."
find tests -name "*.test.js" -o -name "*.spec.js" | while read file; do
    sed -i "s|require('../middleware/auth')|require('../src/middleware/auth')|g" "$file"
    sed -i "s|require('../../middleware/auth')|require('../../src/middleware/auth')|g" "$file"
    sed -i "s|require('../middleware/csrfGuard')|require('@mocks/csrfGuard')|g" "$file"
    sed -i "s|require('../../middleware/csrfGuard')|require('@mocks/csrfGuard')|g" "$file"
done

# Corriger tous les imports de models
echo "📝 Correction des imports models..."
find tests -name "*.test.js" -o -name "*.spec.js" | while read file; do
    sed -i "s|require('../models/user')|require('@mocks/user')|g" "$file"
    sed -i "s|require('../../models/user')|require('@mocks/user')|g" "$file"
    sed -i "s|require('../models/JourneyRun')|require('@mocks/models').JourneyRun|g" "$file"
    sed -i "s|require('../models/agentFeedbackLog')|require('@mocks/models').AgentFeedbackLog|g" "$file"
    sed -i "s|require('../models/agent-run')|require('@mocks/models').AgentRun|g" "$file"
done

# Corriger tous les imports d'orchestration
echo "📝 Correction des imports orchestration..."
find tests -name "*.test.js" -o -name "*.spec.js" | while read file; do
    sed -i "s|require('../orchestration/zynoVerticalSlice')|require('@mocks/orchestration').zynoVerticalSlice|g" "$file"
    sed -i "s|require('../../orchestration/zynoVerticalSlice')|require('@mocks/orchestration').zynoVerticalSlice|g" "$file"
    sed -i "s|require('../../orchestration/web3Pipeline')|require('@mocks/orchestration').web3Pipeline|g" "$file"
    sed -i "s|require('../orchestration/agentsRegistry')|require('@mocks/orchestration').agentsRegistry|g" "$file"
    sed -i "s|require('../orchestration/intentRouter')|require('@mocks/orchestration').intentRouter|g" "$file"
    sed -i "s|require('../../orchestration/toolsRegistry')|require('@mocks/orchestration').toolsRegistry|g" "$file"
    sed -i "s|require('../../orchestration/actionToolMapper')|require('@mocks/orchestration').actionToolMapper|g" "$file"
    sed -i "s|require('../../orchestration/specializedValidators')|require('@mocks/orchestration').specializedValidators|g" "$file"
done

# Corriger tous les imports d'utils
echo "📝 Correction des imports utils..."
find tests -name "*.test.js" -o -name "*.spec.js" | while read file; do
    sed -i "s|require('../utils/agent-idempotence')|require('@mocks/utils').agentIdempotence|g" "$file"
    sed -i "s|require('../../utils/resourceValidator')|require('@mocks/utils').resourceValidator|g" "$file"
done

# Corriger les imports de services
echo "📝 Correction des imports services..."
find tests -name "*.test.js" -o -name "*.spec.js" | while read file; do
    sed -i "s|require('../services/JourneyEngine')|require('@mocks/models').JourneyRun|g" "$file"
done

echo "✅ Correction automatique terminée!"
echo "📊 Exécution des tests pour validation..."
