import { Pencil, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '../utils/storage'

export default function TransactionTable({ transactions, onEdit, onDelete, emptyText }) {
  if (!transactions.length) {
    return <div className="empty-state">{emptyText || 'No transactions yet.'}</div>
  }
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Note</th>
            <th className="text-right">Amount</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{formatDate(t.date)}</td>
              <td><span className="pill">{t.category}</span></td>
              <td className="muted">{t.note || '—'}</td>
              <td className={`text-right amount ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
              </td>
              <td className="text-right">
                <div className="row-actions">
                  <button className="icon-btn" onClick={() => onEdit(t)} aria-label="Edit"><Pencil size={15} /></button>
                  <button className="icon-btn danger" onClick={() => onDelete(t.id)} aria-label="Delete"><Trash2 size={15} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
