"""Prepare insert-only Supabase SQL batches from a Base44 JSON/CSV export ZIP.

Run from the repository root; write output outside the repository. No credentials are used.
Existing IDs are never overwritten. CSV companions are deliberately not imported twice.
"""
import argparse, datetime, hashlib, json, pathlib, re, zipfile

def prepare(archive, mapping, output, cap=350_000):
    output.mkdir(parents=True, exist_ok=True)
    archive_hash = hashlib.sha256(archive.read_bytes()).hexdigest()
    mapping = dict(mapping, CoverTemplateLead='cover_template_lead')
    groups = []
    counts = {}
    current = []
    current_size = 0
    batches = []
    source_ids = {}
    with zipfile.ZipFile(archive) as z:
        for name in z.namelist():
            if not re.fullmatch(r'json/[A-Za-z]+\.json', name):
                continue
            entity = pathlib.PurePosixPath(name).stem
            if entity not in mapping:
                raise ValueError(f'Unmapped entity: {entity}')
            rows = json.loads(z.read(name))
            if not isinstance(rows, list):
                raise ValueError(f'Expected array: {name}')
            seen = set()
            counts[entity] = len(rows)
            for row in rows:
                row_id = row.get('id')
                if not isinstance(row_id, str) or not row_id or row_id in seen:
                    raise ValueError(f'Missing/duplicate ID in {name}')
                seen.add(row_id)
                for field in ['created_date', 'updated_date']:
                    if row.get(field):
                        datetime.datetime.fromisoformat(row[field].replace('Z', '+00:00'))
                encoded = json.dumps(row, ensure_ascii=False, separators=(',', ':'), allow_nan=False)
                if '\\u0000' in encoded:
                    raise ValueError(f'Postgres-incompatible null character in {name}')
                size = len(encoded.encode())
                if current and current_size + size > cap:
                    batches.append(current)
                    current, current_size = [], 0
                if not current or current[-1][0] != entity:
                    current.append((entity, []))
                current[-1][1].append(row)
                current_size += size
            source_ids[entity] = sorted(seen)
    if current:
        batches.append(current)
    manifest = {'archive_sha256': archive_hash, 'records': sum(counts.values()), 'counts': counts, 'batches': []}
    for number, batch in enumerate(batches):
        batch_id = f'{archive_hash[:16]}-{number:03}'
        ctes, results = [], []
        for i, (entity, rows) in enumerate(batch):
            table = mapping[entity]
            if not re.fullmatch(r'[a-z_]+', table):
                raise ValueError('Invalid destination table')
            payload = json.dumps(rows, ensure_ascii=False, separators=(',', ':'), allow_nan=False)
            delimiter = f'$cb_{archive_hash[:16]}_{number}_{i}$'
            if delimiter in payload:
                raise ValueError('SQL delimiter collision')
            ctes.append(f's{i} as (select value as r from jsonb_array_elements({delimiter}{payload}{delimiter}::jsonb))')
            ctes.append(f'''i{i} as (insert into public."{table}" (id,data,created_date,updated_date,created_by)
select r->>'id', r - array['id','created_date','updated_date','created_by'],
coalesce(nullif(r->>'created_date','')::timestamptz,now()),
coalesce(nullif(r->>'updated_date','')::timestamptz,nullif(r->>'created_date','')::timestamptz,now()),
coalesce(r->>'created_by',r->>'created_by_id') from s{i}
on conflict(id) do nothing returning id)''')
            results.append(f"jsonb_build_object('entity','{entity}','requested',{len(rows)},'inserted',(select count(*) from i{i}),'skipped',{len(rows)}-(select count(*) from i{i}))")
        query = 'with ' + ',\n'.join(ctes) + f"\nselect jsonb_build_object('batch_id','{batch_id}','results',jsonb_build_array(" + ','.join(results) + ')) as import_result;'
        filename = f'{number:03}.sql'
        (output / filename).write_text(query)
        manifest['batches'].append({'file': filename, 'id': batch_id, 'counts': {entity:len(rows) for entity,rows in batch}, 'bytes': len(query.encode())})
    (output / 'manifest.json').write_text(json.dumps(manifest, indent=2))
    (output / 'source-ids.json').write_text(json.dumps(source_ids))
    (output / 'table-map.json').write_text(json.dumps(mapping))
    return manifest

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('archive', type=pathlib.Path)
    parser.add_argument('mapping', type=pathlib.Path)
    parser.add_argument('output', type=pathlib.Path)
    args = parser.parse_args()
    result = prepare(args.archive, json.loads(args.mapping.read_text()), args.output)
    print(json.dumps({'records':result['records'],'entities':len(result['counts']),'batches':len(result['batches']),'sha256':result['archive_sha256']}))
