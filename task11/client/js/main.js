import { api } from './api.js';
import {
  fillCategorySelect, renderTransactions, renderSummary,
  showStatus, hideStatus,
} from './ui.js';

const dom = {
  status: document.getElementById('status'),
  themeToggle: document.getElementById('theme-toggle'),
  summaryIncome: document.getElementById('summary-income'),
  summaryExpense: document.getElementById('summary-expense'),
  summaryBalance: document.getElementById('summary-balance'),
  filterCategory: document.getElementById('filter-category'),
  filterType: document.getElementById('filter-type'),
  filterFrom: document.getElementById('filter-from'),
  filterTo: document.getElementById('filter-to'),
  filtersApply: document.getElementById('filters-apply'),
  filtersReset: document.getElementById('filters-reset'),
  transactionForm: document.getElementById('transaction-form'),
  formTitle: document.getElementById('transaction-form-title'),
  fieldAmount: document.getElementById('field-amount'),
  fieldType: document.getElementById('field-type'),
  fieldCategory: document.getElementById('field-category'),
  fieldDate: document.getElementById('field-date'),
  fieldComment: document.getElementById('field-comment'),
  transactionSubmit: document.getElementById('transaction-submit'),
  transactionCancel: document.getElementById('transaction-cancel'),
  categoryForm: document.getElementById('category-form'),
  categoryName: document.getElementById('category-name'),
  categoryType: document.getElementById('category-type'),
  transactionsBody: document.getElementById('transactions-body'),
};

const STORAGE_KEYS = { filters: 'zenMoney.filters', theme: 'zenMoney.theme' };
const state = { categories: [], transactions: [], editingId: null, pendingCategoryId: '' };

function todayIso() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function readFilters() {
  return {
    category_id: dom.filterCategory.value,
    type: dom.filterType.value,
    from: dom.filterFrom.value,
    to: dom.filterTo.value,
  };
}

function readSavedFilters() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.filters) ?? 'null');
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function applySavedFilters(saved) {
  if (!saved) return;
  dom.filterType.value = saved.type ?? '';
  dom.filterFrom.value = saved.from ?? '';
  dom.filterTo.value = saved.to ?? '';
  state.pendingCategoryId = saved.category_id ?? '';
}

async function safeRun(action) {
  try {
    await action();
  } catch (err) {
    showStatus(dom.status, err.message, 'error');
  }
}

async function loadCategories() {
  state.categories = await api.getCategories();
  fillCategorySelect(dom.filterCategory, state.categories, {
    allLabel: 'Все категории',
    selectedValue: state.pendingCategoryId || dom.filterCategory.value,
  });
  state.pendingCategoryId = '';
  refreshFormCategories();
}

function refreshFormCategories(selectedValue = dom.fieldCategory.value) {
  fillCategorySelect(dom.fieldCategory, state.categories, { type: dom.fieldType.value, selectedValue });
}

async function loadTransactions() {
  state.transactions = await api.getTransactions(readFilters());
  renderTransactions(state.transactions, dom.transactionsBody);
  renderSummary(state.transactions, {
    income: dom.summaryIncome, expense: dom.summaryExpense, balance: dom.summaryBalance,
  });
}

function resetTransactionForm() {
  state.editingId = null;
  dom.transactionForm.reset();
  dom.fieldType.value = 'expense';
  dom.fieldDate.value = todayIso();
  refreshFormCategories();
  dom.formTitle.textContent = 'Добавить операцию';
  dom.transactionSubmit.textContent = 'Добавить';
  dom.transactionCancel.classList.add('hidden');
}

function startEdit(id) {
  const tx = state.transactions.find((item) => item.id === id);
  if (!tx) return;
  state.editingId = id;
  dom.fieldAmount.value = tx.amount;
  dom.fieldType.value = tx.category_type;
  refreshFormCategories(tx.category_id);
  dom.fieldDate.value = tx.date;
  dom.fieldComment.value = tx.comment ?? '';
  dom.formTitle.textContent = 'Редактирование операции #' + id;
  dom.transactionSubmit.textContent = 'Сохранить';
  dom.transactionCancel.classList.remove('hidden');
}

dom.transactionForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const payload = {
    amount: Number(dom.fieldAmount.value),
    category_id: dom.fieldCategory.value === '' ? null : Number(dom.fieldCategory.value),
    date: dom.fieldDate.value,
    comment: dom.fieldComment.value.trim() === '' ? null : dom.fieldComment.value.trim(),
  };
  const problems = [];
  if (dom.fieldAmount.value === '' || !Number.isFinite(payload.amount) || payload.amount <= 0) problems.push('сумма должна быть числом больше 0');
  if (!payload.category_id) problems.push('выберите категорию');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) problems.push('укажите дату');
  if (problems.length > 0) {
    showStatus(dom.status, 'Проверьте форму: ' + problems.join(', '), 'error');
    return;
  }

  safeRun(async () => {
    hideStatus(dom.status);
    if (state.editingId === null) {
      await api.createTransaction(payload);
      showStatus(dom.status, 'Операция добавлена', 'success');
    } else {
      await api.updateTransaction(state.editingId, payload);
      showStatus(dom.status, 'Операция обновлена', 'success');
    }
    resetTransactionForm();
    await loadTransactions();
  });
});

dom.transactionCancel.addEventListener('click', resetTransactionForm);
dom.fieldType.addEventListener('change', () => refreshFormCategories());

dom.transactionsBody.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const id = Number(button.dataset.id);
  if (button.dataset.action === 'edit') {
    startEdit(id);
    return;
  }
  if (!window.confirm('Удалить операцию #' + id + '?')) return;
  safeRun(async () => {
    hideStatus(dom.status);
    await api.deleteTransaction(id);
    showStatus(dom.status, 'Операция удалена', 'success');
    await loadTransactions();
  });
});

dom.categoryForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = dom.categoryName.value.trim();
  if (name === '') {
    showStatus(dom.status, 'Введите название категории', 'error');
    return;
  }
  safeRun(async () => {
    hideStatus(dom.status);
    await api.createCategory({ name, type: dom.categoryType.value });
    dom.categoryName.value = '';
    await loadCategories();
    showStatus(dom.status, 'Категория «' + name + '» создана', 'success');
  });
});

dom.filtersApply.addEventListener('click', () => {
  localStorage.setItem(STORAGE_KEYS.filters, JSON.stringify(readFilters()));
  safeRun(async () => {
    hideStatus(dom.status);
    await loadTransactions();
  });
});

dom.filtersReset.addEventListener('click', () => {
  dom.filterCategory.value = '';
  dom.filterType.value = '';
  dom.filterFrom.value = '';
  dom.filterTo.value = '';
  localStorage.setItem(STORAGE_KEYS.filters, JSON.stringify(readFilters()));
  safeRun(async () => {
    hideStatus(dom.status);
    await loadTransactions();
  });
});

function applyTheme(theme) {
  document.body.classList.toggle('light', theme === 'light');
  dom.themeToggle.textContent = theme === 'light' ? 'Тёмная тема' : 'Светлая тема';
}

dom.themeToggle.addEventListener('click', () => {
  const next = document.body.classList.contains('light') ? 'dark' : 'light';
  localStorage.setItem(STORAGE_KEYS.theme, next);
  applyTheme(next);
});

applySavedFilters(readSavedFilters());
applyTheme(localStorage.getItem(STORAGE_KEYS.theme) ?? 'dark');
dom.fieldDate.value = todayIso();
safeRun(async () => {
  await loadCategories();
  await loadTransactions();
});