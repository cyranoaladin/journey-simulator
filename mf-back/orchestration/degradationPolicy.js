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
