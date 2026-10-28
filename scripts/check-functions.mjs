import { build } from 'esbuild';
import { readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const folders=await readdir('supabase/functions',{withFileTypes:true});
const entryPoints=folders.filter(f=>f.isDirectory()&&f.name!=='_shared').map(f=>`supabase/functions/${f.name}/index.ts`);
await build({entryPoints,bundle:true,outdir:join(tmpdir(),'creative-books-function-check'),platform:'neutral',format:'esm',external:['npm:*','https:*','http:*'],logLevel:'warning'});
console.log(`Bundled ${entryPoints.length} Supabase Edge Functions. This checks imports and syntax, not external provider behavior.`);
