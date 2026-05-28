var assert = require('assert');
var fs = require('fs');
var path = require('path');

describe('development runtime configuration', function () {
  it('starts the Docker app on the port exposed by docker-compose', function () {
    var dockerfile = fs.readFileSync(path.join(__dirname, '../../Dockerfile'), 'utf8');

    assert.match(dockerfile, /^ENV PORT=5050$/m);
  });

  it('allows the local dev page to connect to Socket.IO', function () {
    var envExample = fs.readFileSync(path.join(__dirname, '../../.env.example'), 'utf8');
    var corsWhitelist = envExample
      .split('\n')
      .find(function findWhitelist(line) {
        return line.indexOf('CORS_WHITE_LIST=') === 0;
      });

    assert.ok(corsWhitelist.indexOf('http://localhost:5050') > -1);
  });
});
