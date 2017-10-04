var Room = require('../models/room');

function r (redis, options, next) {
  try {
    var results = [];
    redis.LRANGE('ap:messages:' + options.room, 0, 49, function (err, messages) {
      if (err) { next(err); };
      messages.forEach(function (element) {
        message = JSON.parse(element);
        if (message.timestamp > options.lastTimestamp) {
          if (!message.recipientId || (message.senderId === options.residentId || message.recipientId === options.residentId)) {
            results.push(message);
          }
        }
      });
      next(null, results);
    });
  } catch (err) {
    next(err);
  }
}

exports.write = function (redis, room, message) {
  redis.RPUSH('ap:messages:' + room, JSON.stringify(message));
  redis.LTRIM('ap:messages:' + room, -49, -1); // BUFFER SIZE 50
  Room.timestamp(redis, room);
};

exports.read = function (redis, options) {
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
