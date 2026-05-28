var assert = require('assert');

var runtimeConfig = require('../../lib/runtime-config');

describe('runtime config', function () {
  describe('redisUrl', function () {
    it('returns REDISCLOUD_URL when present', function () {
      var redisUrl = runtimeConfig.redisUrl({ REDISCLOUD_URL: 'redis://cache.example:6379' });
      assert.strictEqual(redisUrl, 'redis://cache.example:6379');
    });

    it('falls back to localhost when env is missing', function () {
      var redisUrl = runtimeConfig.redisUrl({});
      assert.strictEqual(redisUrl, 'redis://127.0.0.1:6379');
    });
  });
});
