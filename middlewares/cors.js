var allowedOriginsConfig = require('../lib/allowed-origins');

module.exports = function (req, res, next) {
  var allowedOrigins = allowedOriginsConfig.parseAllowedOrigins(process.env.CORS_WHITE_LIST);
  var origin = req.headers.origin;

  if (allowedOrigins.length === 0 || !origin) {
    next();
    return;
  }

  if (!allowedOriginsConfig.originIsAllowed(origin, allowedOrigins)) {
    res.status(403).send();
    return;
  }

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.header('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    res.status(204).send();
    return;
  }

  next();
};
