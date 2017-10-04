var Room = require('../models/room');

function iHGETALL (redis, options, next) {
  redis.HGETALL('ap:initiative:' + options.room, function (err, results) {
    if (err) { next(err); };
    next(null, results);
  });
}

exports.setTurn = function (redis, room, message) {
  redis.HMSET('ap:initiative:' + room, {
    'timestamp': message.timestamp,
    'turn': message.turn,
    'round': message.round
  });
  Room.timestamp(redis, room);
};

exports.setEntities = function (redis, room, message) {
  redis.HMSET('ap:initiative:' + room, {
    'timestamp': message.timestamp,
    'entities': JSON.stringify(message.entities)
  });
  Room.timestamp(redis, room);
};

exports.load = function (redis, options) {
  return new Promise(function (resolve, reject) {
    iHGETALL(redis, options, function (err, initiative) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(initiative);
      }
    });
  });
};
