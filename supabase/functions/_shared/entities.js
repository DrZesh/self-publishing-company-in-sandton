import { models } from './models.js';
export function unwrap(row) {
  if (!row) return null;
  return { ...row.data, id: row.id, created_date: row.created_date, updated_date: row.updated_date, created_by: row.created_by };
}
function checked(result) { if (result.error) throw result.error; return result.data; }
export function createEntities(client, { decorate = async value => value } = {}) {
  const cache = {};
  return new Proxy({}, { get(_, name) {
    if (typeof name !== 'string' || !models[name]) throw new Error(`Unknown entity: ${String(name)}`);
    if (cache[name]) return cache[name];
    const { table, defaults } = models[name];
    async function list(filters = {}, sort = '-created_date', limit, skip = 0, fields) {
      const result = []; let offset = skip; const desired = limit ?? Infinity;
      while (result.length < desired) {
        const count = Math.min(500, desired - result.length);
        const rows = checked(await client.rpc('cb_list', { entity_table: table, query_filter: filters, sort_field: sort || '-created_date', page_size: count, page_offset: offset }));
        result.push(...rows.map(unwrap));
        if (rows.length < count) break;
        offset += rows.length;
      }
      const decorated = await decorate(result);
      if (!fields?.length) return decorated;
      return decorated.map(row => Object.fromEntries(['id', ...fields].map(key => [key, row[key]])));
    }
    function clean(data) { const { id, created_date, updated_date, created_by, ...value } = data; return value; }
    async function create(data) {
      return decorate(unwrap(checked(await client.from(table).insert({ data: { ...structuredClone(defaults), ...clean(data) } }).select().single())));
    }
    return cache[name] = {
      list: (sort, limit, skip, fields) => list({}, sort, limit, skip, fields), filter: list,
      get: async id => decorate(unwrap(checked(await client.from(table).select('*').eq('id', id).single()))),
      create,
      bulkCreate: async records => decorate(checked(await client.from(table).insert(records.map(data => ({ data: { ...structuredClone(defaults), ...clean(data) } }))).select()).map(unwrap)),
      update: async (id, data) => decorate(unwrap(checked(await client.rpc('cb_patch', { entity_table: table, row_id: id, patch: clean(data) })))),
      delete: async id => { checked(await client.from(table).delete().eq('id', id)); return { id }; },
      subscribe: callback => {
        const channel = client.channel(`${table}:${crypto.randomUUID()}`).on('postgres_changes', { event: '*', schema: 'public', table }, event => callback({ type: { INSERT: 'create', UPDATE: 'update', DELETE: 'delete' }[event.eventType], id: event.new?.id || event.old?.id, data: unwrap(event.new?.id ? event.new : event.old) })).subscribe();
        return () => { client.removeChannel(channel); };
      },
    };
  } });
}
