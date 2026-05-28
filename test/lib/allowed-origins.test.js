var assert = require('assert');

var allowedOrigins = require('../../lib/allowed-origins');

describe('allowed origins', function () {
  describe('parseAllowedOrigins', function () {
    it('returns trimmed origins from a comma-separated whitelist', function () {
      assert.deepStrictEqual(
        allowedOrigins.parseAllowedOrigins(' https://app.example.com, cityofbrass.localhost '),
        ['https://app.example.com', 'cityofbrass.localhost']
      );
    });
  });

  describe('originIsAllowed', function () {
    it('allows exact protocol origins', function () {
      assert.strictEqual(
        allowedOrigins.originIsAllowed('https://app.example.com', ['https://app.example.com']),
        true
      );
    });

    it('allows host-only whitelist entries with any origin port', function () {
      assert.strictEqual(
        allowedOrigins.originIsAllowed('http://cityofbrass.localhost:3000', ['cityofbrass.localhost']),
        true
      );
    });

    it('rejects origins outside the whitelist', function () {
      assert.strictEqual(
        allowedOrigins.originIsAllowed('https://evil.example.com', ['https://app.example.com']),
        false
      );
    });
  });

  describe('socketIoOriginGuard', function () {
    it('allows all origins when whitelist is empty', function (done) {
      var guard = allowedOrigins.socketIoOriginGuard({});

      guard('https://evil.example.com', function (error, allowed) {
        assert.ifError(error);
        assert.strictEqual(allowed, true);
        done();
      });
    });

    it('allows whitelisted socket origins', function (done) {
      var guard = allowedOrigins.socketIoOriginGuard({
        CORS_WHITE_LIST: 'https://app.example.com'
      });

      guard('https://app.example.com', function (error, allowed) {
        assert.ifError(error);
        assert.strictEqual(allowed, true);
        done();
      });
    });

    it('rejects non-whitelisted socket origins', function (done) {
      var guard = allowedOrigins.socketIoOriginGuard({
        CORS_WHITE_LIST: 'https://app.example.com'
      });

      guard('https://evil.example.com', function (error, allowed) {
        assert.ifError(error);
        assert.strictEqual(allowed, false);
        done();
      });
    });
  });
});
