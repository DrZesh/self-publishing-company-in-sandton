import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const canonicalPath = '/how-to-get-an-isbn-in-south-africa';
test('every sitemap URL resolves to an explicit public application route', async () => {
  const app = await readFile('src/App.jsx', 'utf8');
  const sitemap = await readFile('public/sitemap.xml', 'utf8');
  const routes = new Set([...app.matchAll(/<Route\s+path="([^"]+)"/g)].map(m => m[1]));
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1]));
  assert.equal(new Set(urls.map(u => u.href)).size, urls.length, 'Duplicate sitemap URLs');
  for (const url of urls) {
    assert.equal(url.hostname, 'creativebooks.co.za');
    assert.ok(!url.pathname.startsWith('/admin'), 'Admin URLs must not be indexed');
    assert.ok(routes.has(url.pathname), `Missing sitemap route: ${url.pathname}`);
  }
  assert.ok(urls.some(u => u.pathname === canonicalPath));
  assert.ok(!urls.some(u => ['/isbn','/isbnregistration'].includes(u.pathname)));
});
test('legacy ISBN URLs redirect permanently and the new page has matching SEO metadata', async () => {
  const config = JSON.parse(await readFile('vercel.json', 'utf8'));
  for (const path of ['/isbn','/isbnregistration']) {
    const redirect = config.redirects.find(r => r.source === path);
    assert.equal(redirect?.destination, canonicalPath);
    assert.equal(redirect?.permanent, true);
  }
  const page = await readFile('src/pages/resources/ISBNRegistration.jsx', 'utf8');
  assert.ok(page.includes(`canonical="https://creativebooks.co.za${canonicalPath}"`));
  assert.ok(page.includes("'@type': 'FAQPage'"));
  assert.ok(page.includes('https://isbn.nlsa.ac.za/isbn_request.php'));
});
