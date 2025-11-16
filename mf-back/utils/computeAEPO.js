// utils/computeAEPO.js (legacy wrapper)
const computeAEPO = require('../metrics/computeAEPO');

module.exports = function legacyComputeAEPO({ durationMs, success, errorCount }) {
  return computeAEPO({ duration: durationMs, success, retries: errorCount });
};
