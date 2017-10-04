function r (redis, options, next) {
  redis.SMEMBERS('users:' + options.room, function (err, results) {
    if (err) { next(err); };
    next(null, results);
  });
}

exports.add = function (redis, room, user) {
  redis.SADD('users:' + room, user);
};

exports.rem = function (redis, room, user) {
  redis.SREM('users:' + room, user);
};

exports.getAll = function (redis, options) {
  return new Promise(function (resolve, reject) {
    r(redis, options, function (err, messages) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(messages);
      }
    });
  });
};
