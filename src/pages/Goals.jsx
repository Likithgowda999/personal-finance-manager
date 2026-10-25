import { useState } from 'react'
import { Plus, Pencil, Trash2, Target, PlusCircle } from 'lucide-react'
import { useFinance } from '../context/FinanceContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import { formatCurrency, formatDate } from '../utils/storage'

function GoalForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    name: initial?.name ?? '',
    targetAmount: initial?.targetAmount ?? '',
    savedAmount: initial?.savedAmount ?? 0,
    deadline: initial?.deadline ?? '',
  }))
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Give your goal a name.'); return }
    const target = Number(form.targetAmount)
    if (!target || target <= 0) { setError('Enter a target amount greater than 0.'); return }
    onSubmit({
      name: form.name.trim(),
      targetAmount: target,
      savedAmount: Number(form.savedAmount) || 0,
      deadline: form.deadline,
    })
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}
      <div className="form-row">
        <label>Goal name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Emergency Fund"
          autoFocus
        />
      </div>
      <div className="form-row">
        <label>Target amount (₹)</label>
        <input
          type="number"
          value={form.targetAmount}
          onChange={(e) => setForm((f) => ({ ...f, targetAmount: e.target.value }))}
          min="0"
        />
      </div>
      <div className="form-row">
        <label>Already saved (₹)</label>
        <input
          type="number"
          value={form.savedAmount}
          onChange={(e) => setForm((f) => ({ ...f, savedAmount: e.target.value }))}
          min="0"
        />
      </div>
      <div className="form-row">
        <label>Target date (optional)</label>
        <input
          type="date"
          value={form.deadline}
          onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
        />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">{initial ? 'Save changes' : 'Add goal'}</button>
      </div>
    </form>
  )
}

function ContributeForm({ onSubmit, onCancel }) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  function handleSubmit(e) {
    e.preventDefault()
    const n = Number(amount)
    if (!n || n <= 0) { setError('Enter an amount greater than 0.'); return }
    onSubmit(n)
  }
  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}
      <div className="form-row">
        <label>Amount to add (₹)</label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" autoFocus />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-success">Add contribution</button>
      </div>
    </form>
  )
}

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal, contributeToGoal } = useFinance()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [contributing, setContributing] = useState(null)

  function openAdd() { setEditing(null); setModalOpen(true) }
  function openEdit(g) { setEditing(g); setModalOpen(true) }
  function handleSubmit(data) {
    if (editing) updateGoal(editing.id, data)
    else addGoal(data)
    setModalOpen(false)
  }

  return (
    <div>
      <PageHeader title="Financial Goals" subtitle="Set targets and track your progress toward them.">
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Goal</button>
      </PageHeader>

      {goals.length === 0 ? (
        <div className="card"><div className="empty-state">No goals yet. Create one — a house down payment, an emergency fund, a trip.</div></div>
      ) : (
        <div className="budget-grid">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((Number(g.savedAmount || 0) / g.targetAmount) * 100))
            const reached = pct >= 100
            return (
              <div className="card budget-card" key={g.id}>
                <div className="budget-card-top">
                  <span className="goal-name"><Target size={15} /> {g.name}</span>
                  <div className="row-actions">
                    <button className="icon-btn" onClick={() => openEdit(g)}><Pencil size={14} /></button>
                    <button className="icon-btn danger" onClick={() => deleteGoal(g.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="budget-amounts">
                  <span className={reached ? 'text-success' : ''}>{formatCurrency(g.savedAmount)}</span>
                  <span className="muted"> / {formatCurrency(g.targetAmount)}</span>
                </div>
                <div className="progress-track">
                  <div className={`progress-fill ${reached ? 'success' : ''}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="budget-note muted">
                  {reached ? 'Goal reached! 🎉' : `${pct}% funded`}
                  {g.deadline && ` · Target: ${formatDate(g.deadline)}`}
                </p>
                <button className="btn btn-ghost btn-block" onClick={() => setContributing(g)}>
                  <PlusCircle size={14} /> Add contribution
                </button>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={modalOpen} title={editing ? 'Edit Goal' : 'Add Goal'} onClose={() => setModalOpen(false)}>
        <GoalForm initial={editing} onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} />
      </Modal>

      <Modal open={!!contributing} title={`Contribute to ${contributing?.name || ''}`} onClose={() => setContributing(null)}>
        <ContributeForm
          onSubmit={(amount) => { contributeToGoal(contributing.id, amount); setContributing(null) }}
          onCancel={() => setContributing(null)}
        />
      </Modal>
    </div>
  )
}
