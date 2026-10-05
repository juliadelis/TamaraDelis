const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function setup(result = { data: { id: 'saved', expense: null }, error: null }) {
  const routes = {}, calls = [];
  const router = { use() {} };
  for (const method of ['get', 'post', 'put', 'delete']) router[method] = (url, handler) => { routes[`${method} ${url}`] = handler; };
  const source = fs.readFileSync(path.join(__dirname, '../src/routes/personalAppointments.ts'), 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(output, { exports: {}, console: { error() {} }, require(name) {
    if (name === 'express') return { Router: () => router };
    if (name.includes('middleware/auth')) return { requireAuth() {} };
    if (name.includes('supabaseClient')) return { createAuthenticatedSupabaseClient(token) {
      assert.equal(token, 'test-token');
      return { async rpc(name, payload) { calls.push({ name, payload }); return result; } };
    } };
    throw new Error(name);
  } });
  return { calls, async request(body, id) {
    const response = { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    await routes[id ? 'put /:id' : 'post /']({ body, params: id ? { id } : {}, headers: { authorization: 'Bearer test-token' } }, response);
    return response;
  } };
}
const appointment = { name: 'Consulta pessoal', starts_at: '2026-09-29T12:00:00Z', duration_minutes: 60, notes: '' };

test('recurrence uses one atomic operation with frequency, end date and financial fields', async () => {
  for (const recurrence of ['weekly', 'biweekly', 'monthly']) {
    const app = setup();
    const response = await app.request({ ...appointment, recurrence_type: recurrence, recurrence_until: '2027-01-31', amount: 50, category: 'saude' });
    assert.equal(response.code, 201);
    assert.equal(app.calls.length, 1);
    assert.equal(app.calls[0].name, 'create_recurring_personal_appointments');
    assert.equal(app.calls[0].payload.p_recurrence, recurrence);
    assert.equal(app.calls[0].payload.p_until, '2027-01-31');
    assert.equal(app.calls[0].payload.p_amount, 50);
  }
});

test('invalid recurrence dates and attempts to create a series during editing are rejected', async () => {
  for (const until of [undefined, '2026-02-30', '2026-09-28', '2029-01-01']) {
    const app = setup();
    assert.equal((await app.request({ ...appointment, recurrence_type: 'weekly', recurrence_until: until })).code, 400);
    assert.equal(app.calls.length, 0);
  }
  const app = setup();
  assert.equal((await app.request({ ...appointment, recurrence_type: 'weekly', recurrence_until: '2027-01-01' }, '00000000-0000-0000-0000-000000000001')).code, 400);
});

test('blank value saves the appointment without a financial amount or category', async () => {
  for (const amount of [undefined, null, '']) {
    const app = setup();
    assert.equal((await app.request({ ...appointment, amount, category: 'saude' })).code, 201);
    assert.equal(app.calls.length, 1);
    assert.equal(app.calls[0].payload.p_amount, null);
    assert.equal(app.calls[0].payload.p_category, null);
  }
});

test('amount and category are sent in the same atomic operation as the appointment', async () => {
  const app = setup();
  assert.equal((await app.request({ ...appointment, amount: 75.50, category: 'saude' })).code, 201);
  assert.equal(app.calls[0].name, 'save_personal_appointment_with_expense');
  assert.equal(app.calls[0].payload.p_amount, 75.50);
  assert.equal(app.calls[0].payload.p_category, 'saude');
  assert.equal(app.calls[0].payload.p_name, appointment.name);
});

test('editing or clearing the amount retains the appointment ID for synchronization', async () => {
  const id = '00000000-0000-0000-0000-000000000001';
  for (const amount of [50, null]) {
    const app = setup();
    assert.equal((await app.request({ ...appointment, amount, category: 'saude' }, id)).code, 200);
    assert.equal(app.calls[0].payload.p_id, id);
    assert.equal(app.calls[0].payload.p_amount, amount);
  }
});

test('invalid amounts and missing categories do not reach the database', async () => {
  for (const fields of [{ amount: 0 }, { amount: -1 }, { amount: 1.234 }, { amount: '10' }, { amount: 10, category: '' }, { amount: 10, category: 'invalid' }]) {
    const app = setup();
    assert.equal((await app.request({ ...appointment, category: 'saude', ...fields })).code, 400);
    assert.equal(app.calls.length, 0);
  }
});

test('database failure is reported instead of reporting a partial save as success', async () => {
  const app = setup({ data: null, error: { message: 'transaction failed' } });
  assert.equal((await app.request({ ...appointment, amount: 10, category: 'saude' })).code, 500);
});
