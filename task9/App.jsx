import { useState, useEffect, useCallback, useMemo } from 'react';
import { TodoForm } from './TodoForm';
import { Filters } from './Filters';
import { Stats } from './Stats';
import { TodoList } from './TodoList';
import './App.css';

export default function App() {
  console.log('RErender App');

  function generateTodos(N = 3) {
    const now = Date.now();
    const base = [
      { id: 't1', text: 'Разобраться с компонентами и props', completed: true, createdAt: now - 3600000 },
      { id: 't2', text: 'Понять useState и поднятие состояния', completed: false, createdAt: now - 1800000 },
    ];
    for (let i = 0; i < N; i++) {
      base.push({ id: i, text: 'Задача ' + i, completed: false, createdAt: now - i * 60000 });
    }
    return base;
  }


  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem('todos-task8-9');
      if (saved) {
        return JSON.parse(saved).map((t) => ({ createdAt: 0, ...t }));
      }
    } catch {

    }
    return generateTodos(3);
  });

  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('none');

  const filters = useMemo(() => ({
    all: { label: 'Все', test: () => true },
    active: { label: 'Активные', test: (todo) => !todo.completed },
    completed: { label: 'Выполненные', test: (todo) => todo.completed },
  }), []);

  const sorts = useMemo(() => ({
    none: { label: 'Без сортировки', compare: null },
    alphaAsc: { label: 'А→Я', compare: (a, b) => a.text.localeCompare(b.text, 'ru') },
    alphaDesc: { label: 'Я→А', compare: (a, b) => b.text.localeCompare(a.text, 'ru') },
    dateNew: { label: 'Сначала новые', compare: (a, b) => b.createdAt - a.createdAt },
    dateOld: { label: 'Сначала старые', compare: (a, b) => a.createdAt - b.createdAt },
  }), []);


  const handleAddTodo = useCallback((text, completed) => {
    const now = Date.now();
    const newTodo = { id: now, text, completed, createdAt: now };
    setTodos((prev) => [newTodo, ...prev]);
  }, []);

  const handleToggleTodo = useCallback((id) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
    );
  }, []);

  const handleDeleteTodo = useCallback((id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);


  useEffect(() => {
    localStorage.setItem('todos-task8-9', JSON.stringify(todos));
  }, [todos]);

 
  const visibleTodos = useMemo(() => {
    const filtered = todos.filter(filters[filter].test);
    const compare = sorts[sort].compare;
    return compare ? [...filtered].sort(compare) : filtered;
  }, [todos, filter, sort, filters, sorts]);

  return (
    <div className="App" style={{ padding: '20px', maxWidth: '400px', fontFamily: 'sans-serif' }}>
      <h2>Мои задачи</h2>
      <TodoForm onAdd={handleAddTodo} />
      <Filters filters={filters} current={filter} onChange={setFilter} />
      <label style={{ display: 'block', margin: '8px 0' }}>
        Сортировка:{' '}
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          {Object.entries(sorts).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </label>
      <Stats todos={todos} />
      <TodoList todos={visibleTodos} onToggle={handleToggleTodo} onDelete={handleDeleteTodo} />
    </div>
  );
}