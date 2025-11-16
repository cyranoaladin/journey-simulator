function computeAEPO({ duration, success, retries }) {
  let score = 100;
  if (!success) return 0;
  score -= Math.min(duration / 1000, 50); // pénalité sur temps d'exécution
  score -= retries * 10; // pénalité par tentative
  return Math.max(0, Math.round(score));
}

module.exports = computeAEPO;
