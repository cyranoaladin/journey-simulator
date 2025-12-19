var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // This API service does not ship server-side rendered views in production.
  // Returning JSON avoids 500s when no view engine is configured.
  res.status(200).json({ ok: true, service: 'mf-back', status: 'running' });
});

module.exports = router;
