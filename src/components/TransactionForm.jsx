import { useState } from 'react'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/storage'

const today = () => new Date().toISOString().slice(0, 10)

export default function TransactionForm({ type, initial, onSubmit, onCancel }) {
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  const [form, setForm] = useState(() => ({
    amount: initial?.amount ?? '',
    category: initial?.category ?? categories[0],
    date: initial?.date ?? today(),
    note: initial?.note ?? '',
  }))
  const [error, setError] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!amount || amount <= 0) {
      setError('Enter an amount greater than 0.')
      return
    }
    if (!form.date) {
      setError('Please select a date.')
      return
    }
    onSubmit({
      type,
      amount,
      category: form.category,
      date: form.date,
      note: form.note.trim(),
    })
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}
      <div className="form-row">
        <label>Amount (₹)</label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          min="0"
          step="0.01"
          placeholder="0.00"
          autoFocus
        />
      </div>
      <div className="form-row">
        <label>Category</label>
        <select name="category" value={form.category} onChange={handleChange}>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="form-row">
        <label>Date</label>
        <input type="date" name="date" value={form.date} onChange={handleChange} />
      </div>
      <div className="form-row">
        <label>Note (optional)</label>
        <input
          type="text"
          name="note"
          value={form.note}
          onChange={handleChange}
          placeholder="e.g. Monthly grocery run"
        />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className={`btn ${type === 'income' ? 'btn-success' : 'btn-primary'}`}>
          {initial ? 'Save changes' : `Add ${type === 'income' ? 'income' : 'expense'}`}
        </button>
      </div>
    </form>
  )
}
