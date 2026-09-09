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

test('retired GEG valet URL consolidates to the live airport-parking guide', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  for (const source of ['/airport-valet/geg', '/airport-valet/geg/']) {
    assert.ok(config.redirects.some(rule => rule.source === source &&
      rule.destination === '/protect/airport-parking' && rule.permanent === true), source);
  }
  for (const sitemap of ['sitemap.xml', 'public/sitemap.xml']) {
    const xml = fs.readFileSync(path.join(root, sitemap), 'utf8');
    assert.ok(!xml.includes('https://carshake.online/airport-valet/geg'), sitemap);
  }
  const htmlFiles = [];
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (['.git', 'node_modules', '.vercel'].includes(entry.name)) continue;
      const target = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(target);
      else if (entry.name.endsWith('.html')) htmlFiles.push(target);
    }
  }
  const linked = htmlFiles.filter(file => fs.readFileSync(file, 'utf8').includes('/airport-valet/geg'));
  assert.deepEqual(linked, []);
});
