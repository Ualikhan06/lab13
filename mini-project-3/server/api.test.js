const test = require('node:test');
const assert = require('node:assert');
const app = require('./server');

let server, base;

test.before(() => new Promise(resolve => {
  server = app.listen(0, () => {
    base = `http://localhost:${server.address().port}`;
    resolve();
  });
}));

test.after(() => server.close());

test('GET /api/expenses возвращает массив', async () => {
  const res = await fetch(`${base}/api/expenses`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
});

test('POST /api/expenses создаёт запись о расходе', async () => {
  const res = await fetch(`${base}/api/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: 'Продукты',
      amount: 5000,
      category: 'Еда'
    })
  });
  assert.strictEqual(res.status, 201);
  const expense = await res.json();
  assert.strictEqual(expense.description, 'Продукты');
  assert.strictEqual(expense.amount, 5000);
  assert.strictEqual(expense.category, 'Еда');
});

test('DELETE /api/expenses/1 удаляет расход', async () => {
  const delRes = await fetch(`${base}/api/expenses/1`, {
    method: 'DELETE'
  });
  assert.strictEqual(delRes.status, 204);

  const getRes = await fetch(`${base}/api/expenses`);
  const data = await getRes.json();
  assert.strictEqual(data.some(item => item.id === 1), false);
});
test('GET /api/expenses/999 возвращает 404', async () => {
  const res = await fetch(`${base}/api/expenses/999`);
  assert.strictEqual(res.status, 404);
});

test('POST /api/expenses с пустым description возвращает 400', async () => {
  const res = await fetch(`${base}/api/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description: '', amount: 500, category: 'Еда' })
  });
  assert.strictEqual(res.status, 400);
});
