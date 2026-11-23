import { useState } from 'react';

/**
 * @param {Object} props
 * @param {(text: string, completed: boolean) => void} props.onAdd
 */
export function TodoForm({ onAdd }) {
  const [text, setText] = useState('');
  const [completed, setCompleted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    onAdd(text.trim(), completed);
    setText('');
    setCompleted(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Новая задача..."
        style={{ flex: 1, padding: '6px' }}
      />
      <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <input
          type="checkbox"
          checked={completed}
          onChange={(e) => setCompleted(e.target.checked)}
        />
        выполнена
      </label>
      <button type="submit">Добавить</button>
    </form>
  );
}