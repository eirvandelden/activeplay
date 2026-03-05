function parseAllowedOrigins(whitelist) {
  return String(whitelist || '')
    .split(',')
    .map(function trimOrigin(value) {
      return value.trim();
    })
    .filter(function present(value) {
      return value.length > 0;
    });
}

function hasProtocol(value) {
  return /^https?:\/\//i.test(value);
}

function normalizeHost(value) {
  return String(value || '').replace(/^https?:\/\//i, '').replace(/\/$/, '').toLowerCase();
}

function originIsAllowed(origin, allowedOrigins) {
  try {
    var parsedOrigin = new URL(origin);
    var originHost = parsedOrigin.host.toLowerCase();
    var originHostname = parsedOrigin.hostname.toLowerCase();

    return allowedOrigins.some(function allowlisted(entry) {
      if (hasProtocol(entry)) {
        return entry.toLowerCase() === origin.toLowerCase();
      }

      var normalizedEntry = normalizeHost(entry);
      return normalizedEntry === originHost || normalizedEntry === originHostname;
    });
  } catch (_error) {
    return false;
  }
}

module.exports = function (req, res, next) {
  var allowedOrigins = parseAllowedOrigins(process.env.CORS_WHITE_LIST);
  var origin = req.headers.origin;

  if (allowedOrigins.length === 0 || !origin) {
    next();
    return;
  }

  if (!originIsAllowed(origin, allowedOrigins)) {
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
