import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { useFinance } from '../context/FinanceContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import { EXPENSE_CATEGORIES, formatCurrency, CATEGORY_COLORS } from '../utils/storage'

function BudgetForm({ initial, onSubmit, onCancel, usedCategories }) {
  const [form, setForm] = useState(() => ({
    category: initial?.category ?? EXPENSE_CATEGORIES.find((c) => !usedCategories.includes(c)) ?? EXPENSE_CATEGORIES[0],
    limit: initial?.limit ?? '',
  }))
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const limit = Number(form.limit)
    if (!limit || limit <= 0) { setError('Enter a limit greater than 0.'); return }
    onSubmit({ category: form.category, limit })
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}
      <div className="form-row">
        <label>Category</label>
        <select
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          disabled={!!initial}
        >
          {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="form-row">
        <label>Monthly Limit (₹)</label>
        <input
          type="number"
          value={form.limit}
          onChange={(e) => setForm((f) => ({ ...f, limit: e.target.value }))}
          min="0"
          step="1"
          autoFocus
        />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">{initial ? 'Save changes' : 'Add budget'}</button>
      </div>
    </form>
  )
}

export default function Budgets() {
  const { budgets, addBudget, updateBudget, deleteBudget, transactions } = useFinance()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const spentByCategory = useMemo(() => {
    const now = new Date()
    const map = {}
    transactions
      .filter((t) => t.type === 'expense')
      .filter((t) => {
        const d = new Date(t.date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      .forEach((t) => { map[t.category] = (map[t.category] || 0) + Number(t.amount) })
    return map
  }, [transactions])

  function openAdd() { setEditing(null); setModalOpen(true) }
  function openEdit(b) { setEditing(b); setModalOpen(true) }
  function handleSubmit(data) {
    if (editing) updateBudget(editing.id, data)
    else addBudget(data)
    setModalOpen(false)
  }

  return (
    <div>
      <PageHeader title="Budgets" subtitle="Set monthly spending limits by category.">
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Budget</button>
      </PageHeader>

      {budgets.length === 0 ? (
        <div className="card"><div className="empty-state">No budgets yet. Create one to start tracking your spending limits.</div></div>
      ) : (
        <div className="budget-grid">
          {budgets.map((b) => {
            const spent = spentByCategory[b.category] || 0
            const pct = Math.min(100, Math.round((spent / b.limit) * 100))
            const over = spent > b.limit
            return (
              <div className="card budget-card" key={b.id}>
                <div className="budget-card-top">
                  <span className="pill" style={{ background: (CATEGORY_COLORS[b.category] || '#64748b') + '22', color: CATEGORY_COLORS[b.category] || '#64748b' }}>
                    {b.category}
                  </span>
                  <div className="row-actions">
                    <button className="icon-btn" onClick={() => openEdit(b)}><Pencil size={14} /></button>
                    <button className="icon-btn danger" onClick={() => deleteBudget(b.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="budget-amounts">
                  <span className={over ? 'text-danger' : ''}>{formatCurrency(spent)}</span>
                  <span className="muted"> / {formatCurrency(b.limit)}</span>
                </div>
                <div className="progress-track">
                  <div
                    className={`progress-fill ${over ? 'over' : pct > 80 ? 'warn' : ''}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {over ? (
                  <p className="budget-note text-danger"><AlertTriangle size={13} /> Over budget by {formatCurrency(spent - b.limit)}</p>
                ) : (
                  <p className="budget-note muted">{pct}% used this month</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Modal open={modalOpen} title={editing ? 'Edit Budget' : 'Add Budget'} onClose={() => setModalOpen(false)}>
        <BudgetForm
          initial={editing}
          usedCategories={budgets.map((b) => b.category)}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
