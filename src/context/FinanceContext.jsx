import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { storage, uid } from '../utils/storage'

const FinanceContext = createContext(null)

export function FinanceProvider({ children }) {
  const [transactions, setTransactions] = useState(() => storage.loadTransactions())
  const [budgets, setBudgets] = useState(() => storage.loadBudgets())
  const [goals, setGoals] = useState(() => storage.loadGoals())

  useEffect(() => { storage.saveTransactions(transactions) }, [transactions])
  useEffect(() => { storage.saveBudgets(budgets) }, [budgets])
  useEffect(() => { storage.saveGoals(goals) }, [goals])

  // ---- Transactions ----
  function addTransaction(tx) {
    setTransactions((prev) => [{ id: uid(), ...tx }, ...prev])
  }
  function updateTransaction(id, patch) {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }
  function deleteTransaction(id) {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  // ---- Budgets ----
  function addBudget(b) {
    setBudgets((prev) => [{ id: uid(), ...b }, ...prev])
  }
  function updateBudget(id, patch) {
    setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }
  function deleteBudget(id) {
    setBudgets((prev) => prev.filter((b) => b.id !== id))
  }

  // ---- Goals ----
  function addGoal(g) {
    setGoals((prev) => [{ id: uid(), savedAmount: 0, ...g }, ...prev])
  }
  function updateGoal(id, patch) {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)))
  }
  function deleteGoal(id) {
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }
  function contributeToGoal(id, amount) {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, savedAmount: (g.savedAmount || 0) + amount } : g)))
  }

  // ---- Derived totals ----
  const totals = useMemo(() => {
    const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0)
    const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0)
    const balance = totalIncome - totalExpenses
    const totalGoalSavings = goals.reduce((s, g) => s + Number(g.savedAmount || 0), 0)
    const totalSavings = balance
    return { totalIncome, totalExpenses, balance, totalSavings, totalGoalSavings }
  }, [transactions, goals])

  const value = {
    transactions, addTransaction, updateTransaction, deleteTransaction,
    budgets, addBudget, updateBudget, deleteBudget,
    goals, addGoal, updateGoal, deleteGoal, contributeToGoal,
    totals,
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider')
  return ctx
}
