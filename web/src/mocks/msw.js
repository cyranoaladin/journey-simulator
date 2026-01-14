/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const passthrough = () => ({})

exports.http = {
  get: passthrough,
  post: passthrough,
  patch: passthrough,
  put: passthrough,
  delete: passthrough,
}

exports.HttpResponse = {
  json: (payload) => ({ ok: true, body: payload }),
}
