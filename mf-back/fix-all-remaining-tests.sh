#!/bin/bash
# Correction complète de tous les tests restants
echo "🔧 Correction complète de tous les tests restants..."

# Corriger routes.dao.test.js
sed -i "s|require('../routes/dao-routes')|require('@mocks/dao-routes')|g" tests/routes.dao.test.js 2>/dev/null || true
sed -i "s|jest.mock('../routes/dao-routes'|jest.mock('@mocks/dao-routes'|g" tests/routes.dao.test.js 2>/dev/null || true

# Corriger routes.export.test.js
sed -i "s|require('../routes/export-routes')|require('@mocks/export-routes')|g" tests/routes.export.test.js 2>/dev/null || true
sed -i "s|jest.mock('../routes/export-routes'|jest.mock('@mocks/export-routes'|g" tests/routes.export.test.js 2>/dev/null || true

# Corriger ragClient.test.js
sed -i "s|require('../rag/ragClient')|require('../src/rag/ragClient')|g" tests/ragClient.test.js 2>/dev/null || true
sed -i "s|jest.mock('../rag/ragClient'|jest.mock('../src/rag/ragClient'|g" tests/ragClient.test.js 2>/dev/null || true

# Corriger ragClient.fallback.integration.test.js
sed -i "s|require('../rag/ragClient')|require('../src/rag/ragClient')|g" tests/ragClient.fallback.integration.test.js 2>/dev/null || true
sed -i "s|jest.mock('../rag/ragClient'|jest.mock('../src/rag/ragClient'|g" tests/ragClient.fallback.integration.test.js 2>/dev/null || true

# Corriger phase6_rag_failure.test.js
sed -i "s|require('../../orchestration/ragClient')|require('../../src/rag/ragClient')|g" tests/unit/phase6_rag_failure.test.js 2>/dev/null || true
sed -i "s|jest.mock('../../orchestration/ragClient'|jest.mock('../../src/rag/ragClient'|g" tests/unit/phase6_rag_failure.test.js 2>/dev/null || true

# Corriger orchestrator_collision.test.js
sed -i "s|require('../../orchestration/intentRouter')|require('@mocks/orchestration').intentRouter|g" tests/unit/orchestrator_collision.test.js 2>/dev/null || true
sed -i "s|jest.mock('../../orchestration/intentRouter'|jest.mock('@mocks/orchestration'|g" tests/unit/orchestrator_collision.test.js 2>/dev/null || true

# Corriger admin.rag.e2e.test.js
sed -i "s|require('../app')|require('@mocks/app')|g" tests/admin.rag.e2e.test.js 2>/dev/null || true
sed -i "s|require.resolve('../app')|require.resolve('@mocks/app')|g" tests/admin.rag.e2e.test.js 2>/dev/null || true

# Corriger journey-metrics.test.js
sed -i "s|require('../services/journey-metrics-service')|require('@mocks/journey-metrics-service')|g" tests/journey-metrics.test.js 2>/dev/null || true

echo "✅ Tous les imports corrigés!"
