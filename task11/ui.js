const moneyFormat = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(value) {
  return moneyFormat.format(value);
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function fillCategorySelect(
  select,
  categories,
  { allLabel = null, type = null, selectedValue = "" } = {},
) {
  const visible = type
    ? categories.filter((category) => category.type === type)
    : categories;
  const options = [];
  if (allLabel)
    options.push('<option value="">' + escapeHtml(allLabel) + "</option>");
  visible.forEach((category) => {
    const selected =
      String(category.id) === String(selectedValue) ? " selected" : "";
    options.push(
      '<option value="' +
        category.id +
        '"' +
        selected +
        ">" +
        escapeHtml(category.name) +
        "</option>",
    );
  });
  select.innerHTML = options.join("");
}

export function renderTransactions(transactions, tbody) {
  if (transactions.length === 0) {
    tbody.innerHTML =
      '<tr class="empty-row"><td colspan="5">Операций не найдено — добавьте первую или измените фильтры.</td></tr>';
    return;
  }
  tbody.innerHTML = transactions
    .map((tx) => {
      const sign = tx.category_type === "income" ? "+" : "−";
      return (
        "<tr>" +
        "<td>" +
        escapeHtml(tx.date) +
        "</td>" +
        "<td>" +
        escapeHtml(tx.category_name) +
        "</td>" +
        "<td>" +
        (tx.comment ? escapeHtml(tx.comment) : "—") +
        "</td>" +
        '<td class="amount ' +
        tx.category_type +
        '">' +
        sign +
        formatMoney(tx.amount) +
        "</td>" +
        '<td class="actions">' +
        '<button type="button" data-action="edit" data-id="' +
        tx.id +
        '">Изменить</button>' +
        '<button type="button" data-action="delete" data-id="' +
        tx.id +
        '">Удалить</button>' +
        "</td>" +
        "</tr>"
      );
    })
    .join("");
}

export function renderSummary(transactions, elements) {
  let income = 0;
  let expense = 0;
  transactions.forEach((tx) => {
    if (tx.category_type === "income") income += tx.amount;
    else expense += tx.amount;
  });
  const balance = income - expense;
  elements.income.textContent = formatMoney(income);
  elements.expense.textContent = formatMoney(expense);
  elements.balance.textContent = formatMoney(balance);
  elements.balance.classList.toggle("negative", balance < 0);
}

export function showStatus(container, message, kind = "error") {
  container.textContent = message;
  container.className = "status " + kind;
}

export function hideStatus(container) {
  container.textContent = "";
  container.className = "status hidden";
}
