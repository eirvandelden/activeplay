var assert = require('assert');

async function loadSocketLifecycleModule() {
  return import('../../../src/js/socket-lifecycle.mjs');
}

describe('socket lifecycle helper', function () {
  it('disconnects socket when available', async function () {
    var socketLifecycle = await loadSocketLifecycleModule();
    var disconnectCalls = 0;

    var socket = {
      disconnect: function () {
        disconnectCalls += 1;
      }
    };

    socketLifecycle.disconnectSocket(socket);
    assert.strictEqual(disconnectCalls, 1);
  });

  it('does nothing for null or unsupported sockets', async function () {
    var socketLifecycle = await loadSocketLifecycleModule();

    assert.doesNotThrow(function () {
      socketLifecycle.disconnectSocket(null);
      socketLifecycle.disconnectSocket({});
      socketLifecycle.disconnectSocket({ disconnect: true });
    });
  });
});
