/**
 * @param {Object} props
 * @param {{id: string|number, text: string, completed: boolean}} props.todo
 * @param {(id: string|number) => void} props.onToggle
 * @param {(id: string|number) => void} props.onDelete
 */
function TodoItem({ todo, onToggle, onDelete }) {
  console.log('render ' + todo.text);

  return (
    <li
      style={{
        display: 'flex',
        gap: '10px',
        padding: '8px',
        border: '1px solid #ddd',
        alignItems: 'center',
      }}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span
        style={{
          flex: 1,
          textDecoration: todo.completed ? 'line-through' : 'none',
          color: todo.completed ? '#888' : 'inherit',
        }}
      >
        {todo.text}
      </span>
      <button onClick={() => onDelete(todo.id)} style={{ color: 'red' }}>
        Удалить
      </button>
    </li>
  );
}

export default TodoItem;