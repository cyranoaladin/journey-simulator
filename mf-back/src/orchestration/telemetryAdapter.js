/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

/**
 * Telemetry adapter (no external deps)
 * Default: console JSON structured
 */

function emit(event) {
  try {
    const payload = {
      ts: Date.now(),
      type: event.type || 'orchestration',
      level: event.level || 'INFO',
      data: event.data || {},
    };
    // Non bloquant
    // eslint-disable-next-line no-console
    console.log('[telemetry]', JSON.stringify(payload));
  } catch (e) {
    // Never throw
  }
}

module.exports = { emit };
