#!/bin/bash
# Correction finale de tous les imports restants
echo "🔧 Correction finale de tous les imports..."

# Corriger BaseAgent.test.js
sed -i 's|jest.mock("../../rag/ragClient")|jest.mock("../../src/rag/ragClient")|g' tests/unit/BaseAgent.test.js
sed -i 's|jest.mock("../../utils/openaiClient"|jest.mock("../../src/utils/openaiClient"|g' tests/unit/BaseAgent.test.js

# Corriger phase4-contracts.test.js
sed -i 's|require(.../../orchestration/intentRouter.)|require("@mocks/orchestration").intentRouter|g' tests/unit/phase4-contracts.test.js
sed -i 's|require(.../../orchestration/timelineSanitizer.)|require("../../src/orchestration/timelineSanitizer")|g' tests/unit/phase4-contracts.test.js

# Corriger orchestrator_collision.test.js
sed -i "s|jest.mock('../../agents/registry'|jest.mock('../../src/agents/registry'|g" tests/unit/orchestrator_collision.test.js

# Corriger nft_verification.test.js
sed -i "s|jest.mock('../../models/user')|jest.mock('@mocks/user')|g" tests/unit/nft_verification.test.js
sed -i "s|jest.mock('../../utils/solana')|jest.mock('../../src/utils/solana')|g" tests/unit/nft_verification.test.js

# Corriger journeyController.test.js
sed -i "s|jest.mock('../../models/user')|jest.mock('@mocks/user')|g" tests/unit/journeyController.test.js
sed -i "s|jest.mock('../../models/Journeys')|jest.mock('@mocks/models')|g" tests/unit/journeyController.test.js

# Corriger consortium_simulation.test.js
sed -i "s|jest.mock('../../orchestration/agentsRegistry'|jest.mock('@mocks/orchestration'|g" tests/unit/consortium_simulation.test.js

# Corriger computeAEPO.test.js
sed -i "s|require('../../metrics/computeAEPO')|require('../../src/metrics/computeAEPO')|g" tests/unit/computeAEPO.test.js

echo "✅ Tous les imports corrigés!"
