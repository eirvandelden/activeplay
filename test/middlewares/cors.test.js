var assert = require('assert');

var corsMiddleware = require('../../middlewares/cors');

function buildResponse() {
  var response = {
    headers: {},
    statusCode: null,
    sent: false,
    header: function (key, value) {
      response.headers[key] = value;
      return response;
    },
    status: function (code) {
      response.statusCode = code;
      return response;
    },
    send: function () {
      response.sent = true;
      return response;
    }
  };

  return response;
}

describe('cors middleware', function () {
  var originalWhitelist;

  beforeEach(function () {
    originalWhitelist = process.env.CORS_WHITE_LIST;
  });

  afterEach(function () {
    process.env.CORS_WHITE_LIST = originalWhitelist;
  });

  it('allows request when origin is in whitelist', function () {
    process.env.CORS_WHITE_LIST = 'https://app.example.com';

    var req = { headers: { origin: 'https://app.example.com', host: 'activeplay.example.com' } };
    var res = buildResponse();
    var nextCalled = false;

    corsMiddleware(req, res, function () {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(res.headers['Access-Control-Allow-Origin'], 'https://app.example.com');
  });

  it('allows request when host-only whitelist entry matches origin host', function () {
    process.env.CORS_WHITE_LIST = 'cityofbrass.localhost';

    var req = { headers: { origin: 'http://cityofbrass.localhost:3000', host: 'activeplay.localhost:5050' } };
    var res = buildResponse();
    var nextCalled = false;

    corsMiddleware(req, res, function () {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(res.headers['Access-Control-Allow-Origin'], 'http://cityofbrass.localhost:3000');
  });

  it('rejects request when origin and host are not in whitelist', function () {
    process.env.CORS_WHITE_LIST = 'https://app.example.com';

    var req = { headers: { origin: 'https://evil.example.com', host: 'evil.example.com' } };
    var res = buildResponse();
    var nextCalled = false;

    corsMiddleware(req, res, function () {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.sent, true);
  });

  it('skips filtering when whitelist is not configured', function () {
    delete process.env.CORS_WHITE_LIST;

    var req = { headers: { host: 'activeplay.example.com' } };
    var res = buildResponse();
    var nextCalled = false;

    corsMiddleware(req, res, function () {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
  });

  it('allows non-CORS requests when whitelist is configured but Origin is missing', function () {
    process.env.CORS_WHITE_LIST = 'https://cityofbrass.vandelden.family';

    var req = { headers: { host: 'activeplay.localhost:5050' } };
    var res = buildResponse();
    var nextCalled = false;

    corsMiddleware(req, res, function () {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(res.statusCode, null);
  });

  it('responds with 204 for allowed CORS preflight requests', function () {
    process.env.CORS_WHITE_LIST = 'https://cityofbrass.vandelden.family';

    var req = { method: 'OPTIONS', headers: { origin: 'https://cityofbrass.vandelden.family' } };
    var res = buildResponse();
    var nextCalled = false;

    corsMiddleware(req, res, function () {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 204);
    assert.strictEqual(res.sent, true);
    assert.strictEqual(res.headers['Access-Control-Allow-Origin'], 'https://cityofbrass.vandelden.family');
  });
});
