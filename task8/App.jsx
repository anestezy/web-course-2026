import { useState } from 'react';
import { TodoForm } from './TodoForm';
import { Filters } from './Filters';
import { Stats } from './Stats';
import { TodoList } from './TodoList';
import './App.css';

export default function App() {
  console.log('RErender App');

  function generateTodos(N = 3) {
    const base = [
      { id: 't1', text: 'Разобраться с компонентами и props', completed: true },
      { id: 't2', text: 'Понять useState и поднятие состояния', completed: false },
    ];
    for (let i = 0; i < N; i++) {
      base.push({ id: i, text: 'Задача ' + i, completed: false });
    }
    return base;
  }

  const [todos, setTodos] = useState(() => generateTodos(3));
  const [filter, setFilter] = useState('all');

  const filters = {
    all: { label: 'Все', test: () => true },
    active: { label: 'Активные', test: (todo) => !todo.completed },
    completed: { label: 'Выполненные', test: (todo) => todo.completed },
  };

  const handleAddTodo = (text, completed) => {
    const newTodo = { id: Date.now(), text, completed };
    setTodos((prev) => [newTodo, ...prev]);
  };

  const handleToggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
    );
  };

  const handleDeleteTodo = (id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const visibleTodos = todos.filter(filters[filter].test);

  return (
    <div className="App" style={{ padding: '20px', maxWidth: '400px', fontFamily: 'sans-serif' }}>
      <h2>Мои задачи</h2>
      <TodoForm onAdd={handleAddTodo} />
      <Filters filters={filters} current={filter} onChange={setFilter} />
      <Stats todos={todos} />
      <TodoList todos={visibleTodos} onToggle={handleToggleTodo} onDelete={handleDeleteTodo} />
    </div>
  );
}