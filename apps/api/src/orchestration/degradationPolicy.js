/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const ORDER = ['quota', 'cost', 'slo', 'circuit', 'kill_switch'];

function apply(decisions = {}) {
  const applied = [];
  ORDER.forEach((k) => {
    if (decisions[k]) applied.push(k);
  });
  return {
    applied,
    summary: applied.join(' -> '),
  };
}

module.exports = { apply, ORDER };
