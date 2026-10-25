import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell,
} from 'recharts'
import { useFinance } from '../context/FinanceContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import { formatCurrency, CATEGORY_COLORS } from '../utils/storage'

const RANGE_OPTIONS = [
  { key: '3m', label: 'Last 3 months', months: 3 },
  { key: '6m', label: 'Last 6 months', months: 6 },
  { key: '12m', label: 'Last 12 months', months: 12 },
  { key: 'all', label: 'All time', months: null },
]

export default function Reports() {
  const { transactions } = useFinance()
  const [range, setRange] = useState('6m')

  const filtered = useMemo(() => {
    const opt = RANGE_OPTIONS.find((r) => r.key === range)
    if (!opt || opt.months === null) return transactions
    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - opt.months)
    cutoff.setDate(1)
    return transactions.filter((t) => new Date(t.date) >= cutoff)
  }, [transactions, range])

  const trend = useMemo(() => {
    const opt = RANGE_OPTIONS.find((r) => r.key === range)
    const months = opt?.months || 12
    const map = {}
    const now = new Date()
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      map[key] = { month: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }), income: 0, expense: 0 }
    }
    filtered.forEach((t) => {
      const d = new Date(t.date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (map[key]) {
        if (t.type === 'income') map[key].income += Number(t.amount)
        else map[key].expense += Number(t.amount)
      }
    })
    return Object.values(map)
  }, [filtered, range])

  const categoryTotals = useMemo(() => {
    const map = {}
    filtered.filter((t) => t.type === 'expense').forEach((t) => {
      map[t.category] = (map[t.category] || 0) + Number(t.amount)
    })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filtered])

  const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0

  function exportCSV() {
    const header = 'Date,Type,Category,Amount,Note\n'
    const rows = [...transactions]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((t) => [t.date, t.type, t.category, t.amount, (t.note || '').replace(/,/g, ';')].join(','))
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transactions.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <PageHeader title="Reports" subtitle="Understand your spending patterns over time.">
        <select value={range} onChange={(e) => setRange(e.target.value)}>
          {RANGE_OPTIONS.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
        </select>
        <button className="btn btn-ghost" onClick={exportCSV}><Download size={16} /> Export CSV</button>
      </PageHeader>

      <div className="summary-grid summary-grid-3">
        <div className="card stat-card">
          <span className="muted small">Total Income</span>
          <div className="stat-value text-success">{formatCurrency(income)}</div>
        </div>
        <div className="card stat-card">
          <span className="muted small">Total Expenses</span>
          <div className="stat-value text-danger">{formatCurrency(expense)}</div>
        </div>
        <div className="card stat-card">
          <span className="muted small">Savings Rate</span>
          <div className={`stat-value ${savingsRate >= 0 ? 'text-success' : 'text-danger'}`}>{savingsRate}%</div>
        </div>
      </div>

      <div className="card chart-card">
        <h3>Income vs Expense Trend</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
            <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
            <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Legend />
            <Line type="monotone" dataKey="income" name="Income" stroke="#22c55e" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card chart-card">
        <h3>Top Spending Categories</h3>
        {categoryTotals.length === 0 ? (
          <div className="empty-state">No expenses in this range.</div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(220, categoryTotals.length * 42)}>
            <BarChart data={categoryTotals} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
              <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={12} width={120} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {categoryTotals.map((entry, i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#64748b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
