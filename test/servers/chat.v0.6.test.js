var assert = require('assert');

var ChatServer = require('../../servers/chat.v0.6');

function buildSocket(registry) {
  return {
    on: function (eventName, handler) {
      if (!registry[eventName]) {
        registry[eventName] = [];
      }

      registry[eventName].push(handler);
    },
    broadcast: {
      to: function () {
        return {
          emit: function () {}
        };
      }
    },
    emit: function () {},
    room: 'campaign-room',
    campaignId: 'campaign-id',
    residentId: 'resident-id',
    username: 'player-one',
    usercolor: '#000000'
  };
}

describe('chat server v0.6', function () {
  it('registers initiative:setEntities listener only once', function () {
    var handlersByEvent = {};
    var server = new ChatServer({
      io: {
        engine: { clientsCount: 0 },
        of: function () {
          return {
            on: function () {},
            to: function () {
              return {
                emit: function () {}
              };
            }
          };
        }
      },
      pub: {}
    });

    server.setResponseListeners(buildSocket(handlersByEvent));

    assert.strictEqual(handlersByEvent['initiative:setEntities'].length, 1);
  });
});
