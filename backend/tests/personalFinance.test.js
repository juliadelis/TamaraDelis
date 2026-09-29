const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function setup({ expenses = [], sessions = [], saved = { id: 'saved' } } = {}) {
  const routes = {}, calls = [];
  const router = { use() {} };
  for (const method of ['get', 'post', 'put', 'delete']) router[method] = (url, handler) => { routes[`${method} ${url}`] = handler; };
  function from(table) {
    const query = {};
    for (const method of ['select', 'gte', 'lt', 'lte', 'order', 'eq', 'is', 'not', 'or', 'insert', 'update', 'delete']) {
      query[method] = (...args) => { calls.push({ table, method, args }); return query; };
    }
    query.range = async (start, end) => ({ data: (table === 'personal_expenses' ? expenses : sessions).slice(start, end + 1), error: null });
    query.maybeSingle = async () => ({ data: saved, error: null });
    return query;
  }
  const source = fs.readFileSync(path.join(__dirname, '../src/routes/personalFinance.ts'), 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(output, { exports: {}, console, require(name) {
    if (name === 'express') return { Router: () => router };
    if (name.includes('middleware/auth')) return { requireAuth() {} };
    if (name.includes('supabaseClient')) return {
      supabase: { from }, createAuthenticatedSupabaseClient(token) { assert.equal(token, 'test-token'); return { from }; },
    };
    throw new Error(name);
  } });
  return { calls, async request(route, { body, query = { year: '2025', month: '5' }, id } = {}) {
    const response = { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; }, send() { return this; } };
    await routes[route]({ body, query, params: id ? { id } : {}, user: { id: 'owner' }, headers: { authorization: 'Bearer test-token' } }, response);
    return response;
  } };
}
const id = '00000000-0000-0000-0000-000000000001';
const validExpense = { name: ' Mercado ', amount: 12.34, category: 'mercado', spent_on: '2025-05-12' };

test('monthly summary reads every page and calculates money in cents', async () => {
  const app = setup({ expenses: Array.from({ length: 1001 }, (_, index) => ({ id: String(index), amount: 0.10 })), sessions: [{ paid_amount: 0, session_price: 100 }, { paid_amount: null, session_price: 80 }, { paid_amount: 0.30, session_price: 10 }] });
  const result = await app.request('get /');
  assert.equal(result.code, 200);
  assert.equal(result.body.expenses.length, 1001);
  assert.equal(result.body.received, 80.30);
  assert.equal(result.body.spent, 100.10);
  assert.equal(result.body.balance, -19.80);
  assert.ok(app.calls.some(call => call.method === 'eq' && call.args[0] === 'user_id' && call.args[1] === 'owner'));
  assert.ok(app.calls.some(call => call.method === 'eq' && call.args[0] === 'payment_status' && call.args[1] === 'paid'));
  const period = app.calls.find(call => call.method === 'or').args[0];
  assert.match(period, /paid_at.gte.2025-05-01T03:00:00.000Z/);
  assert.match(period, /paid_at.lt.2025-06-01T03:00:00.000Z/);
  assert.match(period, /paid_at.is.null,starts_at.gte/);
});

test('rejects invalid period and expense fields', async () => {
  const app = setup();
  assert.equal((await app.request('get /', { query: { year: '2025', month: '13' } })).code, 400);
  for (const change of [{ amount: 0 }, { amount: -2 }, { amount: 1.234 }, { amount: '20' }, { name: ' ' }, { category: 'invalid' }, { spent_on: '2025-02-30' }, { spent_on: '2100-01-01' }]) {
    assert.equal((await app.request('post /', { body: { ...validExpense, ...change } })).code, 400);
  }
});

test('create and update whitelist fields and filter mutations by ID', async () => {
  const app = setup();
  assert.equal((await app.request('post /', { body: { ...validExpense, user_id: 'other' } })).code, 201);
  const payload = app.calls.find(call => call.method === 'insert').args[0];
  assert.equal(payload.name, 'Mercado');
  assert.equal(payload.user_id, undefined);
  assert.equal((await app.request('put /:id', { id, body: validExpense })).code, 200);
  assert.ok(app.calls.some(call => call.method === 'eq' && call.args[0] === 'id' && call.args[1] === id));
  assert.equal((await app.request('delete /:id', { id })).code, 204);
});

test('missing or inaccessible expenses return 404', async () => {
  const app = setup({ saved: null });
  assert.equal((await app.request('put /:id', { id, body: validExpense })).code, 404);
  assert.equal((await app.request('delete /:id', { id })).code, 404);
  assert.equal((await app.request('delete /:id', { id: 'invalid' })).code, 400);
});
