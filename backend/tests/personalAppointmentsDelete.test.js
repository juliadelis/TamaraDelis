const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');
const id = '00000000-0000-0000-0000-000000000002';
async function run(scope, grouped = true) {
  let handler;
  const rows = [
    { id: 'before', recurrence_group_id: 'series', starts_at: '2026-10-01T12:00:00Z' },
    { id, recurrence_group_id: grouped ? 'series' : null, starts_at: '2026-10-08T12:00:00Z' },
    { id: 'after', recurrence_group_id: 'series', starts_at: '2026-10-15T12:00:00Z' },
    { id: 'unrelated', recurrence_group_id: 'other', starts_at: '2026-10-15T12:00:00Z' },
  ];
  const router = { use() {}, get() {}, put() {}, post() {}, delete(url, fn) { handler = fn; } };
  const client = { from() {
    let deleting = false;
    const filters = [];
    const query = {
      delete() { deleting = true; return this; },
      eq(key, value) { filters.push(row => row[key] === value); return this; },
      gte(key, value) { filters.push(row => row[key] >= value); return this; },
      select() { return deleting ? Promise.resolve({ data: rows.filter(row => filters.every(filter => filter(row))), error: null }) : this; },
      async maybeSingle() { return { data: rows.find(row => filters.every(filter => filter(row))), error: null }; },
    };
    return query;
  } };
  const source = fs.readFileSync(path.join(__dirname, '../src/routes/personalAppointments.ts'), 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(output, { exports: {}, console, require(name) {
    if (name === 'express') return { Router: () => router };
    if (name.includes('middleware/auth')) return { requireAuth() {} };
    return { createAuthenticatedSupabaseClient(token) { assert.equal(token, 'user-token'); return client; } };
  } });
  const res = { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
  await handler({ params: { id }, query: { scope }, headers: { authorization: 'Bearer user-token' } }, res);
  return res;
}
test('single removes only the selected event', async () => {
  assert.equal(JSON.stringify((await run('single')).body.deletedIds), JSON.stringify([id]));
});
test('all removes the entire series without touching another series', async () => {
  assert.equal(JSON.stringify((await run('all')).body.deletedIds), JSON.stringify(['before', id, 'after']));
});
test('future includes the selected event and preserves earlier events and other series', async () => {
  assert.equal(JSON.stringify((await run('future')).body.deletedIds), JSON.stringify([id, 'after']));
});
test('ungrouped appointments remain single deletions and invalid scopes are rejected', async () => {
  assert.equal(JSON.stringify((await run('all', false)).body.deletedIds), JSON.stringify([id]));
  assert.equal((await run('invalid')).code, 400);
});
