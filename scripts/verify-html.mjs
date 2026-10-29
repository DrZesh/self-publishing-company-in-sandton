import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(new URL('..',import.meta.url).pathname);
const report=JSON.parse(await readFile(path.join(root,'dist/html-export-report.json'),'utf8'));
const sitemap=await readFile(path.join(root,'public/sitemap.xml'),'utf8');
const expected=new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname));
assert.equal(report.pages.length,expected.size);
assert.equal(report.liveDatabaseEnabled,false);
for(const page of report.pages) {
  assert(expected.delete(page.route),`Unexpected or duplicate page: ${page.route}`);
  const html=await readFile(path.join(root,'dist',page.route.slice(1),'index.html'),'utf8');
  assert.match(html,/<h1[\s>]/,`No H1 at ${page.route}`);
  assert.match(html,/<meta name="robots" content="noindex, nofollow"/);
  assert(/<link rel="canonical" href="https:\/\/creativebooks\.co\.za/.test(html),`Incorrect canonical origin: ${page.route}`);
  assert.match(html,/#cb-loader\{display:none!important\}/,'Static content must not be covered by the JavaScript loader');
  assert(page.hasPageMeta,`Missing per-page metadata: ${page.route}`);
  for(const script of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) JSON.parse(script[1]);
  for(const script of html.matchAll(/<script[^>]*src="(\/assets\/[^\"]+)"/g)) await access(path.join(root,'dist',script[1].slice(1)));
}
assert.equal(expected.size,0);
assert.match(await readFile(path.join(root,'dist/robots.txt'),'utf8'),/Disallow: \/\s*$/);
console.log(`Verified ${report.pages.length} HTML pages: headings, metadata, noindex, JSON-LD, sitemap coverage and script assets.`);
