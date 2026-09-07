const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
test('verification-only documents are not offered as search content', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  for (const token of ['google57979683042f3b0e', 'googlea30bb998b91eb6ac']) {
    const text = fs.readFileSync(path.join(root, token + '.html'), 'utf8').trim();
    assert.equal(text, 'google-site-verification: ' + token + '.html');
    for (const suffix of ['', '.html']) {
      assert.ok(config.headers.some(rule => rule.source === '/' + token + suffix &&
        rule.headers.some(h => h.key.toLowerCase() === 'x-robots-tag' && h.value.includes('noindex'))), token + suffix);
    }
  }
});
