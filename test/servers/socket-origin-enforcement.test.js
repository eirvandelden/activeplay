var assert = require('assert');
var http = require('http');
var socketIo = require('socket.io');

var allowedOrigins = require('../../lib/allowed-origins');

function handshakeStatus(env, origin) {
  return new Promise(function (resolve, reject) {
    var server = http.createServer();
    var io = socketIo(server, {
      allowRequest: allowedOrigins.socketIoHandshakeGuard(env)
    });

    function shutDown() {
      server.closeAllConnections();
      io.close();
    }

    server.listen(0, '127.0.0.1', function () {
      var request = http.get({
        host: '127.0.0.1',
        port: server.address().port,
        path: '/socket.io/?EIO=4&transport=polling',
        headers: { Origin: origin },
        agent: false
      }, function (response) {
        response.resume();
        response.on('end', function () {
          shutDown();
          resolve(response.statusCode);
        });
      });

      request.on('error', function (error) {
        shutDown();
        reject(error);
      });
    });
  });
}

describe('socket connection whitelist', function () {
  it('lets a player connect from a whitelisted site', async function () {
    var status = await handshakeStatus({ CORS_WHITE_LIST: 'https://app.example.com' }, 'https://app.example.com');

    assert.strictEqual(status, 200);
  });

  it('refuses a player connecting from a site that is not whitelisted', async function () {
    var status = await handshakeStatus({ CORS_WHITE_LIST: 'https://app.example.com' }, 'https://evil.example.com');

    assert.strictEqual(status, 403);
  });

  it('lets anyone connect when no whitelist is configured', async function () {
    var status = await handshakeStatus({}, 'https://evil.example.com');

    assert.strictEqual(status, 200);
  });
});
