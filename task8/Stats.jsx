/**
 * @param {Object} props
 * @param {Array<{id: string|number, text: string, completed: boolean}>} props.todos
 */
export function Stats({ todos }) {
  const done = todos.filter((todo) => todo.completed).length;

  return (
    <p style={{ color: '#555', margin: '8px 0' }}>
      Всего: {todos.length} · Выполнено: {done} · Осталось: {todos.length - done}
    </p>
  );
}