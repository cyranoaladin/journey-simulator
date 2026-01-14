/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const DEFAULT_PRICING = {
  'gpt-4o': { prompt: 0.0000025, completion: 0.00001 }, // USD per token mock
  'mock-llm': { prompt: 0, completion: 0 },
};

function estimateCall({ model = 'gpt-4o', promptTokens = 0, completionTokens = 0 }) {
  const pricing = DEFAULT_PRICING[model] || DEFAULT_PRICING['gpt-4o'];
  const cost = promptTokens * pricing.prompt + completionTokens * pricing.completion;
  return { cost, pricing };
}

function aggregateCosts(runs = []) {
  const byAgent = {};
  let total = 0;
  runs.forEach((r) => {
    const model = r.llm?.model || 'gpt-4o';
    const tokensUsed = r.llm?.tokensUsed ?? 50; // minimal default value
    const { cost } = estimateCall({ model, promptTokens: tokensUsed, completionTokens: 0 });
    total += cost;
    if (!byAgent[r.agentId]) byAgent[r.agentId] = { cost: 0, model, calls: 0 };
    byAgent[r.agentId].cost += cost;
    byAgent[r.agentId].calls += 1;
  });
  return { total, byAgent };
}

function evaluateBudget({ totalCost, budgetUsd }) {
  if (budgetUsd == null) return { status: 'OK', budgetUsd: null };
  if (totalCost <= budgetUsd * 0.8) return { status: 'OK', budgetUsd };
  if (totalCost <= budgetUsd) return { status: 'WARN', budgetUsd };
  return { status: 'BLOCK', budgetUsd };
}

function summary() {
  return { pricing: DEFAULT_PRICING };
}

module.exports = {
  estimateCall,
  aggregateCosts,
  evaluateBudget,
  summary,
};
