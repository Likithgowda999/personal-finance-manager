const KEYS = {
  TRANSACTIONS: 'pfm_transactions',
  BUDGETS: 'pfm_budgets',
  GOALS: 'pfm_goals',
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to load', key, e)
    return fallback
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Failed to save', key, e)
  }
}

export const storage = {
  KEYS,
  loadTransactions: () => load(KEYS.TRANSACTIONS, []),
  saveTransactions: (v) => save(KEYS.TRANSACTIONS, v),
  loadBudgets: () => load(KEYS.BUDGETS, []),
  saveBudgets: (v) => save(KEYS.BUDGETS, v),
  loadGoals: () => load(KEYS.GOALS, []),
  saveGoals: (v) => save(KEYS.GOALS, v),
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function formatCurrency(amount) {
  const n = Number(amount) || 0
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

export function formatDate(dateStr) {
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const EXPENSE_CATEGORIES = [
  'Food & Dining', 'Transportation', 'Housing', 'Utilities', 'Entertainment',
  'Healthcare', 'Shopping', 'Education', 'Travel', 'Insurance', 'Other',
]

export const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Business', 'Investments', 'Gifts', 'Rental', 'Other',
]

export const CATEGORY_COLORS = {
  'Food & Dining': '#f59e0b',
  'Transportation': '#3b82f6',
  'Housing': '#8b5cf6',
  'Utilities': '#06b6d4',
  'Entertainment': '#ec4899',
  'Healthcare': '#ef4444',
  'Shopping': '#f97316',
  'Education': '#14b8a6',
  'Travel': '#6366f1',
  'Insurance': '#84cc16',
  'Other': '#64748b',
}
