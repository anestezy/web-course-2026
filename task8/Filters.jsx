/**
 * @param {Object} props
 * @param {Object<string, {label: string, test: function}>} props.filters
 * @param {string} props.current - ключ активного фильтра
 * @param {(key: string) => void} props.onChange
 */
export function Filters({ filters, current, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
      {Object.entries(filters).map(([key, { label }]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          style={{ fontWeight: key === current ? 'bold' : 'normal' }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}