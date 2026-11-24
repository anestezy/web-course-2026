const express = require('express');
const { db } = require('../db');
const { isCorrectDate, validateTransactionBody } = require('../validation');

const router = express.Router();

const SELECT_WITH_CATEGORY = `
  SELECT t.id, t.amount, t.category_id, t.date, t.comment,
         c.name AS category_name, c.type AS category_type
  FROM transactions t
  JOIN categories c ON c.id = t.category_id
`;

function findTransaction(id) {
  return db.prepare(SELECT_WITH_CATEGORY + ' WHERE t.id = ?').get(id);
}

function categoryExists(id) {
  return Boolean(db.prepare('SELECT id FROM categories WHERE id = ?').get(id));
}

router.get('/', (req, res) => {
  try {
    const { category_id: categoryId, type, from, to } = req.query;
    const conditions = [];
    const params = [];

    if (categoryId !== undefined) {
      if (!/^\d+$/.test(categoryId)) {
        return res.status(400).json({ error: 'Параметр "category_id": целое число' });
      }
      conditions.push('t.category_id = ?');
      params.push(Number(categoryId));
    }
    if (type !== undefined) {
      if (type !== 'income' && type !== 'expense') {
        return res.status(400).json({ error: 'Параметр "type": "income" или "expense"' });
      }
      conditions.push('c.type = ?');
      params.push(type);
    }
    if (from !== undefined) {
      if (!isCorrectDate(from)) return res.status(400).json({ error: 'Параметр "from": дата YYYY-MM-DD' });
      conditions.push('t.date >= ?');
      params.push(from);
    }
    if (to !== undefined) {
      if (!isCorrectDate(to)) return res.status(400).json({ error: 'Параметр "to": дата YYYY-MM-DD' });
      conditions.push('t.date <= ?');
      params.push(to);
    }

    const where = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';
    const rows = db.prepare(SELECT_WITH_CATEGORY + where + ' ORDER BY t.date DESC, t.id DESC').all(...params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Не удалось получить операции: ' + err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const errors = validateTransactionBody(req.body);
    if (errors.length > 0) return res.status(400).json({ error: errors.join('; ') });
    if (!categoryExists(req.body.category_id)) {
      return res.status(400).json({ error: 'Категории с id ' + req.body.category_id + ' не существует' });
    }
    const { amount, category_id: categoryId, date, comment = null } = req.body;
    const result = db.prepare(
      'INSERT INTO transactions (amount, category_id, date, comment) VALUES (?, ?, ?, ?)'
    ).run(amount, categoryId, date, comment);
    res.status(201).json(findTransaction(result.lastInsertRowid));
  } catch (err) {
    res.status(500).json({ error: 'Не удалось создать операцию: ' + err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || !findTransaction(id)) {
      return res.status(404).json({ error: 'Операция с id ' + req.params.id + ' не найдена' });
    }
    const errors = validateTransactionBody(req.body);
    if (errors.length > 0) return res.status(400).json({ error: errors.join('; ') });
    if (!categoryExists(req.body.category_id)) {
      return res.status(400).json({ error: 'Категории с id ' + req.body.category_id + ' не существует' });
    }
    const { amount, category_id: categoryId, date, comment = null } = req.body;
    db.prepare('UPDATE transactions SET amount = ?, category_id = ?, date = ?, comment = ? WHERE id = ?')
      .run(amount, categoryId, date, comment, id);
    res.json(findTransaction(id));
  } catch (err) {
    res.status(500).json({ error: 'Не удалось обновить операцию: ' + err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = Number.isInteger(id)
      ? db.prepare('DELETE FROM transactions WHERE id = ?').run(id)
      : { changes: 0 };
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Операция с id ' + req.params.id + ' не найдена' });
    }
    res.json({ message: 'Операция #' + id + ' удалена' });
  } catch (err) {
    res.status(500).json({ error: 'Не удалось удалить операцию: ' + err.message });
  }
});

module.exports = router;