import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
const template = readFileSync(new URL('./templates/supabase-auth.ts', import.meta.url), 'utf8');
const root = new URL('../base44/functions/', import.meta.url);
for (const entry of readdirSync(root, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const file = new URL(entry.name + '/entry.ts', root);
  let source;
  try { source = readFileSync(file, 'utf8'); } catch { continue; }
  if (source.includes("from './supabase-auth.ts'")) writeFileSync(new URL(entry.name + '/supabase-auth.ts', root), template);
}
