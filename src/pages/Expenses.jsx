import { useMemo, useState } from 'react'
import { Plus, TrendingDown } from 'lucide-react'
import { useFinance } from '../context/FinanceContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import SummaryCard from '../components/SummaryCard.jsx'
import Modal from '../components/Modal.jsx'
import TransactionForm from '../components/TransactionForm.jsx'
import TransactionTable from '../components/TransactionTable.jsx'
import { formatCurrency } from '../utils/storage'

export default function Expenses() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinance()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const expenses = useMemo(
    () => transactions.filter((t) => t.type === 'expense').sort((a, b) => new Date(b.date) - new Date(a.date)),
    [transactions]
  )
  const total = expenses.reduce((s, t) => s + Number(t.amount), 0)
  const thisMonth = expenses.filter((t) => {
    const d = new Date(t.date), n = new Date()
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
  }).reduce((s, t) => s + Number(t.amount), 0)

  function openAdd() { setEditing(null); setModalOpen(true) }
  function openEdit(tx) { setEditing(tx); setModalOpen(true) }
  function handleSubmit(data) {
    if (editing) updateTransaction(editing.id, data)
    else addTransaction(data)
    setModalOpen(false)
  }

  return (
    <div>
      <PageHeader title="Expenses" subtitle="Track everything you spend money on.">
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Expense</button>
      </PageHeader>

      <div className="summary-grid summary-grid-2">
        <SummaryCard label="Total Expenses" value={formatCurrency(total)} icon={TrendingDown} tone="danger" />
        <SummaryCard label="This Month" value={formatCurrency(thisMonth)} icon={TrendingDown} tone="warning" />
      </div>

      <div className="card">
        <h3>All Expense Entries</h3>
        <TransactionTable
          transactions={expenses}
          onEdit={openEdit}
          onDelete={deleteTransaction}
          emptyText="No expenses recorded yet. Click “Add Expense” to get started."
        />
      </div>

      <Modal open={modalOpen} title={editing ? 'Edit Expense' : 'Add Expense'} onClose={() => setModalOpen(false)}>
        <TransactionForm type="expense" initial={editing} onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}
