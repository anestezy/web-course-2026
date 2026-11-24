const express = require('express');
const { db } = require('../db');
const { validateCategoryBody } = require('../validation');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY id').all();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Не удалось получить категории: ' + err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const errors = validateCategoryBody(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join('; ') });
    }
    const name = req.body.name.trim();
    const result = db.prepare('INSERT INTO categories (name, type) VALUES (?, ?)').run(name, req.body.type);
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: 'Не удалось создать категорию: ' + err.message });
  }
});

module.exports = router;