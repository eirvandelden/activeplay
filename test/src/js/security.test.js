var assert = require('assert');
var createDOMPurify = require('dompurify');
var JSDOM = require('jsdom').JSDOM;

async function loadSecurityModule() {
  return import('../../../src/js/security.mjs');
}

describe('chat security helpers', function () {
  var originalPurify;
  var jsdomWindow;

  beforeEach(function () {
    originalPurify = globalThis.DOMPurify;
    jsdomWindow = new JSDOM('').window;
    globalThis.DOMPurify = createDOMPurify(jsdomWindow);
  });

  afterEach(function () {
    if (jsdomWindow && typeof jsdomWindow.close === 'function') {
      jsdomWindow.close();
    }

    if (typeof originalPurify === 'undefined') {
      delete globalThis.DOMPurify;
    } else {
      globalThis.DOMPurify = originalPurify;
    }
  });

  it('strips dangerous HTML tags from user input while keeping command text', async function () {
    var security = await loadSecurityModule();
    var input = '[<img src=x onerror=alert(1)>](http://example.com)';

    assert.strictEqual(
      security.sanitizeInputText(input),
      '[](http://example.com)'
    );
  });

  it('removes inline handlers and javascript URLs from HTML messages', async function () {
    var security = await loadSecurityModule();
    var html = "<a href='javascript:alert(1)' onclick='alert(2)'>x</a><script>alert(3)</script>";
    var sanitized = security.sanitizeChatHtml(html);

    assert.ok(!sanitized.includes('javascript:'));
    assert.ok(!sanitized.includes('onclick='));
    assert.ok(!sanitized.toLowerCase().includes('<script'));
  });

  it('removes encoded javascript protocol payloads', async function () {
    var security = await loadSecurityModule();
    var html = '<a href="java&#x73;cript:alert(1)">x</a>';
    var sanitized = security.sanitizeChatHtml(html);

    assert.ok(!sanitized.toLowerCase().includes('href='));
    assert.ok(sanitized.includes('<a'));
  });
});
