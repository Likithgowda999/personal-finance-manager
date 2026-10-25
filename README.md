# Wealthy — Personal Finance & Expense Management System

A complete, frontend-only personal finance dashboard built with React, Vite, and Recharts. No backend, no login, no database — everything is stored in your browser's LocalStorage.

## Features

- **Dashboard** — Total Income, Total Expenses, Available Balance, and Total Savings summary cards, an Income vs Expense bar chart (last 6 months), an expense-by-category pie chart, and a recent transactions list.
- **Income** — Add, edit, and delete income entries by category (Salary, Freelance, Business, Investments, etc.), with totals for all-time and this month.
- **Expenses** — Add, edit, and delete expense entries by category (Food, Transportation, Housing, Utilities, etc.), with totals for all-time and this month.
- **Transactions** — A unified, searchable, filterable view of every income and expense entry.
- **Budgets** — Set a monthly spending limit per category and track progress with a live progress bar (warns when you're close to or over budget).
- **Goals** — Set savings goals with a target amount and optional target date, add contributions, and track progress visually.
- **Reports** — Income vs expense trend line chart, top spending categories bar chart, savings rate, and CSV export of all transactions, filterable by date range (3/6/12 months or all time).

## Tech Stack

- React 18 + Vite
- React Router (client-side routing)
- Recharts (charts)
- Lucide React (icons)
- Plain CSS (no framework)
- Browser LocalStorage for persistence — no backend, database, or auth of any kind

## Getting Started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

The `dist/` folder produced by `npm run build` is fully static and can be hosted anywhere (Netlify, Vercel, GitHub Pages, S3, etc.) — there's no server component.

## Data & Privacy

All data (transactions, budgets, goals) lives entirely in your browser's LocalStorage under these keys:

- `pfm_transactions`
- `pfm_budgets`
- `pfm_goals`

Nothing is ever sent to a server. Clearing your browser's site data for this app will erase everything, so export your data via the CSV button on the Reports page if you want a backup.

## Project Structure

```
src/
  components/     Reusable UI: Sidebar, Modal, forms, tables, cards
  context/        FinanceContext — global state + LocalStorage sync
  pages/          Dashboard, Income, Expenses, Transactions, Budgets, Goals, Reports
  utils/          LocalStorage helpers, formatting, category lists
  App.jsx         Route definitions
  main.jsx        App entry point
```
