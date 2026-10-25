export default function SummaryCard({ label, value, icon: Icon, tone = 'default', sub }) {
  return (
    <div className={`summary-card tone-${tone}`}>
      <div className="summary-card-top">
        <span className="summary-label">{label}</span>
        <div className="summary-icon"><Icon size={18} /></div>
      </div>
      <div className="summary-value">{value}</div>
      {sub && <div className="summary-sub">{sub}</div>}
    </div>
  )
}
