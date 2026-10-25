import { useMemo } from 'react'
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useFinance } from '../context/FinanceContext.jsx'
import SummaryCard from '../components/SummaryCard.jsx'
import PageHeader from '../components/PageHeader.jsx'
import TransactionTable from '../components/TransactionTable.jsx'
import { formatCurrency, CATEGORY_COLORS } from '../utils/storage'

function lastNMonthsKey(date, n) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function Dashboard() {
  const { transactions, totals } = useFinance()

  const monthlyData = useMemo(() => {
    const map = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      map[key] = { month: d.toLocaleDateString('en-IN', { month: 'short' }), income: 0, expense: 0, key }
    }
    transactions.forEach((t) => {
      const key = lastNMonthsKey(t.date)
      if (map[key]) {
        if (t.type === 'income') map[key].income += Number(t.amount)
        else map[key].expense += Number(t.amount)
      }
    })
    return Object.values(map)
  }, [transactions])

  const categoryData = useMemo(() => {
    const map = {}
    transactions.filter((t) => t.type === 'expense').forEach((t) => {
      map[t.category] = (map[t.category] || 0) + Number(t.amount)
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [transactions])

  const recent = transactions.slice(0, 6)

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Your complete financial overview at a glance." />

      <div className="summary-grid">
        <SummaryCard label="Total Income" value={formatCurrency(totals.totalIncome)} icon={TrendingUp} tone="success" />
        <SummaryCard label="Total Expenses" value={formatCurrency(totals.totalExpenses)} icon={TrendingDown} tone="danger" />
        <SummaryCard label="Available Balance" value={formatCurrency(totals.balance)} icon={Wallet} tone="primary" />
        <SummaryCard label="Total Savings" value={formatCurrency(totals.totalSavings)} icon={PiggyBank} tone="warning" />
      </div>

      <div className="chart-grid">
        <div className="card chart-card">
          <h3>Income vs Expenses</h3>
          <p className="muted small">Last 6 months</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}
              />
              <Legend />
              <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>Expenses by Category</h3>
          <p className="muted small">All time</p>
          {categoryData.length === 0 ? (
            <div className="empty-state">Add an expense to see the breakdown.</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card">
        <h3>Recent Transactions</h3>
        <TransactionTable transactions={recent} onEdit={() => {}} onDelete={() => {}} emptyText="No transactions yet. Add your first income or expense." />
      </div>
    </div>
  )
}
