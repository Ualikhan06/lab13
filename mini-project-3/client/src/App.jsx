import { useEffect, useState } from 'react';
import ExpenseItem from './ExpenseItem';

const CATEGORIES = ['Еда', 'Транспорт', 'Покупки', 'Развлечения'];
const BAR_COLORS = {
  Еда: '#f59e0b',
  Транспорт: '#3b82f6',
  Покупки: '#ec4899',
  Развлечения: '#8b5cf6'
};

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Еда');
  const [filter, setFilter] = useState('Все');

  useEffect(() => {
    fetch('http://localhost:3000/api/expenses')
      .then(res => {
        if (!res.ok) throw new Error('Статус ' + res.status);
        return res.json();
      })
      .then(setExpenses)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    try {
      const res = await fetch('http://localhost:3000/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          amount: Number(amount),
          category
        })
      });
      if (!res.ok) throw new Error('Ошибка при добавлении');
      const created = await res.json();
      setExpenses(prev => [...prev, created]);
      setDescription('');
      setAmount('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleHighlight = (id) => {
    setExpenses(prev =>
      prev.map(item => (item.id === id ? { ...item, important: !item.important } : item))
    );
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:3000/api/expenses/${id}`, { method: 'DELETE' });
    setExpenses(prev => prev.filter(item => item.id !== id));
  };

  const handleClearChecked = async () => {
    const checked = expenses.filter(item => item.important);
    await Promise.all(
      checked.map(item => fetch(`http://localhost:3000/api/expenses/${item.id}`, { method: 'DELETE' }))
    );
    setExpenses(prev => prev.filter(item => !item.important));
  };

  const filteredExpenses = filter === 'Все'
    ? expenses
    : expenses.filter(item => item.category === filter);

  const totalAmount = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const checkedCount = expenses.filter(item => item.important).length;

  const inputStyle = {
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    outline: 'none'
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif', color: '#64748b' }}>
        <p style={{ fontSize: '18px' }}>⏳ Загрузка расходов...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '480px', margin: '60px auto', padding: '20px', backgroundColor: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#dc2626', margin: 0, fontWeight: '600' }}>Ошибка: {error}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflowY: 'auto',
        background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #f0fdf4 100%)',
        padding: '36px 16px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#0f172a'
      }}
    >
      <div
        style={{
          maxWidth: '660px',
          margin: '0 auto',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '28px',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>💳 Учёт расходов</h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
              Всего записей: {expenses.length}
            </p>
          </div>
          <div style={{ backgroundColor: '#4f46e5', color: '#ffffff', padding: '10px 18px', borderRadius: '14px', fontWeight: '700', fontSize: '16px', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)' }}>
            Итого: {totalAmount.toLocaleString()} ₸
          </div>
        </div>

        {totalAmount > 0 && (
          <div style={{ marginBottom: '22px', padding: '14px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', height: '10px', borderRadius: '999px', overflow: 'hidden', backgroundColor: '#e2e8f0', marginBottom: '10px' }}>
              {CATEGORIES.map(cat => {
                const catSum = expenses.filter(e => e.category === cat).reduce((s, e) => s + Number(e.amount), 0);
                const percent = (catSum / totalAmount) * 100;
                if (percent === 0) return null;
                return (
                  <div
                    key={cat}
                    title={`${cat}: ${catSum.toLocaleString()} ₸ (${Math.round(percent)}%)`}
                    style={{ width: `${percent}%`, backgroundColor: BAR_COLORS[cat], transition: 'width 0.3s ease' }}
                  />
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '12px', color: '#475569' }}>
              {CATEGORIES.map(cat => {
                const catSum = expenses.filter(e => e.category === cat).reduce((s, e) => s + Number(e.amount), 0);
                if (catSum === 0) return null;
                return (
                  <span key={cat} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: BAR_COLORS[cat] }} />
                    {cat}: <b>{catSum.toLocaleString()} ₸</b>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="На что потратили?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...inputStyle, flex: '2 1 190px' }}
          />
          <input
            type="number"
            placeholder="Сумма (₸)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ ...inputStyle, flex: '1 1 110px' }}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ ...inputStyle, flex: '1 1 130px', cursor: 'pointer' }}
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat} style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
                {cat}
              </option>
            ))}
          </select>
          <button
            type="submit"
            style={{
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 20px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            + Добавить
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['Все', ...CATEGORIES].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '999px',
                  border: filter === tab ? '1px solid #4f46e5' : '1px solid #cbd5e1',
                  backgroundColor: filter === tab ? '#eef2ff' : '#ffffff',
                  color: filter === tab ? '#4338ca' : '#475569',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {checkedCount > 0 && (
            <button
              type="button"
              onClick={handleClearChecked}
              style={{
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Удалить отмеченные ({checkedCount})
            </button>
          )}
        </div>

        {filteredExpenses.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '24px 0', margin: 0 }}>
            В этой категории расходов пока нет
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {filteredExpenses.map(e => (
              <ExpenseItem
                key={e.id}
                expense={e}
                onHighlight={handleHighlight}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
