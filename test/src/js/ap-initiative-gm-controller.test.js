var assert = require('assert');
var fs = require('fs');
var path = require('path');

function controllerModuleUrl() {
  var controllerPath = path.join(__dirname, '../../../src/js/controllers/ap-initiative-gm-controller.js');
  var source = fs.readFileSync(controllerPath, 'utf8')
    .replace("import { Controller } from '@hotwired/stimulus';\n\n", '')
    .replace("import ApStore from '../ap-store.js';\n\n", '')
    .replace('export default class extends Controller', 'class ApInitiativeGmController extends Controller');

  var prelude = [
    'class Controller {}',
    'var ApStore = globalThis.__testApStore;'
  ].join('\n');

  var moduleSource = prelude + '\n' + source + '\nexport { ApInitiativeGmController };';
  return 'data:text/javascript;base64,' + Buffer.from(moduleSource).toString('base64');
}

describe('ap initiative GM controller', function () {
  afterEach(function () {
    delete global.window;
    delete globalThis.__testApStore;
  });

  it('publishes local initiative updates after sending turn changes', async function () {
    var emitted = [];
    var notifications = [];

    global.window = {
      _apSocket: {
        emit: function (eventName, payload) {
          emitted.push({ eventName: eventName, payload: payload });
        }
      }
    };

    globalThis.__testApStore = {
      initiative: { turn: 2, round: 4, entities: [] },
      notify: function (eventName, detail) {
        notifications.push({ eventName: eventName, detail: detail });
      }
    };

    var controllerModule = await import(controllerModuleUrl());
    var controller = new controllerModule.ApInitiativeGmController();

    controller.sendTurn();

    assert.deepStrictEqual(emitted, [
      {
        eventName: 'initiative:setTurn',
        payload: { turn: 2, round: 4 }
      }
    ]);
    assert.deepStrictEqual(notifications, [
      {
        eventName: 'ap:initiative-updated',
        detail: { initiative: globalThis.__testApStore.initiative }
      }
    ]);
  });
});
