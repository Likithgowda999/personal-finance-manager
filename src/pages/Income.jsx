import { useMemo, useState } from 'react'
import { Plus, TrendingUp } from 'lucide-react'
import { useFinance } from '../context/FinanceContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import SummaryCard from '../components/SummaryCard.jsx'
import Modal from '../components/Modal.jsx'
import TransactionForm from '../components/TransactionForm.jsx'
import TransactionTable from '../components/TransactionTable.jsx'
import { formatCurrency } from '../utils/storage'

export default function Income() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinance()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const income = useMemo(
    () => transactions.filter((t) => t.type === 'income').sort((a, b) => new Date(b.date) - new Date(a.date)),
    [transactions]
  )
  const total = income.reduce((s, t) => s + Number(t.amount), 0)
  const thisMonth = income.filter((t) => {
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
      <PageHeader title="Income" subtitle="Track every source of money coming in.">
        <button className="btn btn-success" onClick={openAdd}><Plus size={16} /> Add Income</button>
      </PageHeader>

      <div className="summary-grid summary-grid-2">
        <SummaryCard label="Total Income" value={formatCurrency(total)} icon={TrendingUp} tone="success" />
        <SummaryCard label="This Month" value={formatCurrency(thisMonth)} icon={TrendingUp} tone="primary" />
      </div>

      <div className="card">
        <h3>All Income Entries</h3>
        <TransactionTable
          transactions={income}
          onEdit={openEdit}
          onDelete={deleteTransaction}
          emptyText="No income recorded yet. Click “Add Income” to get started."
        />
      </div>

      <Modal open={modalOpen} title={editing ? 'Edit Income' : 'Add Income'} onClose={() => setModalOpen(false)}>
        <TransactionForm type="income" initial={editing} onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}
