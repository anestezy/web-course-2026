const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');
const categoriesRouter = require('./routes/categories');
const transactionsRouter = require('./routes/transactions');

const app = express();

app.use(cors());
app.use(express.json());

initDb();

app.use('/categories', categoriesRouter);
app.use('/transactions', transactionsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут ' + req.method + ' ' + req.path + ' не найден' });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Некорректный JSON в теле запроса' });
  }
  res.status(500).json({ error: 'Внутренняя ошибка сервера: ' + err.message });
});

module.exports = app;