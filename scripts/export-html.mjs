import { createServer } from 'vite';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(new URL('..', import.meta.url).pathname);
const out = path.join(root,'dist');
const templatePath = path.join(out,'.html-export-template');
const template = await readFile(templatePath,'utf8').catch(()=>readFile(path.join(out,'index.html'),'utf8'));
if (!template.includes('<div id="root"></div>')) throw new Error('Run vite build before HTML export');
await writeFile(templatePath,template);
const sitemap = await readFile(path.join(root,'public/sitemap.xml'),'utf8');
const appSource = await readFile(path.join(root,'src/App.jsx'),'utf8');
const aliases = new Map([...appSource.matchAll(/<Route path="([^"]+)" element=\{<Navigate to="([^"]+)" replace \/>\} \/>/g)].map(m=>[m[1],m[2]]));
function resolveRoute(route) { const seen=new Set(); while(aliases.has(route)) { if(seen.has(route)) throw new Error('Redirect cycle'); seen.add(route); route=aliases.get(route); } return route; }
const routes = [...new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname))];
for (const route of routes) {
  if (/^\/(admin|portal|sign|quote\/view|invoice\/view|doc\/view)(\/|$)/.test(route) || !/^\/[a-z0-9/-]*$/i.test(route) || route.includes('..')) throw new Error(`Unsafe export route: ${route}`);
}
const widget = new URL('./ssr-browser-widgets.jsx',import.meta.url).pathname;
const server = await createServer({root, resolve:{alias:{'react-quill/dist/quill.snow.css':widget,'react-quill':widget,'react-leaflet':widget,'framer-motion':new URL('./ssr-motion.jsx',import.meta.url).pathname}},server:{middlewareMode:true},appType:'custom'});
const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const results=[];
try {
  const {default:App} = await server.ssrLoadModule('/src/App.jsx');
  const head = await server.ssrLoadModule('/src/lib/static-head.js');
  for (const route of routes) {
    head.resetStaticHead();
    const body = renderToString(React.createElement(App,{url:resolveRoute(route)}));
    if (!body.includes('<h1')) throw new Error(`Missing public heading: ${route}`);
    const meta = head.getStaticHead() || {};
    let html = template.replace('<div id="root"></div>',`<div id="root">${body}</div>`);
    if (!html.includes(body)) throw new Error('Root template marker missing');
    html=html.replace('</head>','<style>#cb-loader{display:none!important}</style></head>');
    const title = meta.title || body.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1].replace(/<[^>]+>/g,'') || 'Creative Books SA';
    html = html.replace(/<title>.*?<\/title>/s,`<title>${escape(title)}</title>`);
    const canonical = meta.canonical || `https://creativebooks.co.za${resolveRoute(route)}`;
    html=html.replace(/<link rel="canonical"[^>]*>/,`<link rel="canonical" href="${escape(canonical)}" />`);
    if(meta.description) html=html.replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${escape(meta.description)}" />`);
    for(const [name,value] of [['og:title',title],['og:description',meta.description],['og:url',canonical],['twitter:title',title],['twitter:description',meta.description]]) {
      if(value) html=html.replace(new RegExp(`<meta (?:name|property)="${name}"[^>]*>`),`<meta ${name.startsWith('og:')?'property':'name'}="${name}" content="${escape(value)}" />`);
    }
    if(meta.schema) html=html.replace('</head>',`<script type="application/ld+json">${JSON.stringify(meta.schema).replace(/</g,'\\u003c')}</script>\n</head>`);
    // React escapes script children during server rendering; JSON-LD needs raw JSON text.
    html=html.replace(/(<script[^>]*type="application\/ld\+json"[^>]*>)(.*?)(<\/script>)/gs,(_,open,text,close)=>{
      let value;
      try { value=JSON.parse(text); } catch {
        const entities={'&quot;':'"','&#x27;':"'",'&#39;':"'",'&amp;':'&','&lt;':'<','&gt;':'>'};
        value=JSON.parse(text.replace(/&quot;|&#x27;|&#39;|&amp;|&lt;|&gt;/g,entity=>entities[entity]));
      }
      return open+JSON.stringify(value).replace(/</g,'\\u003c')+close;
    });
    const directory=path.join(out,route.slice(1));
    await mkdir(directory,{recursive:true});
    await writeFile(path.join(directory,'index.html'),html);
    results.push({route,bytes:Buffer.byteLength(html),hasH1:true,hasPageMeta:Boolean(meta.title)});
  }
  await writeFile(path.join(out,'html-export-report.json'),JSON.stringify({previewOnly:true,liveDatabaseEnabled:false,pages:results},null,2));
  console.log(`Exported ${results.length} public HTML pages. Live database access disabled by default.`);
} finally { await server.close(); }
