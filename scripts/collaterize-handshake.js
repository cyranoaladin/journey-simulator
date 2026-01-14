/* (c) 2025 - Money Factory AI. Developed by Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA. All rights reserved. */
/**
 * Simulation du handshake Collaterize (Phase 15.2) en réutilisant la logique de score.
 * Produit artifacts/collaterize-handshake.json avec status READY_FOR_BONDING.
 */
const fs = require('node:fs');
const path = require('node:path');

function simulate(input) {
  const weightedScore =
    0.4 * input.journeyScore +
    0.2 * (input.communityScore ?? input.journeyScore) +
    0.2 * (input.docsScore ?? input.journeyScore) +
    0.2 * (100 - input.riskScore * 100);

  let tier;
  if (weightedScore >= 80) tier = 'CORE';
  else if (weightedScore >= 60) tier = 'EXPERIMENTAL';
  else tier = 'REJECTED';

  const accepted = tier !== 'REJECTED';
  const softCapUSD = input.fundraisingGoalUSD * 0.25;
  const hardCapUSD = input.fundraisingGoalUSD;
  const liquidityUSD = input.fundraisingGoalUSD * 0.4;
  const initialPriceUSD = input.fundraisingGoalUSD / Math.max(input.circulatingAtTGE, 1);

  return {
    accepted,
    eligibilityScore: Math.round(weightedScore),
    tier,
    targetRaiseUSD: input.fundraisingGoalUSD,
    softCapUSD,
    hardCapUSD,
    liquidityUSD,
    initialPriceUSD,
    communityScore: input.communityScore ?? 0,
    riskScore: input.riskScore,
    simulatedLaunchUrl: 'https://launchpad.collaterize.com/',
    status: accepted ? 'READY_FOR_BONDING' : 'REJECTED',
  };
}

async function main() {
  const sample = {
    wallet: 'So11111111111111111111111111111111111111112',
    tokenMint: 'TokenMint11111111111111111111111111111111111',
    tokenSymbol: 'MFAI',
    totalSupply: 1_000_000,
    circulatingAtTGE: 250_000,
    fundraisingGoalUSD: 2_000_000,
    journeyScore: 85,
    riskScore: 0.1,
    communityScore: 78,
    docsScore: 82,
  };

  const simulation = simulate(sample);
  const outPath = path.join(__dirname, '..', 'artifacts', 'collaterize-handshake.json');
  fs.writeFileSync(outPath, JSON.stringify({ ok: true, simulation, input: sample }, null, 2));
}

main().catch((err) => {
  console.error('[collaterize-handshake] failed', err);
  process.exit(1);
});
