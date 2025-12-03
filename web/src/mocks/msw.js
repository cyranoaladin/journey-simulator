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
