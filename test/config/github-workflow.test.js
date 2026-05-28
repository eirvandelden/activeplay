var assert = require('assert');
var fs = require('fs');
var path = require('path');

describe('GitHub Actions workflow', function () {
  var workflowPath = path.join(__dirname, '../../.github/workflows/ci.yml');

  it('runs on pushes and pull requests', function () {
    var workflow = fs.readFileSync(workflowPath, 'utf8');

    assert.match(workflow, /^on:\n  pull_request:\n  push:$/m);
  });

  it('runs lint and test scripts', function () {
    var workflow = fs.readFileSync(workflowPath, 'utf8');

    assert.match(workflow, /npm run lint/);
    assert.match(workflow, /npm test/);
  });
});
