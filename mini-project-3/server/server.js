const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let expenses = [{ id: 1, description: 'Обед в кафе', amount: 2500, category: 'Еда', important: false }];
let nextId = 2;

app.get('/api/expenses', (req, res) => res.json(expenses));

app.get('/api/expenses/:id', (req, res) => {
  const expense = expenses.find(e => e.id === Number(req.params.id));
  if (!expense) return res.status(404).json({ error: 'Запись о расходе не найдена' });
  res.json(expense);
});

app.post('/api/expenses', (req, res) => {
  const { description, amount, category } = req.body || {};
  if (typeof description !== 'string' || description.trim() === '') {
    return res.status(400).json({ error: 'Поле description обязательно' });
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Поле amount должно быть положительным числом' });
  }
  if (typeof category !== 'string' || category.trim() === '') {
    return res.status(400).json({ error: 'Поле category обязательно' });
  }

  const expense = {
    id: nextId++,
    description: description.trim(),
    amount,
    category: category.trim(),
    important: false
  };
  expenses.push(expense);
  res.status(201).json(expense);
});

app.delete('/api/expenses/:id', (req, res) => {
  expenses = expenses.filter(e => e.id !== Number(req.params.id));
  res.status(204).end();
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ error: 'Ошибка сервера' });
});

module.exports = app;
if (require.main === module) {
  app.listen(3000, () => console.log('Сервер: http://localhost:3000'));
}
