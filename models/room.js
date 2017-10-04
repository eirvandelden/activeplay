exports.add = function (redis, room) {
  redis.SADD('ap:rooms', room);
};

exports.timestamp = function (redis, room) {
  var timestamp = new Date().getTime();
  redis.SET('ap:timestamp:' + room, timestamp);
};
