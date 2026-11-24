import TodoItem from './TodoItem';

/**
 * @param {Object} props
 * @param {Array<{id: string|number, text: string, completed: boolean}>} props.todos
 * @param {(id: string|number) => void} props.onToggle
 * @param {(id: string|number) => void} props.onDelete
 */
export function TodoList({ todos, onToggle, onDelete }) {
  if (todos.length === 0) {
    return <p style={{ color: '#888' }}>Список задач пуст</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}