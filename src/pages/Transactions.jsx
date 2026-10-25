import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useFinance } from '../context/FinanceContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import TransactionForm from '../components/TransactionForm.jsx'
import TransactionTable from '../components/TransactionTable.jsx'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/storage'

export default function Transactions() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinance()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [newType, setNewType] = useState('expense')

  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [search, setSearch] = useState('')

  const allCategories = useMemo(
    () => Array.from(new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES])),
    []
  )

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => (typeFilter === 'all' ? true : t.type === typeFilter))
      .filter((t) => (categoryFilter === 'all' ? true : t.category === categoryFilter))
      .filter((t) => (search ? (t.note || '').toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()) : true))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [transactions, typeFilter, categoryFilter, search])

  function openAdd(type) { setNewType(type); setEditing(null); setModalOpen(true) }
  function openEdit(tx) { setNewType(tx.type); setEditing(tx); setModalOpen(true) }
  function handleSubmit(data) {
    if (editing) updateTransaction(editing.id, data)
    else addTransaction(data)
    setModalOpen(false)
  }

  return (
    <div>
      <PageHeader title="Transactions" subtitle="Every income and expense entry in one place.">
        <button className="btn btn-success" onClick={() => openAdd('income')}><Plus size={16} /> Income</button>
        <button className="btn btn-primary" onClick={() => openAdd('expense')}><Plus size={16} /> Expense</button>
      </PageHeader>

      <div className="card">
        <div className="filters-row">
          <input
            type="text"
            placeholder="Search by note or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">All categories</option>
            {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <TransactionTable
          transactions={filtered}
          onEdit={openEdit}
          onDelete={deleteTransaction}
          emptyText="No transactions match your filters."
        />
      </div>

      <Modal open={modalOpen} title={editing ? 'Edit Transaction' : `Add ${newType === 'income' ? 'Income' : 'Expense'}`} onClose={() => setModalOpen(false)}>
        <TransactionForm type={newType} initial={editing} onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}
