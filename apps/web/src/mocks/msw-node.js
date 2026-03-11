/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

function noop() {}

module.exports = {
  setupServer: (...handlers) => {
    return {
      listen: noop,
      close: noop,
      resetHandlers: noop,
      use: noop,
      events: undefined,
      handlers,
    }
  },
}
