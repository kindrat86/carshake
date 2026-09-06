const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('paid-kit landing avoids unsupported statistics and liability outcomes', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'tripwire.html'), 'utf8');
  assert.doesNotMatch(html, /1,847|27%|you are the one who pays that bill/);
  assert.match(html, /cannot create missing pickup evidence or determine liability/);
  assert.match(html, /educational information, not legal advice/);
  assert.match(html, /https:\/\/buy.stripe.com\/14A5kCeNl7xm7kq4nK0x20M/);
});
