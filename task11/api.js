// Локально клиент живёт на :8080 (или :5500 у Live Server), а API на :3001 —
// тогда адрес абсолютный. На Vercel фронтенд и API на одном домене,
// поэтому база пустая и запросы уходят относительными путями.
const API_BASE =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "http://localhost:3001"
    : "";

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(API_BASE + path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error(
      "Сервер недоступен: проверьте, что он запущен на порту 3001",
    );
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    throw new Error(
      body && body.error
        ? body.error
        : "Сервер вернул статус " + response.status,
    );
  }
  return body;
}

export const api = {
  getCategories: () => request("/categories"),

  createCategory: (payload) =>
    request("/categories", { method: "POST", body: JSON.stringify(payload) }),

  // Фильтры уезжают на сервер query-параметрами — фильтрация происходит в SQL
  getTransactions: (filters = {}) => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "")
        query.set(key, value);
    });
    const suffix = query.toString() ? "?" + query.toString() : "";
    return request("/transactions" + suffix);
  },

  createTransaction: (payload) =>
    request("/transactions", { method: "POST", body: JSON.stringify(payload) }),

  updateTransaction: (id, payload) =>
    request("/transactions/" + id, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteTransaction: (id) =>
    request("/transactions/" + id, { method: "DELETE" }),
};
