import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir,readFile } from 'node:fs/promises';
import { models } from '../supabase/functions/_shared/models.js';
async function files(dir){const out=[];for(const file of await readdir(dir,{withFileTypes:true})){const path=dir+'/'+file.name;if(file.isDirectory())out.push(...await files(path));else out.push(path);}return out;}
test('every application and server function call has a deployable entrypoint',async()=>{
 const paths=await files('supabase/functions');const names=new Set(paths.filter(p=>p.endsWith('/index.ts')).map(p=>p.split('/').at(-2)));
 for(const path of [...paths,...await files('src')].filter(p=>/\.(jsx?|ts)$/.test(p))){const source=await readFile(path,'utf8');for(const match of source.matchAll(/functions.invoke\(['"]([^'"]+)/g))assert.ok(names.has(match[1]),`${path} calls missing function ${match[1]}`);}
});
test('every referenced entity has a Supabase table mapping and no Base44 SDK import remains',async()=>{
 for(const path of [...await files('src'),...await files('supabase/functions')].filter(p=>/\.(jsx?|ts)$/.test(p))){const source=await readFile(path,'utf8');assert.ok(!/from\s+['"](?:npm:)?@base44\//.test(source),path);for(const match of source.matchAll(/\.entities\.(\w+)/g))assert.ok(models[match[1]],`${path} references missing entity ${match[1]}`);}
});
