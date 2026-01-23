/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

function computeAEPO({ duration, success, retries }) {
  let score = 100;
  if (!success) return 0;
  score -= Math.min(duration / 1000, 50); // penalty on execution time
  score -= retries * 10; // penalty per retry
  return Math.max(0, Math.round(score));
}

module.exports = computeAEPO;
