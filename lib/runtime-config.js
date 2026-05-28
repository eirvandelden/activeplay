function redisUrl(env) {
  var source = env || {};
  return source.REDISCLOUD_URL || 'redis://127.0.0.1:6379';
}

module.exports = {
  redisUrl: redisUrl
};
