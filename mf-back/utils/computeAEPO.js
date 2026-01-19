/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

// utils/computeAEPO.js (legacy wrapper)
const computeAEPO = require('../metrics/computeAEPO');

module.exports = function legacyComputeAEPO({ durationMs, success, errorCount }) {
  return computeAEPO({ duration: durationMs, success, retries: errorCount });
};
