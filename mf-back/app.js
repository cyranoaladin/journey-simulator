const path = require('path');

// Proxy to the canonical backend app so there is only one source of truth.
module.exports = require(path.resolve(__dirname, '..', '..', 'mf-back', 'app'));
