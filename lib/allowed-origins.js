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

function socketIoOriginGuard(env) {
  var allowedOrigins = parseAllowedOrigins((env || {}).CORS_WHITE_LIST);

  return function checkSocketOrigin(origin, callback) {
    if (allowedOrigins.length === 0) {
      callback(null, true);
      return;
    }

    callback(null, originIsAllowed(origin, allowedOrigins));
  };
}

module.exports = {
  parseAllowedOrigins: parseAllowedOrigins,
  originIsAllowed: originIsAllowed,
  socketIoOriginGuard: socketIoOriginGuard
};
