const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const appScript = /<script\b[^>]*src=["']\/assets\/index-[^"']+\.js["'][^>]*>/i;

// These are static documents, not routes implemented by the shipped React app.
test('static articles and translated landings never mount the SPA over their HTML', () => {
  const files = ['blog/index.html', 'blog/3-stop-protocol/index.html',
    'city/detroit/airport-parking/index.html', 'best/car-inspection-tools/index.html',
    'cost-of/side-mirror/index.html', 'how-to/appeal-valet-damage-denial/index.html',
    'ar/index.html', 'fr/index.html', 'es/index.html', 'ur/index.html'];
  const broken = files.filter(file => appScript.test(fs.readFileSync(path.join(root, file), 'utf8')));
  assert.deepEqual(broken, [], 'SPA loader would erase these static documents');
});

test('route ownership preserves the app and removes only its loader from static content', async () => {
  const { spaOwnsRoute, preserveStaticContent } = await import('../scripts/preserve-static-content.mjs');
  const loader = '<script type="module" crossorigin src="/assets/index-old.js"></script>';
  const html = '<h1>Existing article</h1>' + loader + '<script src="/ux.js" defer></script>';
  for (const route of ['/', '/index.html', '/pricing', '/city/detroit', '/scan/new', '/scan/123/exit', '/dashboard/scan/123', '/business/dashboard', '/auth/callback']) {
    assert.equal(spaOwnsRoute(route), true, route);
    assert.equal(preserveStaticContent(html, route), html, route);
  }
  for (const route of ['/blog', '/blog/index.html', '/blog/post', '/city/detroit/airport-parking', '/cost-of/side-mirror', '/ar', '/ar/', '/ar/index.html']) {
    assert.equal(spaOwnsRoute(route), false, route);
    assert.equal(preserveStaticContent(html, route), html.replace(loader, ''), route);
    assert.equal(preserveStaticContent(preserveStaticContent(html, route), route), html.replace(loader, ''), route);
  }
});

test('blog retains real article links and the interactive app keeps its loader', () => {
  const blog = fs.readFileSync(path.join(root, 'blog/index.html'), 'utf8');
  assert.match(blog, /href="\/blog\/3-stop-protocol"/);
  for (const file of ['index.html', 'pricing/index.html']) {
    assert.match(fs.readFileSync(path.join(root, file), 'utf8'), appScript, file);
  }
});
