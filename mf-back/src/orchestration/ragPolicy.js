/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const MAX_CITATIONS = 3;
const MAX_QUOTE_LEN = 160;
const MIN_RELEVANCE = 0.3;

function applyRagPolicy(runs) {
  const seen = new Set();
  return runs.map((r) => {
    const citations = Array.isArray(r.citations) ? r.citations : [];
    const filtered = [];
    for (const c of citations) {
      const quote = (c.quote || c.text || '').slice(0, MAX_QUOTE_LEN);
      const source = c.source || 'unknown';
      const relevance = typeof c.relevance === 'number' ? c.relevance : 0.5;
      if (relevance < MIN_RELEVANCE) continue;
      const key = `${source}|${quote}`;
      if (seen.has(key)) continue;
      seen.add(key);
      filtered.push({
        source,
        quote,
        relevance,
      });
      if (filtered.length >= MAX_CITATIONS) break;
    }
    return { ...r, citations: filtered };
  });
}

module.exports = {
  applyRagPolicy,
  MAX_CITATIONS,
  MAX_QUOTE_LEN,
  MIN_RELEVANCE,
};
