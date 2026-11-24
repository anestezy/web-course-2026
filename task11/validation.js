const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isCorrectDate(value) {
  return typeof value === 'string' && DATE_PATTERN.test(value) && !Number.isNaN(Date.parse(value));
}

function validateCategoryBody(body) {
  const errors = [];
  const { name, type } = body || {};
  if (typeof name !== 'string' || name.trim() === '') {
    errors.push('поле "name": непустая строка');
  }
  if (type !== 'income' && type !== 'expense') {
    errors.push('поле "type": должно быть "income" или "expense"');
  }
  return errors;
}

function validateTransactionBody(body) {
  const errors = [];
  const { amount, category_id: categoryId, date, comment } = body || {};
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    errors.push('поле "amount": число больше 0');
  }
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    errors.push('поле "category_id": целое число (id категории)');
  }
  if (!isCorrectDate(date)) {
    errors.push('поле "date": дата в формате YYYY-MM-DD');
  }
  if (comment !== undefined && comment !== null && typeof comment !== 'string') {
    errors.push('поле "comment": строка или null');
  }
  return errors;
}

module.exports = { isCorrectDate, validateCategoryBody, validateTransactionBody };