var _ = require('underscore');
var colors = require('colors');
var debug = require('debug');
var jwt = require('jsonwebtoken');

var Dice = require('../lib/dice/roller.v0');
var Markdown = require('../lib/markdown');

var Buff3r = require('../models/buff3r');
var Initiative = require('../models/initiative');
var Room = require('../models/room');

var namespace = '/activeplay/v0.6';

var Server = function (options) {
  var self = this;

  self.io = options.io.of(namespace);
  self.pub = options.pub;
  self.rooms = {};

  console.log('Starting ActivePlay chat server'.grey);

  self.init = function () {
    // Fired upon a connection
    self.io.on('connection', function (socket) {
      console.log('Active Connections: ' +  options.io.engine.clientsCount);
      self.handleConnection(socket);
    });
  };

  self.handleConnection = function (socket) {
    socket.retry_count = 0;

    socket.on('login', function (token, lastTimestamp) {
      jwt.verify(token, process.env.ACTIVEPLAY_SECRET, function (err, user) {
        if (err) {
          try { err.address = socket.request.connection.remoteAddress; } catch (socketEx) { console.log(socketEx); }
          socket.retry_count++;
          if (socket.retry_count > 5) {
            console.log(err);
            socket.disconnect();
          } else {
            socket.emit('expired');
          }
        } else {
          socket.retry_count = 0;
          socket.residentId  = user.residentId;
          socket.characterId = user.characterId;
          socket.campaignId  = user.campaignId;

          socket.username     = user.name;
          socket.room         = user.campaignId;
          socket.myroom       = user.campaignId + ':' + user.residentId;
          socket.usercolor    = user.color;

          // JOIN THE CAMPAIGN ROOM
          socket.join(socket.room);
          // JOIN YOUR OWN PRIVATE ROOM
          socket.join(socket.myroom);

          user.id = socket.id;

          if (self.rooms[socket.room]) {
            self.rooms[socket.room].push(user);
          } else {
            self.rooms[socket.room] = [ user ];
            Room.add(self.pub, socket.room);
          }

          self.setResponseListeners(socket);
          socket.emit('welcome', user);
          socket.broadcast.to(socket.room).emit('userJoined', socket.username);

          Buff3r.read(self.pub, { room: socket.campaignId, residentId: socket.residentId, lastTimestamp: lastTimestamp })
            .then(function (buff3r) {
              socket.emit('buff3r', buff3r);
            })
            .catch(function (err) {
              console.log(err);
            });

          Initiative.load(self.pub, { room: socket.campaignId, residentId: socket.residentId, lastTimestamp: lastTimestamp })
            .then(function (initiative) {
              if (initiative) {
                socket.emit('loadInitiative', initiative);
              }
            })
            .catch(function (err) {
              console.log(err);
            });
        }
      });
    });
  };

  self.setResponseListeners = function (socket) {

    socket.on('disconnect', function () {
      console.log('Active Connections: ' +  options.io.engine.clientsCount);
      if (self.rooms[socket.room]) {
        if (self.rooms[socket.room].length > 1) {
          self.rooms[socket.room].forEach(function (result, index) {
            if (result['id'] === socket.id) {
              self.rooms[socket.room].splice(index, 1);
            }
          });
        } else {
          delete self.rooms[socket.room];
        }
      }
      socket.broadcast.to(socket.room).emit('userLeft', socket.username);
    });

    socket.on('onlineUsers', function () {
      socket.emit('onlineUsers', self.rooms[socket.room]);
    });

    socket.on('message', function (message) {
      if (message.text) {
        Markdown.parse(message);
        message.timestamp = new Date().getTime();
        message.sender = socket.username;
        message.senderId = socket.residentId;
        message.usercolor = socket.usercolor;

        if (message.recipient) {
          // PRIVATE MESSAGE
          socket.broadcast.to(socket.campaignId + ':' + message.recipientId).emit('message', message);
          socket.emit('message', message);
        } else {
          // PUBLIC MESSAGE
          self.io.to(socket.room).emit('message', message);
        }
        Buff3r.write(self.pub, socket.campaignId, message);
      }
    });

    socket.on('initiative:setTurn', function (message) {
      message.timestamp = new Date().getTime();

      socket.broadcast.to(socket.room).emit('initiative:setTurn', message);
      Initiative.setTurn(self.pub, socket.campaignId, message);
    });

    socket.on('initiative:setEntities', function (message) {
      message.timestamp = new Date().getTime();

      socket.broadcast.to(socket.room).emit('initiative:setEntities', message);
      Initiative.setEntities(self.pub, socket.campaignId, message);
    });

    socket.on('initiative:setEntities', function (message) {
      message.timestamp = new Date().getTime();

      socket.broadcast.to(socket.room).emit('initiative:setEntities', message);
      Initiative.setEntities(self.pub, socket.campaignId, message);
    });

    socket.on('dice', function (message) {
      if (!message.text && message.label) {
        message.text = '"' + message.label + '" ' + message.dice;
      }
      message.timestamp = new Date().getTime();
      message.sender = socket.username;
      message.senderId = socket.residentId;
      message.usercolor = socket.usercolor;

      Dice.roll(message.text)
        .then(function (results) {
          message.text = null;
          message.html = results;
          if (message.recipient) {
            // PRIVATE GM ONLY ROLL
            socket.broadcast.to(socket.campaignId + ':' + message.recipientId).emit('message', message);
            socket.emit('message', message);
          } else {
            // PUBLIC DICE ROLL
            self.io.to(socket.room).emit('message', message);
          }
          Buff3r.write(self.pub, socket.campaignId, message);

        })
        .catch(function () {
          message.text = message.text + ' is not valid';
          message.type = 'system';
          socket.emit('message', message);
        });

    });
  };
};

function uniq (a) {
  return a.sort().filter(function (item, pos, ary) {
    return !pos || item !== ary[pos - 1];
  });
}

module.exports = Server;
